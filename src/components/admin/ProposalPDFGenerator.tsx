import html2pdf from "html2pdf.js";

interface ProposalData {
  clientName: string;
  companyName?: string;
  isIndividual: boolean;
  businessSector?: string;
  serviceType: string;
  title: string;
  specifications: string;
  proposals: string;
  requestNumber?: string;
  proposalNumber?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export const generateProposalPDF = (data: ProposalData) => {
  const serviceTypeLabels: Record<string, string> = {
    development: "Développement Web/Mobile",
    nocode: "Solutions No-Code",
    ai: "Intelligence Artificielle",
    formation: "Formation & Accompagnement",
    maintenance: "Maintenance & Support",
    consulting: "Conseil & Audit"
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1e293b;
          line-height: 1.7;
          background: white;
        }
        .page {
          padding: 0;
          max-width: 100%;
        }
        
        /* En-tête avec logo et informations */
        .document-header {
          display: flex;
          justify-content: space-between;
          padding: 40px 60px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
        }
        .company-info {
          flex: 1;
        }
        .company-info h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .company-info .tagline {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 15px;
        }
        .company-info p {
          font-size: 12px;
          opacity: 0.85;
          margin: 3px 0;
        }
        .client-header-info {
          flex: 1;
          text-align: right;
        }
        .client-header-info h2 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .client-header-info p {
          font-size: 13px;
          opacity: 0.9;
          margin: 3px 0;
        }
        
        /* Bandeau titre */
        .title-banner {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 50px 60px;
          text-align: center;
          border-bottom: 3px solid #0ea5e9;
        }
        .title-banner h1 {
          font-size: 36px;
          color: #0f172a;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        .title-banner .subtitle {
          font-size: 18px;
          color: #64748b;
          font-weight: 300;
        }
        
        /* Références */
        .references {
          display: flex;
          justify-content: space-between;
          padding: 20px 60px;
          background: #f8fafc;
          font-size: 13px;
          color: #475569;
        }
        .references strong {
          color: #0f172a;
        }
        
        /* Contenu principal */
        .content {
          padding: 40px 60px;
        }
        
        .section {
          margin-bottom: 45px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 26px;
          color: #0ea5e9;
          margin-bottom: 25px;
          font-weight: 700;
          padding-bottom: 12px;
          border-bottom: 3px solid #0ea5e9;
        }
        
        .subsection-title {
          font-size: 20px;
          color: #0f172a;
          margin: 25px 0 15px 0;
          font-weight: 600;
        }
        
        .paragraph {
          margin-bottom: 18px;
          font-size: 15px;
          line-height: 1.8;
          color: #334155;
          text-align: justify;
        }
        
        /* Listes à puces personnalisées */
        .bullet-list {
          margin: 20px 0 20px 25px;
        }
        .bullet-item {
          margin-bottom: 12px;
          font-size: 15px;
          line-height: 1.7;
          color: #334155;
          position: relative;
          padding-left: 25px;
        }
        .bullet-item:before {
          content: "•";
          color: #0ea5e9;
          font-size: 20px;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        /* Encadrés */
        .highlight-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 30px;
          border-radius: 8px;
          margin: 30px 0;
          border-left: 6px solid #0ea5e9;
        }
        .highlight-box h3 {
          color: #0369a1;
          font-size: 20px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .highlight-box p {
          color: #0c4a6e;
          font-size: 15px;
          line-height: 1.8;
        }
        
        /* Encadré secondaire */
        .secondary-box {
          background: #fefce8;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 6px solid #f59e0b;
        }
        .secondary-box h4 {
          color: #92400e;
          font-size: 18px;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        /* Tableau de bénéfices */
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 30px 0;
        }
        .benefit-card {
          background: white;
          padding: 25px;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .benefit-card h5 {
          color: #0ea5e9;
          font-size: 17px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .benefit-card p {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
        }
        .percentage {
          color: #10b981;
          font-weight: 700;
          font-size: 18px;
        }
        
        /* Call to action */
        .cta-section {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          padding: 45px;
          border-radius: 8px;
          text-align: center;
          margin: 50px 60px;
        }
        .cta-section h3 {
          font-size: 30px;
          margin-bottom: 18px;
          font-weight: 700;
        }
        .cta-section p {
          font-size: 16px;
          opacity: 0.95;
          line-height: 1.8;
        }
        
        /* Footer */
        .footer {
          padding: 30px 60px;
          background: #f8fafc;
          text-align: center;
          color: #64748b;
          font-size: 13px;
          border-top: 2px solid #e2e8f0;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- En-tête professionnel avec société et client -->
        <div class="document-header">
          <div class="company-info">
            <h1>SIMION DIGITAL</h1>
            <p class="tagline">Transformation Digitale & Innovation</p>
            <p>12 Rue de l'Innovation</p>
            <p>75001 Paris, France</p>
            <p>contact@simion-digital.fr</p>
            <p>+33 1 23 45 67 89</p>
          </div>
          <div class="client-header-info">
            <h2>Client</h2>
            <p><strong>${data.clientName}</strong></p>
            ${!data.isIndividual && data.companyName ? `<p>${data.companyName}</p>` : ''}
            ${data.clientAddress ? `<p>${data.clientAddress}</p>` : ''}
            ${data.clientEmail ? `<p>${data.clientEmail}</p>` : ''}
            ${data.clientPhone ? `<p>${data.clientPhone}</p>` : ''}
          </div>
        </div>

        <!-- Bandeau titre -->
        <div class="title-banner">
          <h1>Proposition Commerciale</h1>
          <div class="subtitle">Solutions Digitales & Transformation Organisationnelle</div>
        </div>

        <!-- Références -->
        <div class="references">
          <div>
            ${data.proposalNumber ? `<strong>Proposition N°:</strong> ${data.proposalNumber}` : ''}
            ${data.requestNumber ? `<strong>Demande N°:</strong> ${data.requestNumber}` : ''}
          </div>
          <div>
            <strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="content">
          <!-- Informations projet -->
          <div class="highlight-box">
            <h3>Projet: ${data.title}</h3>
            <p><strong>Type de service:</strong> ${serviceTypeLabels[data.serviceType] || data.serviceType}</p>
            ${data.businessSector ? `<p><strong>Secteur d'activité:</strong> ${data.businessSector}</p>` : ''}
          </div>

          <!-- Contexte et Besoins -->
          <div class="section">
            <h2 class="section-title">Contexte et Analyse des Besoins</h2>
            
            <div class="paragraph">
              Suite à l'analyse approfondie de votre demande, nous avons identifié vos enjeux stratégiques et opérationnels. Cette proposition présente nos recommandations pour accompagner votre transformation digitale et organisationnelle.
            </div>

            <div class="subsection-title">Besoins Identifiés</div>
            <div class="secondary-box">
              <div style="white-space: pre-wrap; line-height: 1.8;">${data.specifications}</div>
            </div>
          </div>

          <!-- Propositions de Solutions -->
          <div class="section">
            <h2 class="section-title">Nos Propositions de Solutions</h2>
            
            <div class="paragraph">
              Nous vous proposons des solutions sur mesure, conçues pour répondre précisément à vos besoins tout en garantissant une mise en œuvre progressive et maîtrisée. Notre approche privilégie l'optimisation organisationnelle et la transformation durable de vos processus.
            </div>

            <div style="white-space: pre-wrap; line-height: 1.8; margin-top: 25px;">${data.proposals}</div>
          </div>

          <!-- Bénéfices Clés -->
          <div class="section">
            <h2 class="section-title">Bénéfices Attendus</h2>
            
            <div class="benefits-grid">
              <div class="benefit-card">
                <h5>Optimisation Opérationnelle</h5>
                <p>Amélioration des processus et gains de productivité grâce à l'automatisation et la réorganisation des flux de travail.</p>
              </div>
              
              <div class="benefit-card">
                <h5>Transformation Digitale</h5>
                <p>Modernisation technologique pour renforcer votre compétitivité et votre agilité dans un marché en évolution.</p>
              </div>
              
              <div class="benefit-card">
                <h5>ROI Mesurable</h5>
                <p>Solutions évolutives pensées pour générer de la valeur tangible et des résultats mesurables sur le court et moyen terme.</p>
              </div>
              
              <div class="benefit-card">
                <h5>Accompagnement Expert</h5>
                <p>Méthodologie éprouvée et accompagnement personnalisé tout au long du projet pour garantir votre succès.</p>
              </div>
            </div>
          </div>

          <!-- Méthodologie -->
          <div class="section">
            <h2 class="section-title">Notre Méthodologie</h2>
            
            <div class="paragraph">
              Notre approche s'articule autour d'une méthodologie éprouvée qui garantit la réussite de votre projet:
            </div>

            <div class="bullet-list">
              <div class="bullet-item"><strong>Phase de Diagnostic:</strong> Analyse approfondie de vos processus actuels et identification des axes d'amélioration</div>
              <div class="bullet-item"><strong>Conception:</strong> Design des solutions adaptées à votre contexte et validation des choix techniques</div>
              <div class="bullet-item"><strong>Mise en œuvre progressive:</strong> Déploiement par étapes avec validation continue</div>
              <div class="bullet-item"><strong>Formation et transfert de compétences:</strong> Accompagnement de vos équipes pour une autonomie maximale</div>
              <div class="bullet-item"><strong>Optimisation continue:</strong> Suivi des performances et ajustements pour maximiser les résultats</div>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-section">
          <h3>Prochaines Étapes</h3>
          <p>Nous sommes à votre disposition pour échanger sur cette proposition et affiner ensemble les détails de votre projet.</p>
          <p style="margin-top: 20px; font-size: 18px;"><strong>Contactez-nous pour planifier un rendez-vous et recevoir un devis détaillé personnalisé.</strong></p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>SIMION DIGITAL</strong> - Transformation Digitale & Innovation</p>
          <p>Ce document présente nos propositions de solutions. Un devis détaillé vous sera transmis sur demande.</p>
          <p style="margin-top: 10px;">Document confidentiel - ${new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const opt = {
    margin: 0,
    filename: `proposition-${data.proposalNumber || data.requestNumber || 'commercial'}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as const,
      compress: true
    }
  };

  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  
  html2pdf().set(opt).from(element).save();
};
