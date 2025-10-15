import { Button } from "@/components/ui/button";
import { Phone, User } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-catalan flex items-center justify-center">
              <span className="text-white font-bold text-xl">TC</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg">Tech Catalan</div>
              <div className="text-xs text-muted-foreground">Expert en Pays Catalan</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </a>
            <a href="#zone" className="text-sm font-medium hover:text-primary transition-colors">
              Zone
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">Contact</span>
            </Button>
            <Button size="sm" className="bg-gradient-catalan hover:opacity-90">
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Connexion</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
