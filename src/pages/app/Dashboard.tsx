import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Users, FileText, Plus, ArrowUpRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Processos Ativos", value: "12", icon: ClipboardList, change: "+3 este mês" },
  { label: "Clientes", value: "28", icon: Users, change: "+5 este mês" },
  { label: "Documentos Gerados", value: "47", icon: FileText, change: "+8 este mês" },
];

const recentProcesses = [
  { client: "Maria Silva", type: "LTDA", status: "Em Geração", date: "25/03/2026" },
  { client: "João Santos", type: "MEI", status: "Concluído", date: "24/03/2026" },
  { client: "Ana Costa", type: "SLU", status: "Rascunho", date: "23/03/2026" },
  { client: "Pedro Oliveira", type: "EI", status: "Documentos Prontos", date: "22/03/2026" },
];

const statusColors: Record<string, string> = {
  "Rascunho": "bg-muted text-muted-foreground",
  "Em Geração": "bg-info/10 text-info",
  "Documentos Prontos": "bg-accent/10 text-accent",
  "Concluído": "bg-success/10 text-success",
};

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumo dos seus processos e atividades</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-600">
          <Link to="/app/processos/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="font-heading text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-success mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
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
          <div className="space-y-3">
            {recentProcesses.map((process, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-secondary-foreground">{process.type}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{process.client}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {process.date}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[process.status] || "bg-muted text-muted-foreground"}`}>
                  {process.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
