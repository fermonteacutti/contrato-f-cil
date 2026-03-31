import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  plan: string | null;
  credits_remaining: number;
  role: string | null;
  created_at: string | null;
}

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [creditModal, setCreditModal] = useState<ProfileRow | null>(null);
  const [roleModal, setRoleModal] = useState<ProfileRow | null>(null);
  const [newCredits, setNewCredits] = useState(0);
  const [newRole, setNewRole] = useState("user");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProfileRow[];
    },
  });

  const updateCredits = useMutation({
    mutationFn: async ({ id, credits }: { id: string; credits: number }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ credits_remaining: credits })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Créditos atualizados com sucesso.");
      setCreditModal(null);
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role atualizada com sucesso.");
      setRoleModal(null);
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const filtered = (users || []).filter((u) =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">Todos os Usuários</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email || u.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{u.plan || "free"}</Badge>
                  </TableCell>
                  <TableCell>{u.credits_remaining}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role || "user"}</Badge>
                  </TableCell>
                  <TableCell>{u.created_at ? format(new Date(u.created_at), "dd/MM/yyyy") : "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCreditModal(u);
                        setNewCredits(u.credits_remaining);
                      }}
                    >
                      Créditos
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRoleModal(u);
                        setNewRole(u.role || "user");
                      }}
                    >
                      Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum usuário encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Credit Modal */}
      <Dialog open={!!creditModal} onOpenChange={() => setCreditModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Créditos</DialogTitle>
            <DialogDescription>
              Alterar créditos de {creditModal?.full_name || "usuário"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              min={0}
              value={newCredits}
              onChange={(e) => setNewCredits(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditModal(null)}>Cancelar</Button>
            <Button
              onClick={() => creditModal && updateCredits.mutate({ id: creditModal.id, credits: newCredits })}
              disabled={updateCredits.isPending}
            >
              {updateCredits.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Modal */}
      <Dialog open={!!roleModal} onOpenChange={() => setRoleModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Role</DialogTitle>
            <DialogDescription>
              Alterar permissão de {roleModal?.full_name || "usuário"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModal(null)}>Cancelar</Button>
            <Button
              onClick={() => roleModal && updateRole.mutate({ id: roleModal.id, role: newRole })}
              disabled={updateRole.isPending}
            >
              {updateRole.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
