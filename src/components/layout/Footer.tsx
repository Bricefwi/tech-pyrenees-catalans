import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-surface-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-10 md:grid-cols-3">
        <div className="space-y-3">
          <img src="/logo-imotion.png" className="h-12 rounded-lg shadow-sm border border-surface-border bg-white p-2" alt="IMOTION" />
          <p className="text-sm text-text-muted">
            Intégrateur Apple & solutions IA. Modernisation, automatisation, service managé.
          </p>
        </div>

        <div className="text-sm">
          <h3 className="font-semibold mb-3 text-text">Navigation</h3>
          <ul className="space-y-2 text-text-muted">
            <li>
              <Link to="/" className="hover:text-brand-primary transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/audit" className="hover:text-brand-primary transition-colors">
                Audit
              </Link>
            </li>
            <li>
              <Link to="/service-suggestions" className="hover:text-brand-primary transition-colors">
                Solutions IA
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-brand-primary transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-brand-primary transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h3 className="font-semibold mb-3 text-text">Contact</h3>
          <div className="space-y-1 text-text-muted">
            <p>contact@imotion.fr</p>
            <p>Perpignan, France</p>
          </div>
        </div>
      </div>
      <div className="border-t border-surface-border py-4 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} IMOTION. Tous droits réservés.
      </div>
    </footer>
  );
}
