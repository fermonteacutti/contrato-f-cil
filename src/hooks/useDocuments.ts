import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseUrl, supabaseAnonKey } from "@/lib/supabase";

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      let accessToken = session?.access_token;
      if (!accessToken) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        accessToken = refreshed.session?.access_token;
      }

      if (!accessToken) throw new Error("Sessão expirada. Faça login novamente.");

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL || supabaseUrl}/functions/v1/generate-documents`;

      const res = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey,
        },
        body: JSON.stringify({ process_id: processId }),
      });

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
