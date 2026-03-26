import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, User, Users, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const companyTypes = [
  {
    id: "mei",
    label: "MEI",
    title: "Microempreendedor Individual",
    description: "Faturamento até R$ 81 mil/ano. Fluxo simplificado via Portal do Empreendedor.",
    complexity: "Baixa",
    icon: User,
  },
  {
    id: "ei",
    label: "EI",
    title: "Empresário Individual",
    description: "Pessoa física exercendo atividade econômica individualmente. Registro JUCESP + CNPJ.",
    complexity: "Média",
    icon: UserCheck,
  },
  {
    id: "slu",
    label: "SLU",
    title: "Sociedade Limitada Unipessoal",
    description: "Empresa com único sócio e limitação de responsabilidade ao capital social.",
    complexity: "Média-Alta",
    icon: Building2,
  },
  {
    id: "ltda",
    label: "LTDA",
    title: "Sociedade Limitada",
    description: "Dois ou mais sócios com responsabilidade limitada ao capital social.",
    complexity: "Alta",
    icon: Users,
  },
];

const complexityColors: Record<string, string> = {
  "Baixa": "text-success",
  "Média": "text-info",
  "Média-Alta": "text-accent",
  "Alta": "text-destructive",
};

const NovoProcesso = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <Link to="/app/processos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">Novo Processo</h1>
        <p className="text-sm text-muted-foreground mt-1">Selecione o tipo de empresa para iniciar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {companyTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              "cursor-pointer transition-all border-2",
              selected === type.id
                ? "border-primary shadow-card-hover"
                : "border-border/50 shadow-card hover:border-primary/30"
            )}
            onClick={() => setSelected(type.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                  selected === type.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                  <type.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-bold text-foreground">{type.label}</span>
                    <span className={cn("text-xs font-medium", complexityColors[type.complexity])}>
                      {type.complexity}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">{type.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!selected}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-600 px-8"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default NovoProcesso;
