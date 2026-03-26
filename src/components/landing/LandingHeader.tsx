import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";

const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-primary-foreground">
            DocEmpresa
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#funcionalidades" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            Funcionalidades
          </a>
          <a href="#precos" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            Preços
          </a>
          <Link to="/login" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            Entrar
          </Link>
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-600">
            <Link to="/cadastro">Criar Conta</Link>
          </Button>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-primary-foreground"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden gradient-hero border-t border-primary-foreground/10 p-6">
          <nav className="flex flex-col gap-4">
            <a href="#funcionalidades" className="text-primary-foreground/70 hover:text-primary-foreground" onClick={() => setMobileOpen(false)}>
              Funcionalidades
            </a>
            <a href="#precos" className="text-primary-foreground/70 hover:text-primary-foreground" onClick={() => setMobileOpen(false)}>
              Preços
            </a>
            <Link to="/login" className="text-primary-foreground/70 hover:text-primary-foreground">
              Entrar
            </Link>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading font-600 w-full">
              <Link to="/cadastro">Criar Conta</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
