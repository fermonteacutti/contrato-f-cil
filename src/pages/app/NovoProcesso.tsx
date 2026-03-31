import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Building2, User, Users, UserCheck, Plus, Trash2, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useProcesses, CompanyType } from "@/hooks/useProcesses";
import ClienteModal from "@/components/clientes/ClienteModal";

// ── Types ──────────────────────────────────────────────────
const companyTypes: { id: CompanyType; label: string; title: string; description: string; icon: any }[] = [
  { id: "mei", label: "MEI", title: "Microempreendedor Individual", description: "Faturamento até R$ 81 mil/ano", icon: User },
  { id: "ei", label: "EI", title: "Empresário Individual", description: "Empresário Individual", icon: UserCheck },
  { id: "slu", label: "SLU", title: "Sociedade Limitada Unipessoal", description: "Sócio único, responsabilidade limitada", icon: Building2 },
  { id: "ltda", label: "LTDA", title: "Sociedade Limitada", description: "Dois ou mais sócios", icon: Users },
];

// ── Schemas ────────────────────────────────────────────────
const step1Schema = z.object({
  company_type: z.enum(["mei", "ei", "slu", "ltda"], { required_error: "Selecione o tipo" }),
  client_id: z.string().min(1, "Selecione um cliente"),
});

const socioSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  cpf: z.string().min(1, "CPF obrigatório"),
  percentual: z.coerce.number().min(0.01, "Mínimo 0.01%").max(100),
});

const step2Schema = z.object({
  company_name: z.string().min(1, "Nome empresarial obrigatório"),
  business_activity: z.string().min(1, "Atividade obrigatória"),
  cnae: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  logradouro: z.string().optional().or(z.literal("")),
  numero: z.string().optional().or(z.literal("")),
  complemento: z.string().optional().or(z.literal("")),
  bairro: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  capital: z.string().optional().or(z.literal("")),
  socios: z.array(socioSchema).optional(),
  rg: z.string().optional().or(z.literal("")),
  rg_orgao: z.string().optional().or(z.literal("")),
  estado_civil: z.string().optional().or(z.literal("")),
  regime_bens: z.string().optional().or(z.literal("")),
  profissao: z.string().optional().or(z.literal("")),
  nascimento: z.string().optional().or(z.literal("")),
});

