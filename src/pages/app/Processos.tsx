import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const mockProcesses = [
  { id: 1, client: "Maria Silva", type: "LTDA", status: "Em Geração", date: "25/03/2026", docs: 4 },
  { id: 2, client: "João Santos", type: "MEI", status: "Concluído", date: "24/03/2026", docs: 3 },
  { id: 3, client: "Ana Costa", type: "SLU", status: "Rascunho", date: "23/03/2026", docs: 0 },
  { id: 4, client: "Pedro Oliveira", type: "EI", status: "Documentos Prontos", date: "22/03/2026", docs: 4 },
  { id: 5, client: "Lucia Ferreira", type: "MEI", status: "Em Protocolo", date: "21/03/2026", docs: 3 },
  { id: 6, client: "Carlos Lima", type: "LTDA", status: "Rascunho", date: "20/03/2026", docs: 0 },
];

const statusColors: Record<string, string> = {
  "Rascunho": "bg-muted text-muted-foreground",
  "Em Geração": "bg-info/10 text-info",
  "Documentos Prontos": "bg-accent/10 text-accent",
  "Em Protocolo": "bg-warning/10 text-warning",
  "Concluído": "bg-success/10 text-success",
};

const typeColors: Record<string, string> = {
  "MEI": "bg-success/10 text-success",
  "EI": "bg-info/10 text-info",
  "SLU": "bg-accent/10 text-accent",
  "LTDA": "bg-primary/10 text-primary",
};

const Processos = () => {
  const [search, setSearch] = useState("");
  const filtered = mockProcesses.filter((p) =>
    p.client.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Processos</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockProcesses.length} processos no total</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-600">
          <Link to="/app/processos/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar processos..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((process) => (
          <Card key={process.id} className="shadow-card border-border/50 hover:shadow-card-hover transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${typeColors[process.type] || ""}`}>
                  {process.type}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{process.client}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {process.date}
                    {process.docs > 0 && <span className="ml-2">• {process.docs} docs</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[process.status] || ""}`}>
                  {process.status}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Processos;
