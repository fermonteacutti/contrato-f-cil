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

const templatesByType: Record<string, { file: string; name: string }[]> = {
  slu: [
    { file: "ato_constitutivo_slu.docx", name: "Ato Constitutivo SLU" },
    { file: "checklist_jucesp_slu.docx", name: "Checklist JUCESP SLU" },
  ],
  ei: [
    { file: "requerimento_ei.docx", name: "Requerimento EI" },
    { file: "checklist_jucesp_ei.docx", name: "Checklist JUCESP EI" },
  ],
  ltda: [
    { file: "contrato_social_ltda.docx", name: "Contrato Social LTDA" },
    { file: "checklist_jucesp_ltda.docx", name: "Checklist JUCESP LTDA" },
  ],
};

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
  const socios = fd.socios || [];

  return {
    // Cliente
    cliente_nome: client.name || "",
    cliente_cpf: client.cpf || "",
    cliente_rg: client.rg || "",
    cliente_email: client.email || "",
    cliente_telefone: client.phone || "",
    cliente_nacionalidade: client.nationality || "brasileira",
    cliente_estado_civil: client.marital_status || "",

    // Empresa
    nome_empresarial: fd.nome_empresarial || "",
    objeto_social: fd.objeto_social || "",
    cnae_principal: fd.cnae_principal || "",
    capital_social: fd.capital_social || "",
    data_inicio: fd.data_inicio || "",

    // Endereço
    cep: endereco.cep || "",
    logradouro: endereco.logradouro || "",
    numero: endereco.numero || "",
    complemento: endereco.complemento || "",
    bairro: endereco.bairro || "",
    cidade: endereco.cidade || "",
    estado: endereco.estado || "",
    endereco_completo: [
      endereco.logradouro,
      endereco.numero,
      endereco.complemento,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
      endereco.cep,
    ].filter(Boolean).join(", "),

    // Sócios
    socios,
    socio1_nome: socios[0]?.nome || "",
    socio1_cpf: socios[0]?.cpf || "",
    socio1_percentual: socios[0]?.percentual || "",
    socio2_nome: socios[1]?.nome || "",
    socio2_cpf: socios[1]?.cpf || "",
    socio2_percentual: socios[1]?.percentual || "",

    // Tipo
    tipo_empresa: process.company_type || "",
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
      const templates = templatesByType[companyType];
      if (!templates || templates.length === 0) {
        throw new Error(`Nenhum template configurado para o tipo ${companyType}`);
      }

      // 2. Montar dados para renderização
      const renderData = buildRenderData(process);

      // 3. Para cada template: baixar, renderizar e fazer upload
      const generatedDocs: { name: string; file_path: string }[] = [];

      for (const tpl of templates) {
        const buffer = await fetchTemplateBuffer(tpl.file);

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

        const filePath = `${user.id}/${processId}/${tpl.file}`;

        // 4. Upload para bucket 'documents'
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, blob, {
            upsert: true,
            contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
        if (uploadError) throw new Error(`Erro ao fazer upload de ${tpl.name}: ${uploadError.message}`);

        generatedDocs.push({ name: tpl.name, file_path: filePath });
      }

      // 5. Registrar na tabela documents
      const docsToInsert = generatedDocs.map((d) => ({
        process_id: processId,
        name: d.name,
        file_path: d.file_path,
        status: "gerado",
      }));

      const { error: insertError } = await supabase
        .from("documents")
        .insert(docsToInsert);
      if (insertError) throw new Error(`Erro ao registrar documentos: ${insertError.message}`);

      // 6. Atualizar status do processo para 'docs_gerados'
      const { error: updateError } = await supabase
        .from("processes")
        .update({ status: "docs_gerados", updated_at: new Date().toISOString() })
        .eq("id", processId);
      if (updateError) throw new Error(`Erro ao atualizar status: ${updateError.message}`);

      return generatedDocs;
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
