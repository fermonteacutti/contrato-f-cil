import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type CompanyType = "mei" | "ei" | "slu" | "ltda";
export type ProcessStatus = "rascunho" | "aguardando_docs" | "docs_gerados" | "protocolado" | "concluido";

export interface ProcessSocio {
  nome: string;
  cpf: string;
  percentual: number;
}

export interface ProcessAddress {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface ProcessFormData {
  nome_empresarial?: string;
  objeto_social?: string;
  cnae_principal?: string;
  capital_social?: string;
  data_inicio?: string;
  endereco?: ProcessAddress;
  socios?: ProcessSocio[];
}

export interface Process {
  id: string;
  user_id: string;
  client_id: string;
  company_type: CompanyType;
  status: ProcessStatus;
  form_data: ProcessFormData | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string } | null;
}

export interface ProcessInput {
  client_id: string;
  company_type: CompanyType;
  status: ProcessStatus;
  form_data?: ProcessFormData | null;
}

const PROCESSES_KEY = ["processes"];

export const useProcesses = () => {
  const queryClient = useQueryClient();

  const processesQuery = useQuery({
    queryKey: PROCESSES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processes")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Process[];
    },
  });

  const createProcess = useMutation({
    mutationFn: async (input: ProcessInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("processes")
        .insert({ ...input, user_id: user.id })
        .select("*, clients(name)")
        .single();
      if (error) throw error;
      return data as Process;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROCESSES_KEY }),
  });

  const updateProcess = useMutation({
    mutationFn: async ({ id, ...input }: Partial<ProcessInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("processes")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, clients(name)")
        .single();
      if (error) throw error;
      return data as Process;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROCESSES_KEY }),
  });

  return { processesQuery, createProcess, updateProcess };
};
