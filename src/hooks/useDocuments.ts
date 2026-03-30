import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Document {
  id: string;
  process_id: string;
  template_id: string | null;
  name: string;
  file_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useDocuments = (processId: string) => {
  const queryClient = useQueryClient();
  const DOCS_KEY = ["documents", processId];

  const documentsQuery = useQuery({
    queryKey: DOCS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("process_id", processId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!processId,
  });

  const generateDocuments = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const res = await fetch(
        "https://pafbyysujmeuhnvpmokq.supabase.co/functions/v1/generate-documents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ process_id: processId }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erro ${res.status}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCS_KEY });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    },
  });

  const getSignedUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  };

  return { documentsQuery, generateDocuments, getSignedUrl };
};
