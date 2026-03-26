import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="gradient-hero relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-info/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-accent/5 blur-2xl" />
      </div>

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="max-w-3xl mx-auto text-center lg:text-left lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-sm text-primary-foreground/80 mb-6">
              <Zap className="w-3.5 h-3.5 text-accent" />
              Automatize a abertura de empresas em SP
            </span>
          </motion.div>

          <motion.h1
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-800 text-primary-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Gere contratos e documentos empresariais{" "}
            <span className="text-accent">em minutos</span>
          </motion.h1>

          <motion.p
            className="text-lg lg:text-xl text-primary-foreground/70 mb-10 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Plataforma SaaS para contadores, assessorias e empreendedores. 
            Formulários inteligentes, geração automática de documentos e 
            integração com JUCESP/Redesim.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-600 text-base px-8 h-12 shadow-elevated">
              <Link to="/cadastro">
                Comece Grátis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-heading font-500 text-base px-8 h-12">
              <Link to="/precos">Ver Planos</Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { icon: FileText, label: "Documentos prontos para protocolo" },
              { icon: Shield, label: "Conformidade com JUCESP/Redesim" },
              { icon: Zap, label: "Geração em menos de 30 segundos" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-primary-foreground/70">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
