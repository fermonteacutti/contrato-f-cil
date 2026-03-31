import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TemplateRow {
  id: string;
  name: string;
  company_type: string | null;
  version: string | null;
  is_active: boolean;
  created_at: string | null;
}

const AdminTemplates = () => {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TemplateRow[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("templates")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      toast.success("Template atualizado.");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-foreground">Gerenciar Templates</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos os Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo de Empresa</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(templates || []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{(t.company_type || "—").toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{t.version || "—"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={t.is_active}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: t.id, is_active: checked })}
                    />
                  </TableCell>
                  <TableCell>{t.created_at ? format(new Date(t.created_at), "dd/MM/yyyy") : "—"}</TableCell>
                </TableRow>
              ))}
              {(!templates || templates.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum template encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTemplates;
