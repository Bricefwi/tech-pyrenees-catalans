import html2pdf from "html2pdf.js";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ProposalPDFProps {
  title: string;
  client?: string;
  content: string;
}

export default function ProposalPDFGenerator({ title, client, content }: ProposalPDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!pdfRef.current) return;

    const opt = {
      margin: [10, 10, 15, 10],
      filename: `${title.replace(/\s+/g, "_")}_proposition.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      pagebreak: { mode: ["css", "legacy", "avoid-all"] },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(pdfRef.current).save();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
          <FileText className="w-4 h-4" /> Télécharger PDF
        </Button>
      </div>

      <div ref={pdfRef} className="bg-white text-gray-900 font-sans text-sm leading-relaxed p-8 rounded-lg shadow-sm print:p-0 print:shadow-none">
        {/* --------- En-tête --------- */}
        <header className="mb-6 border-b pb-3">
          <h1 className="text-2xl font-semibold mb-1">{title}</h1>
          {client && <p className="text-gray-600 text-sm">Client : {client}</p>}
          <p className="text-gray-500 text-xs">Document généré automatiquement – vérifié par l’équipe technique</p>
        </header>

        {/* --------- Contenu principal --------- */}
        <article
          className="proposal-content prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />

        {/* --------- Plan projet --------- */}
        <div className="html2pdf__page-break"></div>
        <section className="mt-8">
          <h2 className="text-xl font-semibold border-b pb-1 mb-3">Plan du projet & jalons</h2>
          <p>
            Ce projet se décompose en plusieurs étapes clés. Chaque jalon est associé à un livrable mesurable et à une
            estimation temporelle indicative.
          </p>
          <ul className="mt-3 list-disc list-inside space-y-1">
            <li><strong>Phase 1 :</strong> Analyse et cadrage – validation du besoin et des livrables.</li>
            <li><strong>Phase 2 :</strong> Conception technique – architecture, choix des outils, maquettes.</li>
            <li><strong>Phase 3 :</strong> Développement et automatisation – implémentation, tests unitaires.</li>
            <li><strong>Phase 4 :</strong> Recette et mise en production – contrôle qualité, documentation.</li>
            <li><strong>Phase 5 :</strong> Suivi post-livraison – maintenance, ajustements et support.</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600 italic">
            Les durées et coûts précis seront affinés après validation du cahier des charges final.
          </p>
        </section>

        {/* --------- Pied de page --------- */}
        <footer className="html2pdf__page-break mt-10 border-t pt-3 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Tech Pyrénées Catalans – Proposition confidentielle. Toute reproduction interdite sans accord préalable.
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Nettoie et structure le contenu texte/markdown en HTML enrichi.
 * Ajoute les titres et paragraphes, évite les coupures.
 */
function formatContent(raw: string): string {
  if (!raw) return "<p><em>Aucune donnée disponible.</em></p>";
  const safe = raw
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/#{1,3}\s(.+)/g, "<h3>$1</h3>");
  return `<p>${safe}</p>`;
}
