import { motion } from "framer-motion";
import { FileText, Users, ClipboardList, Bot, CreditCard, BarChart3 } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Formulários Inteligentes",
    description: "Wizard adaptativo por tipo de empresa: MEI, EI, SLU e LTDA. Validação em tempo real e salvamento automático.",
  },
  {
    icon: FileText,
    title: "Geração de Documentos",
    description: "Contratos sociais, requerimentos e guias gerados automaticamente a partir dos dados preenchidos.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Painel completo para escritórios: cadastro de clientes, histórico de processos e documentos organizados.",
  },
  {
    icon: Bot,
    title: "Automação RPA",
    description: "Preenchimento automatizado nos portais JUCESP/Redesim com as credenciais do usuário.",
  },
  {
    icon: CreditCard,
    title: "Planos Flexíveis",
    description: "Pagamento avulso para empreendedores ou assinatura mensal para contadores e assessorias.",
  },
  {
    icon: BarChart3,
    title: "Painel Administrativo",
    description: "Métricas de uso, gestão de templates, monitoramento de jobs RPA e controle total da plataforma.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background" id="funcionalidades">
      <div className="container">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block text-sm font-semibold text-accent uppercase tracking-wider mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Funcionalidades
          </motion.span>
          <motion.h2
            className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Tudo que você precisa para abrir empresas
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Da coleta de dados à geração de documentos prontos para protocolo, 
            automatize todo o processo em uma única plataforma.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group p-8 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
