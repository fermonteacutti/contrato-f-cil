import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useProcesses, ProcessStatus, CompanyType } from "@/hooks/useProcesses";
import { format } from "date-fns";

const statusConfig: Record<ProcessStatus, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  aguardando_docs: { label: "Aguardando Docs", className: "bg-warning/15 text-warning border-warning/30" },
  docs_gerados: { label: "Docs Gerados", className: "bg-info/15 text-info border-info/30" },
  protocolado: { label: "Protocolado", className: "bg-primary/15 text-primary border-primary/30" },
  concluido: { label: "Concluído", className: "bg-success/15 text-success border-success/30" },
};

const typeLabels: Record<CompanyType, string> = {
  mei: "MEI",
  ei: "EI",
  slu: "SLU",
  ltda: "LTDA",
};

const Processos = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { processesQuery } = useProcesses();

  const processes = processesQuery.data ?? [];

  const filtered = processes.filter((p) => {
    const clientName = p.clients?.name || "";
    const companyName = p.form_data?.nome_empresarial || "";
    const matchesSearch =
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      companyName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || p.company_type === filterType;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Processos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {processes.length} processo{processes.length !== 1 ? "s" : ""} no total
          </p>
        </div>
        <Button asChild className="font-heading font-semibold">
          <Link to="/app/processos/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou empresa..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="mei">MEI</SelectItem>
            <SelectItem value="ei">EI</SelectItem>
            <SelectItem value="slu">SLU</SelectItem>
            <SelectItem value="ltda">LTDA</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="aguardando_docs">Aguardando Docs</SelectItem>
            <SelectItem value="docs_gerados">Docs Gerados</SelectItem>
            <SelectItem value="protocolado">Protocolado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {processesQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h3 className="font-heading font-semibold text-foreground mb-1">Nenhum processo encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {processes.length === 0
              ? "Comece criando seu primeiro processo."
              : "Tente ajustar os filtros de busca."}
          </p>
          {processes.length === 0 && (
            <Button asChild>
              <Link to="/app/processos/novo">
                <Plus className="w-4 h-4 mr-2" />
                Novo Processo
              </Link>
            </Button>
          )}
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((process) => {
                const sc = statusConfig[process.status] || statusConfig.rascunho;
                return (
                  <TableRow key={process.id} className="cursor-pointer" onClick={() => navigate(`/app/processos/${process.id}`)}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{process.clients?.name || "—"}</p>
                        {process.company_name && (
                          <p className="text-xs text-muted-foreground">{process.company_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold">
                        {typeLabels[process.company_type] || process.company_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={sc.className}>{sc.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(process.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/app/processos/novo?id=${process.id}`); }}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Processos;
