import { Link } from "react-router-dom";
import Services from "@/components/Services";
import ZoneIntervention from "@/components/ZoneIntervention";
import ContactDiagnostic from "@/components/ContactDiagnostic";

const Index = () => {
  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-brand-primary font-medium">
              ● Intégrateur Apple & IA
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-text">
              Accélérez vos opérations avec Apple & l'IA.
            </h1>
            <p className="text-lg text-text-muted max-w-prose">
              Modernisez votre SI, automatisez, déployez des apps métiers. IMOTION conçoit et opère vos solutions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/create-request"
                className="px-5 py-3 rounded-md bg-brand-primary text-white hover:bg-brand-dark transition-colors font-medium"
              >
                Démarrer un projet
              </Link>
              <Link
                to="/audit"
                className="px-5 py-3 rounded-md border border-surface-border hover:border-brand-primary transition-colors font-medium"
              >
                Demander un audit
              </Link>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-card border border-surface-border bg-white">
            <img src="/hero-imotion.jpg" alt="Intégration Apple & IA" className="w-full h-auto" />
          </div>
        </section>

        <Services />
        <ZoneIntervention />
        <ContactDiagnostic />
      </main>
    </div>
  );
};

export default Index;
