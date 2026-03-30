import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, FileText, Loader2, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { useProcesses, ProcessStatus, CompanyType } from "@/hooks/useProcesses";
import { useDocuments } from "@/hooks/useDocuments";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusConfig: Record<ProcessStatus, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  aguardando_docs: { label: "Aguardando Docs", className: "bg-warning/15 text-warning border-warning/30" },
  docs_gerados: { label: "Docs Gerados", className: "bg-info/15 text-info border-info/30" },
  protocolado: { label: "Protocolado", className: "bg-primary/15 text-primary border-primary/30" },
  concluido: { label: "Concluído", className: "bg-success/15 text-success border-success/30" },
};

const typeLabels: Record<CompanyType, string> = {
  mei: "MEI", ei: "EI", slu: "SLU", ltda: "LTDA",
};

const protocolSteps = [
  "Verificar dados e documentos gerados",
  "Consultar viabilidade na prefeitura",
  "Protocolar na JUCESP (via VRE ou presencial)",
  "Acompanhar deferimento do registro",
  "Obter CNPJ na Receita Federal",
  "Realizar inscrições estadual e municipal",
];

const ProcessoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const { processesQuery } = useProcesses();
  const { documentsQuery, generateDocuments, getSignedUrl } = useDocuments(id || "");

  const process = processesQuery.data?.find((p) => p.id === id);
  const documents = documentsQuery.data ?? [];

  const canGenerate = process?.status === "rascunho" || process?.status === "aguardando_docs";
  const hasDocuments = process?.status === "docs_gerados" || process?.status === "protocolado" || process?.status === "concluido";

  const handleGenerate = async () => {
    try {
      await generateDocuments.mutateAsync();
      toast.success("Documentos gerados com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar documentos");
    }
  };

  const handleDownload = async (filePath: string) => {
    try {
      const url = await getSignedUrl(filePath);
      window.open(url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar link de download");
    }
  };

  if (processesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Processo não encontrado.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/app/processos">Voltar aos processos</Link>
        </Button>
      </div>
    );
  }

  const sc = statusConfig[process.status] || statusConfig.rascunho;

  // Determine which protocol step is "current" based on status
  const statusStepMap: Record<ProcessStatus, number> = {
    rascunho: -1, aguardando_docs: 0, docs_gerados: 1, protocolado: 3, concluido: 6,
  };
  const currentStep = statusStepMap[process.status] ?? -1;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link to="/app/processos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {process.clients?.name || "Processo"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {process.company_name || "Sem nome empresarial"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-bold text-sm">
              {typeLabels[process.company_type]}
            </Badge>
            <Badge className={cn("text-sm", sc.className)}>{sc.label}</Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Dados do Processo */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Dados do Processo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Informações Gerais</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atividade:</span>
                  <span className="text-foreground text-right max-w-[60%]">{process.business_activity || "—"}</span>
                </div>
                {process.cnae && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CNAE:</span>
                    <span className="text-foreground">{process.cnae}</span>
                  </div>
                )}
                {process.start_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Início:</span>
                    <span className="text-foreground">{process.start_date}</span>
                  </div>
                )}
                {process.capital != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital:</span>
                    <span className="text-foreground">
                      R$ {Number(process.capital).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {process.address && (
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
                <p className="text-sm text-foreground">
                  {[process.address.logradouro, process.address.numero, process.address.complemento,
                    process.address.bairro, process.address.cidade, process.address.estado, process.address.cep]
                    .filter(Boolean).join(", ")}
                </p>
              </CardContent>
            </Card>
          )}

          {process.socios && process.socios.length > 0 && (
            <Card className="border-border/50 md:col-span-2">
              <CardContent className="p-5 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Sócios</h3>
                <div className="space-y-2">
                  {process.socios.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="text-foreground font-medium">{s.nome}</span>
                        <span className="text-muted-foreground ml-2">CPF: {s.cpf}</span>
                      </div>
                      <Badge variant="outline">{s.percentual}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Separator />

      {/* Documentos */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Documentos</h2>

        {canGenerate && (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Sparkles className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-heading font-semibold text-foreground mb-1">Gerar Documentos</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Gere automaticamente os documentos necessários para o registro desta empresa.
              </p>
              <Button onClick={handleGenerate} disabled={generateDocuments.isPending}>
                {generateDocuments.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                {generateDocuments.isPending ? "Gerando..." : "Gerar Documentos"}
              </Button>
            </CardContent>
          </Card>
        )}

        {hasDocuments && (
          <>
            {documentsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhum documento encontrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                      {doc.file_path && (
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.file_path!)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Separator />

      {/* Próximos Passos */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Próximos Passos</h2>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <ol className="space-y-3">
              {protocolSteps.map((stepText, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <li key={i} className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <Circle className={cn("w-5 h-5 shrink-0 mt-0.5", active ? "text-primary" : "text-muted-foreground/40")} />
                    )}
                    <span className={cn("text-sm", done ? "text-muted-foreground line-through" : active ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {stepText}
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ProcessoDetalhe;
