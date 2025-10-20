import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportElementToPDF(elementId: string, filename: string) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Élément introuvable: #${elementId}`);

  // capture
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");

  // doc A4 portrait
  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 40; // marges
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = 20;
  let remainingHeight = imgHeight;

  // pagination si contenu long
  while (remainingHeight > 0) {
    pdf.addImage(imgData, "PNG", 20, y, imgWidth, imgHeight, "", "FAST");
    remainingHeight -= pageHeight;
    if (remainingHeight > 0) {
      pdf.addPage();
      y = 20 - (remainingHeight % imgHeight); // reprise
    }
  }

  pdf.save(filename);
}
