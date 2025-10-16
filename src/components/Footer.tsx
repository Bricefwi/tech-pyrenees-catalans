import { Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">Tech Catalan</h3>
            <p className="text-muted-foreground text-sm">
              Votre expert Apple et partenaire en transformation digitale en Pays Catalan.
            </p>
          </div>
          <div className="text-sm">
             <h3 className="font-semibold text-foreground mb-3">Navigation</h3>
             <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-primary">Accueil</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ & Support</Link></li>
                <li><Link to="/audit" className="text-muted-foreground hover:text-primary">Audit Entreprise</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link to="/cgu" className="text-muted-foreground hover:text-primary">CGU</Link></li>
                <li><Link to="/cgv" className="text-muted-foreground hover:text-primary">CGV</Link></li>
             </ul>
          </div>
          <div>
             <h3 className="font-semibold text-foreground mb-3">Suivez-nous</h3>
             <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary"><Github className="w-5 h-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-primary"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="w-5 h-5" /></a>
             </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Tech Catalan. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
