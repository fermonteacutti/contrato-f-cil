import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  aguardando_docs: "Aguardando Docs",
  docs_gerados: "Docs Gerados",
  protocolado: "Protocolado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  aguardando_docs: "bg-warning/15 text-warning border-warning/30",
  docs_gerados: "bg-info/15 text-info border-info/30",
  protocolado: "bg-primary/15 text-primary border-primary/30",
  concluido: "bg-success/15 text-success border-success/30",
  cancelado: "bg-destructive/15 text-destructive border-destructive/30",
};

export const typeLabels: Record<string, string> = {
  mei: "MEI",
  ei: "EI",
  slu: "SLU",
  ltda: "LTDA",
};

export function formatDateBR(dateStr: string | Date): string {
  try {
    return format(new Date(dateStr), "dd/MM/yyyy");
  } catch {
    return String(dateStr);
  }
}

export function formatDateTimeBR(dateStr: string | Date): string {
  try {
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm");
  } catch {
    return String(dateStr);
  }
}