// ── Masks ──────────────────────────────────────────────────
const maskCep = (v: string) => v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
const maskCpf = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};
const maskCurrency = (v: string) => {
  const digits = v.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const NovoProcesso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(editId);

  const { clientsQuery } = useClients();
  const { processesQuery, createProcess, updateProcess } = useProcesses();
  const clients = clientsQuery.data ?? [];

  // ── Forms ──
  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { company_type: undefined as any, client_id: "" },
  });

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      company_name: "", business_activity: "", cnae: "",
      cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
      start_date: "", capital: "", socios: [],
      rg: "", rg_orgao: "", estado_civil: "", regime_bens: "", profissao: "", nascimento: "",
    },
  });

  const { fields: socioFields, append: addSocio, remove: removeSocio } = useFieldArray({
    control: form2.control,
    name: "socios",
  });

  const selectedType = form1.watch("company_type");
  const estadoCivil = form2.watch("estado_civil");
  const showCapital = selectedType === "ei" || selectedType === "slu" || selectedType === "ltda";
  const showRegimeBens = estadoCivil === "casado" || estadoCivil === "uniao_estavel";
  const showSocios = selectedType === "ltda";

  // Load existing process for edit
  useEffect(() => {
    if (!editId || !processesQuery.data) return;
    const existing = processesQuery.data.find((p) => p.id === editId);
    if (!existing) return;
    const fd = existing.form_data;
    form1.reset({ company_type: existing.company_type, client_id: existing.client_id });
    form2.reset({
      company_name: fd?.nome_empresarial || "",
      business_activity: fd?.objeto_social || "",
      cnae: fd?.cnae_principal || "",
      cep: fd?.endereco?.cep || "",
      logradouro: fd?.endereco?.logradouro || "",
      numero: fd?.endereco?.numero || "",
      complemento: fd?.endereco?.complemento || "",
      bairro: fd?.endereco?.bairro || "",
      cidade: fd?.endereco?.cidade || "",
      estado: fd?.endereco?.estado || "",
      start_date: fd?.data_inicio || "",
      capital: fd?.capital_social || "",
      socios: fd?.socios || [],
      rg: fd?.rg || "",
      rg_orgao: fd?.rg_orgao || "",
      estado_civil: fd?.estado_civil || "",
      regime_bens: fd?.regime_bens || "",
      profissao: fd?.profissao || "",
      nascimento: fd?.nascimento || "",
    });
  }, [editId, processesQuery.data]);

  // ── ViaCEP ──
  const fetchCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error("CEP não encontrado"); return; }
      form2.setValue("logradouro", data.logradouro || "");
      form2.setValue("bairro", data.bairro || "");
      form2.setValue("cidade", data.localidade || "");
      form2.setValue("estado", data.uf || "");
    } catch { toast.error("Erro ao buscar CEP"); }
  };

  // ── Save draft helper ──
  const buildPayload = (status: string = "rascunho") => {
    const v1 = form1.getValues();
    const v2 = form2.getValues();
    const formData: Record<string, any> = {
      nome_empresarial: v2.company_name || undefined,
      objeto_social: v2.business_activity || undefined,
      cnae_principal: v2.cnae || undefined,
      data_inicio: v2.start_date || undefined,
      capital_social: v2.capital || undefined,
      rg: v2.rg || undefined,
      rg_orgao: v2.rg_orgao || undefined,
      estado_civil: v2.estado_civil || undefined,
      regime_bens: v2.regime_bens || undefined,
      profissao: v2.profissao || undefined,
      nascimento: v2.nascimento || undefined,
    };
    if (v2.cep) {
      formData.endereco = {
        cep: v2.cep, logradouro: v2.logradouro, numero: v2.numero,
        complemento: v2.complemento, bairro: v2.bairro, cidade: v2.cidade, estado: v2.estado,
      };
    }
    if (showSocios && v2.socios?.length) {
      formData.socios = v2.socios.map(s => ({ nome: s.nome, cpf: s.cpf, percentual: Number(s.percentual) }));
    }
    return {
      client_id: v1.client_id,
      company_type: v1.company_type,
      status: status as any,
      form_data: formData,
    };
  };

  const saveDraft = async () => {
    try {
      const payload = buildPayload("rascunho");
      if (draftId) {
        await updateProcess.mutateAsync({ id: draftId, ...payload });
      } else {
        const result = await createProcess.mutateAsync(payload);
        setDraftId(result.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar rascunho");
    }
  };

  // ── Step navigation ──
  const goNext = async () => {
    if (step === 0) {
      const valid = await form1.trigger();
      if (!valid) return;
      await saveDraft();
      setStep(1);
    } else if (step === 1) {
      const valid = await form2.trigger();
      if (!valid) return;
      if (showSocios) {
        const socios = form2.getValues("socios") || [];
        if (socios.length === 0) { toast.error("Adicione ao menos um sócio"); return; }
        const total = socios.reduce((s, sc) => s + Number(sc.percentual), 0);
        if (Math.abs(total - 100) > 0.01) { toast.error(`Total de participação deve ser 100%. Atual: ${total.toFixed(2)}%`); return; }
      }
      await saveDraft();
      setStep(2);
    }
  };

  const goBack = () => { if (step > 0) setStep(step - 1); };

  const handleSaveDraft = async () => {
    await saveDraft();
    toast.success("Rascunho salvo com sucesso!");
    navigate("/app/processos");
  };

  const handleGenerate = async () => {
    if (!confirmed) { toast.error("Confirme que os dados estão corretos"); return; }
    try {
      const payload = buildPayload("aguardando_docs");
      if (draftId) {
        await updateProcess.mutateAsync({ id: draftId, ...payload });
      } else {
        await createProcess.mutateAsync(payload);
      }
      toast.success("Processo salvo! Geração de documentos será implementada em breve.");
      navigate("/app/processos");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar processo");
    }
  };

  const isSaving = createProcess.isPending || updateProcess.isPending;

  // ── Summary data for step 3 ──
  const summaryData = useMemo(() => {
    const v1 = form1.getValues();
    const v2 = form2.getValues();
    const client = clients.find((c) => c.id === v1.client_id);
    const typeInfo = companyTypes.find((t) => t.id === v1.company_type);
    return { v1, v2, client, typeInfo };
  }, [step, clients]);

  // ── RENDER ──
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link to="/app/processos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {editId ? "Editar Processo" : "Novo Processo"}
        </h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {["Tipo e Cliente", "Dados da Empresa", "Revisão"].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              i < step ? "bg-success text-success-foreground" :
              i === step ? "bg-primary text-primary-foreground" :
              "bg-muted text-muted-foreground"
            )}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-sm hidden sm:block", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* STEP 0 */}
      {step === 0 && (
        <Form {...form1}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <FormField control={form1.control} name="company_type" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-heading font-semibold">Tipo de Empresa</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {companyTypes.map((type) => (
                    <Card
                      key={type.id}
                      className={cn(
                        "cursor-pointer transition-all border-2",
                        field.value === type.id
                          ? "border-primary shadow-card-hover"
                          : "border-border/50 shadow-card hover:border-primary/30"
                      )}
                      onClick={() => field.onChange(type.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                            field.value === type.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                          )}>
                            <type.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="font-heading font-bold text-foreground">{type.label}</span>
                            <p className="text-sm text-foreground/80">{type.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form1.control} name="client_id" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-heading font-semibold">Cliente</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                <Button type="button" variant="link" className="px-0 h-auto text-sm" onClick={() => setClientModalOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Cadastrar novo cliente
                </Button>
              </FormItem>
            )} />
          </form>
        </Form>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <Form {...form2}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form2.control} name="company_name" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome Empresarial *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form2.control} name="business_activity" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Objeto Social / Atividade Principal *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form2.control} name="cnae" render={({ field }) => (
                <FormItem>
                  <FormLabel>CNAE Principal</FormLabel>
                  <FormControl><Input placeholder="Ex: 6201-5/00" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form2.control} name="start_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            {showCapital && (
              <FormField control={form2.control} name="capital" render={({ field }) => (
                <FormItem>
                  <FormLabel>Capital Social (R$)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0,00"
                      onChange={(e) => field.onChange(maskCurrency(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )} />
            )}

            {/* Address */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-3">Endereço do Estabelecimento</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField control={form2.control} name="cep" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={9}
                        placeholder="00000-000"
                        onChange={(e) => field.onChange(maskCep(e.target.value))}
                        onBlur={(e) => { field.onBlur(); fetchCep(e.target.value); }}
                      />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form2.control} name="logradouro" render={({ field }) => (
                  <FormItem className="sm:col-span-2"><FormLabel>Logradouro</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form2.control} name="numero" render={({ field }) => (
                  <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form2.control} name="complemento" render={({ field }) => (
                  <FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form2.control} name="bairro" render={({ field }) => (
                  <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form2.control} name="cidade" render={({ field }) => (
                  <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form2.control} name="estado" render={({ field }) => (
                  <FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} maxLength={2} /></FormControl></FormItem>
                )} />
              </div>
            </div>

            {/* Sócios */}
            {showSocios && (
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Sócios</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => addSocio({ nome: "", cpf: "", percentual: 0 })}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Sócio
                  </Button>
                </div>
                {socioFields.map((f, idx) => (
                  <Card key={f.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                          <FormField control={form2.control} name={`socios.${idx}.nome`} render={({ field }) => (
                            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form2.control} name={`socios.${idx}.cpf`} render={({ field }) => (
                            <FormItem><FormLabel>CPF</FormLabel><FormControl>
                              <Input {...field} maxLength={14} onChange={(e) => field.onChange(maskCpf(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form2.control} name={`socios.${idx}.percentual`} render={({ field }) => (
                            <FormItem><FormLabel>Participação (%)</FormLabel><FormControl>
                              <Input type="number" step="0.01" min="0" max="100" {...field} />
                            </FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="mt-6 text-destructive hover:text-destructive" onClick={() => removeSocio(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Responsável Legal */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-3">Dados do Responsável Legal</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form2.control} name="rg" render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl><Input placeholder="Ex: 12.345.678-9" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form2.control} name="rg_orgao" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Órgão Emissor</FormLabel>
                    <FormControl><Input placeholder="Ex: SSP/SP" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form2.control} name="estado_civil" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                        <SelectItem value="uniao_estavel">União Estável</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                {showRegimeBens && (
                  <FormField control={form2.control} name="regime_bens" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regime de Bens</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="comunhao_parcial">Comunhão Parcial</SelectItem>
                          <SelectItem value="comunhao_universal">Comunhão Universal</SelectItem>
                          <SelectItem value="separacao_total">Separação Total</SelectItem>
                          <SelectItem value="participacao_final">Participação Final nos Aquestos</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                )}
                <FormField control={form2.control} name="profissao" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão</FormLabel>
                    <FormControl><Input placeholder="Ex: Empresário" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form2.control} name="nascimento" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
            </div>
          </form>
        </Form>
      )}

      {/* STEP 2 — Review */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-heading font-semibold text-foreground">Tipo e Cliente</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <Badge variant="outline" className="w-fit font-bold">{summaryData.typeInfo?.label}</Badge>
                <span className="text-muted-foreground">Cliente:</span>
                <span className="text-foreground">{summaryData.client?.name || "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-heading font-semibold text-foreground">Dados da Empresa</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Nome Empresarial:</span>
                <span className="text-foreground">{summaryData.v2.company_name || "—"}</span>
                <span className="text-muted-foreground">Atividade:</span>
                <span className="text-foreground">{summaryData.v2.business_activity || "—"}</span>
                {summaryData.v2.cnae && (<><span className="text-muted-foreground">CNAE:</span><span className="text-foreground">{summaryData.v2.cnae}</span></>)}
                {summaryData.v2.start_date && (<><span className="text-muted-foreground">Início:</span><span className="text-foreground">{summaryData.v2.start_date}</span></>)}
                {summaryData.v2.capital && (<><span className="text-muted-foreground">Capital:</span><span className="text-foreground">R$ {summaryData.v2.capital}</span></>)}
              </div>
            </CardContent>
          </Card>

          {summaryData.v2.cep && (
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-heading font-semibold text-foreground">Endereço</h3>
                <p className="text-sm text-foreground">
                  {[summaryData.v2.logradouro, summaryData.v2.numero, summaryData.v2.complemento, summaryData.v2.bairro, summaryData.v2.cidade, summaryData.v2.estado, summaryData.v2.cep]
                    .filter(Boolean).join(", ")}
                </p>
              </CardContent>
            </Card>
          )}

          {showSocios && summaryData.v2.socios && summaryData.v2.socios.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-heading font-semibold text-foreground">Sócios</h3>
                {summaryData.v2.socios.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                    <span className="text-foreground">{s.nome} — {s.cpf}</span>
                    <span className="font-medium text-foreground">{s.percentual}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(summaryData.v2.rg || summaryData.v2.estado_civil || summaryData.v2.profissao || summaryData.v2.nascimento) && (
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-heading font-semibold text-foreground">Responsável Legal</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {summaryData.v2.rg && (<><span className="text-muted-foreground">RG:</span><span className="text-foreground">{summaryData.v2.rg}</span></>)}
                  {summaryData.v2.rg_orgao && (<><span className="text-muted-foreground">Órgão Emissor:</span><span className="text-foreground">{summaryData.v2.rg_orgao}</span></>)}
                  {summaryData.v2.estado_civil && (<><span className="text-muted-foreground">Estado Civil:</span><span className="text-foreground">{summaryData.v2.estado_civil}</span></>)}
                  {summaryData.v2.regime_bens && (<><span className="text-muted-foreground">Regime de Bens:</span><span className="text-foreground">{summaryData.v2.regime_bens}</span></>)}
                  {summaryData.v2.profissao && (<><span className="text-muted-foreground">Profissão:</span><span className="text-foreground">{summaryData.v2.profissao}</span></>)}
                  {summaryData.v2.nascimento && (<><span className="text-muted-foreground">Nascimento:</span><span className="text-foreground">{summaryData.v2.nascimento}</span></>)}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2">
            <Checkbox id="confirm" checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} />
            <label htmlFor="confirm" className="text-sm text-foreground cursor-pointer">
              Confirmo que os dados estão corretos
            </label>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <div>
          {step > 0 && (
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          {step < 2 ? (
            <Button onClick={goNext} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Rascunho
              </Button>
              <Button onClick={handleGenerate} disabled={isSaving || !confirmed}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Gerar Documentos
              </Button>
            </>
          )}
        </div>
      </div>

      <ClienteModal open={clientModalOpen} onOpenChange={setClientModalOpen} />
    </div>
  );
};

export default NovoProcesso;
