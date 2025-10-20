import jsPDF from 'jspdf';

export const generateCharteSEO = async (): Promise<Blob> => {
  const doc = new jsPDF();
  let yPos = 20;

  // Configuration des couleurs
  const primaryColor: [number, number, number] = [220, 38, 38];
  const textColor: [number, number, number] = [51, 51, 51];

  // En-tête avec logo
  doc.setFontSize(28);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('IMOTION', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Expert Apple & IA – Innovation Catalane', 105, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 15;
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CHARTE SEO & IA', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Document de référence – Révision 1.0', 105, yPos, { align: 'center' });

  // Partie 1
  yPos += 20;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. PRÉSENTATION VISUELLE & CHARTE GRAPHIQUE', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const section1 = [
    'Typographie :',
    '- Police principale : Inter, système sans-serif moderne',
    '- Police secondaire : -apple-system, BlinkMacSystemFont',
    '- Hiérarchie : H1 (32px), H2 (24px), H3 (20px), Body (16px)',
    '',
    'Couleurs :',
    '- Primaire : #DC2626 (Rouge signature IMOTION)',
    '- Secondaire : #1E293B (Gris foncé professionnel)',
    '- Accent : #F97316 (Orange énergique)',
    '- Fond : #FFFFFF / #F8FAFC',
    '',
    'Logo :',
    '- Format : PNG haute résolution',
    '- Fond blanc avec accent rouge',
    '- Utilisation : En-tête, documents officiels',
    '- Taille minimale : 120px hauteur'
  ];

  section1.forEach(line => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    doc.text(line, 20, yPos);
    yPos += 5;
  });

  // Partie 2
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('2. OPTIMISATION SEO', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const section2 = [
    'Balises Meta :',
    '- Title : Max 60 caractères, mot-clé principal',
    '- Description : 150-160 caractères',
    '- Keywords : "Expert Apple", "IA", "Innovation", "Catalogne"',
    '',
    'Structure HTML :',
    '- Un seul H1 par page',
    '- Balises sémantiques : header, main, section',
    '',
    'Images :',
    '- Alt descriptif avec mots-clés',
    '- Format WebP, lazy loading',
    '',
    'Fichiers :',
    '- robots.txt, sitemap.xml',
    '- Schema.org : Organization, LocalBusiness'
  ];

  section2.forEach(line => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    doc.text(line, 20, yPos);
    yPos += 5;
  });

  // Partie 3
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('3. INDEXATION IA', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const section3 = [
    'Contenu Structuré :',
    '- Réponses claires FAQ',
    '- JSON-LD pour entités',
    '',
    'Microdonnées :',
    '- Organization, LocalBusiness, Service',
    '',
    'Perplexity/ChatGPT/Gemini :',
    '- Langage naturel',
    '- Contexte géographique Catalogne'
  ];

  section3.forEach(line => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    doc.text(line, 20, yPos);
    yPos += 5;
  });

  // Partie 4
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('4. PERFORMANCE & ACCESSIBILITÉ', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const section4 = [
    'Core Web Vitals :',
    '- LCP < 2.5s, FID < 100ms, CLS < 0.1',
    '- Score Lighthouse > 90',
    '',
    'Optimisations :',
    '- Code splitting, compression',
    '- Cache optimisé',
    '',
    'Accessibilité WCAG 2.1 :',
    '- Contraste 4.5:1',
    '- Navigation clavier',
    '- ARIA sur éléments interactifs'
  ];

  section4.forEach(line => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    doc.text(line, 20, yPos);
    yPos += 5;
  });

  // Partie 5
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('5. CONFORMITÉ RGPD', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const section5 = [
    'Protection Données :',
    '- Stockage sécurisé RLS',
    '- SSL/TLS, consentement explicite',
    '',
    'Cookies :',
    '- Banner RGPD, analytics anonymisé',
    '',
    'Versioning :',
    '- Version 1.0 (2025)',
    '- Révision trimestrielle'
  ];

  section5.forEach(line => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    doc.text(line, 20, yPos);
    yPos += 5;
  });

  // Footer
  yPos += 20;
  if (yPos > 260) { doc.addPage(); yPos = 20; }
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Document officiel IMOTION – Révision 1.0 – 2025', 105, yPos, { align: 'center' });
  yPos += 5;
  doc.text('www.imotion.tech • contact@imotion.tech', 105, yPos, { align: 'center' });

  return doc.output('blob');
};

