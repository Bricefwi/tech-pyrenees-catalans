import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Brand() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(value: string) {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  }

  const colors = [
    { name: "Rouge IMOTION", value: "#E31E24", usage: "Accent principal, boutons, titres" },
    { name: "Noir", value: "#111111", usage: "Texte principal, contrastes forts" },
    { name: "Gris clair", value: "#FAFAFA", usage: "Arrière-plan clair" },
    { name: "Gris moyen", value: "#E5E7EB", usage: "Bordures, surfaces neutres" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      <header className="text-center space-y-2">
        <img src="/logo-imotion.png" alt="IMOTION logo" className="mx-auto h-14" />
        <h1 className="text-3xl font-extrabold tracking-tight text-text">Charte visuelle IMOTION</h1>
        <p className="text-text-muted">Guidelines pour le branding, les couleurs et les composants</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-surface-border pb-2 text-text">1. Identité & ton</h2>
        <p className="text-text">
          IMOTION est une marque technologique à la fois <strong>technique</strong> et <strong>humaine</strong>. 
          Elle s'adresse à un public professionnel recherchant la performance, la fiabilité et la clarté.  
          Le ton doit rester pragmatique, direct, et inspirer la confiance.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-text-muted">
          <li><strong>Valeurs :</strong> expertise, réactivité, innovation maîtrisée.</li>
          <li><strong>Style rédactionnel :</strong> concret, professionnel, sans jargon inutile.</li>
          <li><strong>Voix visuelle :</strong> lumineuse, précise, fluide.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-surface-border pb-2 text-text">2. Palette de couleurs</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {colors.map((c) => (
            <div key={c.value} className="border border-surface-border rounded-lg overflow-hidden shadow-sm">
              <div className="h-20" style={{ backgroundColor: c.value }}></div>
              <div className="p-3 text-sm space-y-1">
                <p className="font-medium text-text">{c.name}</p>
                <p className="text-xs text-text-muted">{c.usage}</p>
                <div className="flex items-center justify-between">
                  <code className="text-xs">{c.value}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(c.value)}
                  >
                    {copied === c.value ? "Copié" : "Copier"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-surface-border pb-2 text-text">3. Typographie</h2>
        <p className="text-text">
          La typographie principale est <strong>Inter</strong>.  
          Elle doit être utilisée pour tous les textes UI et contenus web.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-4">
          <div>
            <p className="uppercase text-xs text-text-muted mb-2">Titres</p>
            <h1 className="text-4xl font-extrabold text-text">IMOTION - Expertise & IA</h1>
            <h2 className="text-2xl font-bold mt-2 text-text">Sous-titre</h2>
          </div>
          <div>
            <p className="uppercase text-xs text-text-muted mb-2">Texte courant</p>
            <p className="text-text">
              IMOTION accompagne les entreprises dans l'intégration Apple, 
              la transformation digitale et l'intégration de solutions IA.  
              Le ton reste professionnel, clair et engageant.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-surface-border pb-2 text-text">4. Composants UI</h2>
        <p className="text-text">Exemples des styles de boutons et de cartes applicables dans toute l'interface.</p>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Action principale</Button>
          <Button variant="outline">Action secondaire</Button>
          <Button variant="ghost">Action discrète</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-surface-border pb-2 text-text">5. Logo & usage</h2>
        <p className="text-text">
          Le logo IMOTION doit toujours apparaître sur fond clair ou blanc.  
          Il ne doit jamais être déformé, recoloré ou placé sur une image trop chargée.
        </p>
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center bg-surface-card p-6 rounded-xl border border-surface-border shadow-card">
          <img src="/logo-imotion.png" alt="IMOTION logo" className="h-20" />
        </div>
        <p className="text-xs text-text-muted text-center mt-3">
          Logo officiel IMOTION
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b border-surface-border pb-2 text-text">6. Mentions</h2>
        <p className="text-text">
          Ce guide constitue la référence visuelle officielle d'IMOTION.  
          Toute déclinaison ou adaptation graphique doit conserver l'esprit 
          et les couleurs principales définies ici.
        </p>
      </section>
    </div>
  );
}
