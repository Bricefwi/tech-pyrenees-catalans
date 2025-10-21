import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Exporter la page HTML actuelle en PDF (pour rapports d'audit)
 * @param filename - Nom du fichier PDF généré
 */
export async function exportCurrentPageToPDF(filename = "IMOTION_Audit.pdf") {
  const content = document.documentElement.cloneNode(true) as HTMLElement;
  const wrapElement = content.querySelector(".wrap");
  const main = wrapElement ? (wrapElement as HTMLElement) : content.querySelector("body") as HTMLElement;
  
  const canvas = await html2canvas(main as HTMLElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.98);
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  const pdf = new jsPDF({
    orientation: imgHeight > imgWidth ? "portrait" : "landscape",
    unit: "mm",
    format: "a4",
  });

  pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}

/**
 * Exporter une zone HTML en PDF (compatible Lovable + React)
 * @param elementId - L'ID de l'élément HTML à exporter (ex: "gantt-container")
 * @param filename - Nom du fichier PDF généré
 * @param title - Titre affiché en haut du PDF
 * @param author - Nom de l'auteur (optionnel)
 */
export async function exportToPDF(
  elementId: string,
  filename: string,
  title: string,
  author?: string
) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("⚠️ Élément non trouvé :", elementId);
    return;
  }

  // Capture de la zone avec html2canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  // En-tête PDF
  // Logo (si disponible, sinon texte)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(227, 30, 36); // #E31E24
  pdf.text("IMOTION", 20, 30);
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(17, 17, 17); // #111111
  pdf.text(title, 20, 50);

  pdf.setFontSize(11);
  pdf.setTextColor(75, 85, 99); // #4B5563
  if (author) pdf.text(`Généré par : ${author}`, 20, 65);

  // Image principale
  pdf.addImage(imgData, "PNG", 0, 80, canvas.width, canvas.height);

  // Pied de page
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFontSize(10);
  pdf.setTextColor(150);
  pdf.text(
    `© ${new Date().getFullYear()} IMOTION - Intégrateur Apple & IA`,
    20,
    pageHeight - 15
  );

  pdf.save(`${filename}.pdf`);
}

/**
 * Fonction legacy pour compatibilité (appelée par ProjectDetail.tsx)
 */
export async function exportElementToPDF(elementId: string, filename: string) {
  await exportToPDF(elementId, filename.replace('.pdf', ''), "Export Projet", "IMOTION");
}

/**
 * Génère un PDF d'audit professionnel avec scores, secteurs et recommandations
 */
export async function generateAuditPdf(options: {
  brand: { logoUrl: string; company: string; tagline: string };
  client: { name: string; email: string; company: string };
  audit: {
    id: string;
    title: string;
    date: Date;
    globalScore: number;
    sectorScores: Array<{ name: string; score: number }>;
    sectors: Array<any>;
    responses: Array<any>;
  };
  hook: string;
}): Promise<Blob> {
  const { brand, client, audit, hook } = options;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  let yPos = 20;

  // En-tête avec logo et branding
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(227, 30, 36); // #E31E24
  pdf.text(brand.company, 20, yPos);
  
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  pdf.text(brand.tagline, 20, yPos);

  yPos += 20;

  // Titre du rapport
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(17, 17, 17);
  pdf.text("Rapport d'Audit Digital", 20, yPos);

  yPos += 10;
  pdf.setFontSize(12);
  pdf.setTextColor(75, 85, 99);
  pdf.text(audit.title, 20, yPos);

  yPos += 15;

  // Informations client
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(`Client: ${client.name}`, 20, yPos);
  yPos += 6;
  pdf.text(`Entreprise: ${client.company}`, 20, yPos);
  yPos += 6;
  pdf.text(`Date: ${audit.date.toLocaleDateString("fr-FR")}`, 20, yPos);

  yPos += 15;

  // Score global
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(227, 30, 36);
  pdf.text(`Score Global: ${audit.globalScore}/100`, 20, yPos);

  yPos += 15;

  // Scores par secteur
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(17, 17, 17);
  pdf.text("Scores par Secteur", 20, yPos);
  yPos += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(75, 85, 99);

  audit.sectorScores.forEach((sector) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }
    pdf.text(`• ${sector.name}: ${sector.score}/100`, 25, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Hook commercial
  if (yPos > pageHeight - 40) {
    pdf.addPage();
    yPos = 20;
  }
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  const hookLines = pdf.splitTextToSize(hook, pageWidth - 40);
  pdf.text(hookLines, 20, yPos);

  yPos += hookLines.length * 6 + 10;

  // Pied de page
  const footerY = pageHeight - 15;
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `© ${new Date().getFullYear()} ${brand.company} - Rapport généré le ${new Date().toLocaleDateString("fr-FR")}`,
    20,
    footerY
  );

  // Convertir en Blob
  const pdfBlob = pdf.output("blob");
  return pdfBlob;
}
