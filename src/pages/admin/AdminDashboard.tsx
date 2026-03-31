import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileText, ClipboardList, CreditCard, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

const COLORS: Record<string, string> = {
  mei: "hsl(210, 80%, 55%)",
  ei: "hsl(150, 60%, 45%)",
  slu: "hsl(35, 90%, 55%)",
  ltda: "hsl(280, 60%, 55%)",
};

const statusVariant = (status: string) => {
  switch (status) {
    case "completed": return "default";
    case "in_progress": return "secondary";
    case "pending": return "outline";
    default: return "outline";
  }
};

const AdminDashboard = () => {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_metrics");
      if (error) throw error;
      return data as {
        total_users: number;
        processes_this_month: number;
        documents_this_month: number;
        active_subscriptions: number;
      };
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ["admin-processes-by-type"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processes")
        .select("company_type");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((p: any) => {
        const t = (p.company_type || "outro").toUpperCase();
        counts[t] = (counts[t] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  const { data: recentProcesses } = useQuery({
    queryKey: ["admin-recent-processes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processes")
        .select("*, clients(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const metricCards = [
    { label: "Total de Usuários", value: metrics?.total_users ?? 0, icon: Users },
    { label: "Processos no Mês", value: metrics?.processes_this_month ?? 0, icon: ClipboardList },
    { label: "Documentos no Mês", value: metrics?.documents_this_month ?? 0, icon: FileText },
    { label: "Assinaturas Ativas", value: metrics?.active_subscriptions ?? 0, icon: CreditCard },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <Card key={m.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Processos por Tipo de Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
              <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {(chartData || []).map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name.toLowerCase()] || "hsl(var(--primary))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Processes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos 10 Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recentProcesses || []).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.clients?.name ?? "—"}</TableCell>
                  <TableCell>{(p.company_type || "").toUpperCase()}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>{p.created_at ? format(new Date(p.created_at), "dd/MM/yyyy") : "—"}</TableCell>
                </TableRow>
              ))}
              {(!recentProcesses || recentProcesses.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum processo encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
