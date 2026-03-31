import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { CompanyType } from "@/hooks/useProcesses";

export interface Document {
  id: string;
  process_id: string;
  user_id: string;
  document_type: string | null;
  file_name: string;
  file_path: string | null;
  template_version: string | null;
  created_at: string;
}

const TEMPLATES_MAP: Record<string, string[]> = {
  mei:  ['guia_mei', 'checklist_redesim_mei'],
  ei:   ['requerimento_ei', 'checklist_jucesp_ei'],
  slu:  ['ato_constitutivo_slu', 'checklist_jucesp_slu'],
  ltda: ['contrato_social_ltda', 'checklist_jucesp_ltda'],
};

function formatTemplateName(templateType: string): string {
  return templateType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function fetchTemplateBuffer(templateFile: string): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from("templates")
    .createSignedUrl(templateFile, 300);
  if (error) throw new Error(`Erro ao obter URL do template ${templateFile}: ${error.message}`);
  const res = await fetch(data.signedUrl);
  if (!res.ok) throw new Error(`Erro ao baixar template ${templateFile}: ${res.status}`);
  return res.arrayBuffer();
}

function buildRenderData(process: any) {
  const fd = process.form_data || {};
  const client = process.clients || {};
  const endereco = fd.endereco || {};

  return {
    NOME_EMPRESARIAL: fd.nome_empresarial ?? '',
    OBJETO_SOCIAL: fd.objeto_social ?? '',
    CNAE_PRINCIPAL: fd.cnae_principal ?? '',
    CAPITAL_SOCIAL: fd.capital_social ?? '',
    CAPITAL_SOCIAL_EXTENSO: `R$ ${fd.capital_social ?? ''}`,
    DATA_INICIO_ATIVIDADES: fd.data_inicio ?? '',
    PRAZO_SOCIEDADE: 'indeterminado',
    ENDERECO_COMPLETO: [
      endereco.logradouro,
      endereco.numero,
      endereco.complemento,
      endereco.bairro,
    ].filter(Boolean).join(', '),
    CIDADE: endereco.cidade ?? '',
    ESTADO: endereco.estado ?? 'SP',
    CEP: endereco.cep ?? '',
    DATA_EXTENSO: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
    PROCESSO_ID: process.id ?? '',
    TITULAR_NOME: client.name ?? '',
    TITULAR_CPF: client.cpf_cnpj ?? '',
    TITULAR_RG: '',
    TITULAR_RG_ORGAO: '',
    TITULAR_NACIONALIDADE: 'brasileiro(a)',
    TITULAR_ESTADO_CIVIL: '',
    TITULAR_PROFISSAO: '',
    TITULAR_ENDERECO_COMPLETO: client.address
      ? [client.address.logradouro, client.address.numero, client.address.bairro, client.address.cidade].filter(Boolean).join(', ')
      : '',
    EMPRESARIO_NOME: client.name ?? '',
    EMPRESARIO_CPF: client.cpf_cnpj ?? '',
    EMPRESARIO_RG: '',
    EMPRESARIO_RG_ORGAO: '',
    EMPRESARIO_RG_UF: 'SP',
    EMPRESARIO_NACIONALIDADE: 'brasileiro(a)',
    EMPRESARIO_ESTADO_CIVIL: '',
    EMPRESARIO_PROFISSAO: '',
    EMPRESARIO_NASCIMENTO: '',
    EMPRESARIO_TELEFONE: client.phone ?? '',
    EMPRESARIO_EMAIL: client.email ?? '',
    EMPRESARIO_ENDERECO_COMPLETO: '',
    EMPRESA_TELEFONE: client.phone ?? '',
    EMPRESA_EMAIL: client.email ?? '',
    ADMINISTRADOR_NOME: client.name ?? '',
    ADMINISTRADOR_CPF: client.cpf_cnpj ?? '',
    TOTAL_COTAS: '100',
  };
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
      // 1. Buscar processo com dados do cliente
      const { data: process, error: processError } = await supabase
        .from("processes")
        .select("*, clients(*)")
        .eq("id", processId)
        .single();
      if (processError) throw new Error(`Erro ao buscar processo: ${processError.message}`);
      if (!process) throw new Error("Processo não encontrado");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const companyType = process.company_type as CompanyType;
      const templateTypes = TEMPLATES_MAP[companyType];
      if (!templateTypes || templateTypes.length === 0) {
        throw new Error(`Nenhum template configurado para o tipo ${companyType}`);
      }

      // 2. Montar dados para renderização
      const renderData = buildRenderData(process);

      // 3. Para cada template: baixar, renderizar, upload e registrar
      for (const templateType of templateTypes) {
        const templateFileName = `${templateType}.docx`;
        const documentType = templateType; // ex: 'ato_constitutivo_slu', NUNCA company_type
        const filePath = `${user.id}/${processId}/${templateFileName}`;
        const displayName = templateType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // Baixar template
        const buffer = await fetchTemplateBuffer(templateFileName);

        // Renderizar com docxtemplater
        const zip = new PizZip(buffer);
        const doc = new Docxtemplater(zip, {
          delimiters: { start: "{{", end: "}}" },
          paragraphLoop: true,
          linebreaks: true,
        });
        doc.render(renderData);

        const blob = doc.getZip().generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Upload para storage
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, blob, {
            upsert: true,
            contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
        if (uploadError) throw new Error(`Erro ao fazer upload de ${documentType}: ${uploadError.message}`);

        // Registrar no banco com document_type = templateType (único por documento)
        const { error: upsertError } = await supabase
          .from("documents")
          .upsert(
            {
              process_id: processId,
              user_id: user.id,
              document_type: documentType,
              file_name: displayName,
              file_path: filePath,
              template_version: "2024-v1",
            },
            { onConflict: "process_id,document_type" }
          );
        if (upsertError) throw new Error(`Erro ao registrar documento ${displayName}: ${upsertError.message}`);
      }

      // Atualizar status do processo para 'docs_gerados'
      const { error: updateError } = await supabase
        .from("processes")
        .update({ status: "docs_gerados", updated_at: new Date().toISOString() })
        .eq("id", processId);
      if (updateError) throw new Error(`Erro ao atualizar status: ${updateError.message}`);
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
