import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Users, FileText, Plus, CreditCard, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import { useClients } from "@/hooks/useClients";
import { useDocuments } from "@/hooks/useDocuments";
import { useProfile } from "@/hooks/useProfile";
import { statusLabels, statusColors, typeLabels, formatDateBR } from "@/lib/formatters";

const Dashboard = () => {
  const navigate = useNavigate();
  const { processesQuery } = useProcesses();
  const { clientsQuery } = useClients();
  const { data: profile } = useProfile();

  const processes = processesQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const isLoading = processesQuery.isLoading || clientsQuery.isLoading;

  const now = new Date();
  const processesThisMonth = processes.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const recentProcesses = processes.slice(0, 5);

  const stats = [
    { label: "Processos este mês", value: processesThisMonth, icon: ClipboardList },
    { label: "Clientes cadastrados", value: clients.length, icon: Users },
    { label: "Créditos disponíveis", value: profile?.credits_remaining ?? 0, icon: CreditCard },
    { label: "Processos totais", value: processes.length, icon: FileText },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumo dos seus processos e atividades</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold">
          <Link to="/app/processos/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-card border-border/50">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="font-heading text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent processes */}
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">Processos Recentes</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link to="/app/processos">Ver todos</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentProcesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Nenhum processo criado ainda</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/app/processos/novo">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro processo
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProcesses.map((process) => (
                    <TableRow
                      key={process.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/app/processos/${process.id}`)}
                    >
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{process.clients?.name || "—"}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          {typeLabels[process.company_type] || process.company_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[process.status] || "bg-muted text-muted-foreground"}>
                          {statusLabels[process.status] || process.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateBR(process.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
