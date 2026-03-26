import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Avulso",
    audience: "Empreendedor",
    price: "R$ 99",
    period: "por processo",
    featured: false,
    features: [
      "1 processo completo",
      "Todos os tipos de empresa",
      "Documentos em PDF/DOCX",
      "Guia passo a passo",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Starter",
    audience: "Contador pequeno",
    price: "R$ 197",
    period: "/mês",
    featured: false,
    features: [
      "Até 10 processos/mês",
      "Painel de clientes",
      "Histórico completo",
      "Download em lote",
      "Suporte prioritário",
    ],
  },
  {
    name: "Professional",
    audience: "Escritório médio",
    price: "R$ 447",
    period: "/mês",
    featured: true,
    features: [
      "Até 30 processos/mês",
      "Tudo do Starter",
      "Automação RPA",
      "Relatórios de gestão",
      "Equipe com múltiplos acessos",
    ],
  },
  {
    name: "Enterprise",
    audience: "Grande escritório",
    price: "R$ 897",
    period: "/mês",
    featured: false,
    features: [
      "Processos ilimitados",
      "Tudo do Professional",
      "Gerente de conta dedicado",
      "API de integração",
      "Templates personalizados",
    ],
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-muted/30" id="precos">
      <div className="container">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Planos e Preços
          </motion.span>
          <motion.h2
            className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Escolha o plano ideal para seu negócio
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`relative rounded-xl p-6 flex flex-col ${
                plan.featured
                  ? "bg-primary text-primary-foreground shadow-elevated scale-[1.02] border-2 border-accent"
                  : "bg-card text-card-foreground shadow-card border border-border/50"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
                  MAIS POPULAR
                </span>
              )}
              <div className="mb-6">
                <p className={`text-sm font-medium mb-1 ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.audience}
                </p>
                <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
              </div>
              <div className="mb-6">
                <span className="font-heading text-3xl font-800">{plan.price}</span>
                <span className={`text-sm ml-1 ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.featured ? "text-accent" : "text-success"}`} />
                    <span className={plan.featured ? "text-primary-foreground/90" : ""}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={
                  plan.featured
                    ? "bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-600"
                }
              >
                <Link to="/cadastro">Começar Agora</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
