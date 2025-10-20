import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(title, 20, 30);

  pdf.setFontSize(11);
  pdf.setTextColor(100);
  if (author) pdf.text(`Généré par : ${author}`, 20, 50);

  // Image principale
  pdf.addImage(imgData, "PNG", 0, 60, canvas.width, canvas.height);

  // Pied de page
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFontSize(10);
  pdf.setTextColor(150);
  pdf.text(
    `© ${new Date().getFullYear()} Tech Catalan - Analyse IA & Transformation Digitale`,
    20,
    pageHeight - 15
  );

  pdf.save(`${filename}.pdf`);
}

/**
 * Fonction legacy pour compatibilité (appelée par ProjectDetail.tsx)
 */
export async function exportElementToPDF(elementId: string, filename: string) {
  await exportToPDF(elementId, filename.replace('.pdf', ''), "Export Projet", "Tech Pyrénées Catalans");
}
