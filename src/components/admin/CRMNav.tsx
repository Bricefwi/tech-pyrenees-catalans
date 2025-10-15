import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Receipt, 
  ShoppingCart, 
  FileCheck,
  Calendar,
  MessageSquare,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CRMNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
    { path: "/admin/companies", icon: Building2, label: "Entreprises" },
    { path: "/admin/contacts", icon: Users, label: "Contacts" },
    { path: "/admin/requests", icon: FileText, label: "Demandes" },
    { path: "/admin/quotes", icon: Receipt, label: "Devis" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Commandes" },
    { path: "/admin/invoices", icon: FileCheck, label: "Factures" },
    { path: "/admin/interventions", icon: Calendar, label: "Interventions" },
  ];

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4 space-y-2">
      <div className="mb-6">
        <h2 className="text-xl font-bold px-3 mb-1">CRM Admin</h2>
        <p className="text-sm text-muted-foreground px-3">Gestion complète</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(item.path)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="pt-4 border-t mt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => supabase.auth.signOut().then(() => navigate("/"))}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default CRMNav;
