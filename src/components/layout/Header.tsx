import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X } from "lucide-react";
import logoImotion from "@/assets/logo-imotion.png";

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        setIsAdmin(roles?.some((r) => r.role === "admin") || false);
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || null);
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-brand-primary font-medium"
      : "text-text hover:text-brand-primary transition-colors";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-surface-border">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
            <img 
              src={logoImotion} 
              alt="IMOTION" 
              className="h-12 w-auto"
            />
          </div>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/" end className={navLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/audit" className={navLinkClass}>
            Audit
          </NavLink>
          <NavLink to="/service-suggestions" className={navLinkClass}>
            Solutions IA
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          <NavLink to="/faq" className={navLinkClass}>
            FAQ
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {userEmail ? (
            <Link
              to="/client-dashboard"
              className="px-3 py-2 rounded-md text-sm bg-brand-primary text-white hover:bg-brand-dark transition-colors"
            >
              {userEmail}
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-3 py-2 rounded-md border border-surface-border hover:border-brand-primary transition-colors text-sm"
              >
                Se connecter
              </Link>
              <Link
                to="/create-request"
                className="px-3 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-dark transition-colors text-sm"
              >
                Démarrer un projet
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-surface-border md:hidden">
            <nav className="flex flex-col p-4 space-y-3">
              <NavLink to="/" end className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Accueil
              </NavLink>
              <NavLink to="/audit" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Audit
              </NavLink>
              <NavLink to="/service-suggestions" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Solutions IA
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </NavLink>
              )}
              <NavLink to="/faq" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </NavLink>
              <NavLink to="/contact" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                Contact
              </NavLink>
              {userEmail ? (
                <Link
                  to="/client-dashboard"
                  className="px-3 py-2 rounded-md text-sm bg-brand-primary text-white hover:bg-brand-dark text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {userEmail}
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-3 py-2 rounded-md border border-surface-border text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/create-request"
                    className="px-3 py-2 rounded-md bg-brand-primary text-white text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Démarrer un projet
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
