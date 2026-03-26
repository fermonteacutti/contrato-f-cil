import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => {
  return (
    <footer className="bg-foreground py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-background">DocEmpresa</span>
            </Link>
            <p className="text-background/50 text-sm max-w-sm leading-relaxed">
              Plataforma de automação para geração de documentos empresariais no Estado de São Paulo. 
              Agilize a abertura de empresas junto à JUCESP e Receita Federal.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-background mb-4 text-sm">Produto</h4>
            <ul className="space-y-2.5">
              <li><a href="#funcionalidades" className="text-background/50 hover:text-background text-sm transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="text-background/50 hover:text-background text-sm transition-colors">Preços</a></li>
              <li><Link to="/login" className="text-background/50 hover:text-background text-sm transition-colors">Entrar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-background mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              <li><span className="text-background/50 text-sm">Termos de Uso</span></li>
              <li><span className="text-background/50 text-sm">Política de Privacidade</span></li>
              <li><span className="text-background/50 text-sm">LGPD</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10 pt-8">
          <p className="text-background/40 text-xs text-center">
            © 2026 DocEmpresa. Todos os direitos reservados. Os documentos gerados são minutas técnicas — 
            a responsabilidade pela validação jurídica é do contratante.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
