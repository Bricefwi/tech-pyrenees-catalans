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
          color: #1a1a1a;
          line-height: 1.6;
          background: white;
        }
        .page {
          padding: 60px;
          max-width: 100%;
        }
        .header {
          text-align: center;
          margin-bottom: 50px;
          padding-bottom: 30px;
          border-bottom: 4px solid #0ea5e9;
        }
        .header h1 {
          font-size: 42px;
          color: #0ea5e9;
          margin-bottom: 10px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .header .subtitle {
          font-size: 20px;
          color: #64748b;
          font-weight: 300;
        }
        .reference {
          text-align: right;
          color: #64748b;
          font-size: 14px;
          margin-bottom: 40px;
        }
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 24px;
          color: #0ea5e9;
          margin-bottom: 20px;
          font-weight: 600;
          border-left: 5px solid #0ea5e9;
          padding-left: 15px;
        }
        .client-info {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          border-left: 5px solid #0ea5e9;
        }
        .client-info .label {
          font-weight: 600;
          color: #0369a1;
          display: inline-block;
          min-width: 140px;
        }
        .client-info p {
          margin-bottom: 12px;
          font-size: 16px;
        }
        .highlight-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border-left: 5px solid #f59e0b;
        }
        .highlight-box h3 {
          color: #92400e;
          font-size: 20px;
          margin-bottom: 12px;
          font-weight: 600;
        }
        .highlight-box p {
          color: #78350f;
          font-size: 15px;
          line-height: 1.7;
        }
        .content-box {
          background: #f8fafc;
          padding: 30px;
          border-radius: 12px;
          margin: 20px 0;
          border: 2px solid #e2e8f0;
        }
        .content-box h4 {
          color: #0369a1;
          font-size: 18px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .content-text {
          white-space: pre-wrap;
          line-height: 1.8;
          color: #334155;
          font-size: 15px;
        }
        .solutions-list {
          margin: 20px 0;
        }
        .solution-item {
          background: white;
          padding: 25px;
          margin: 15px 0;
          border-radius: 10px;
          border-left: 4px solid #10b981;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .solution-item h5 {
          color: #059669;
          font-size: 18px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .benefit-tag {
          display: inline-block;
          background: #d1fae5;
          color: #065f46;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          margin: 8px 5px 8px 0;
          font-weight: 500;
        }
        .cta-section {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          margin-top: 50px;
        }
        .cta-section h3 {
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .cta-section p {
          font-size: 16px;
          opacity: 0.95;
          line-height: 1.7;
        }
        .footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .emphasis {
          color: #0369a1;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- En-tête -->
        <div class="header">
          <h1>Proposition de Solutions Digitales</h1>
          <div class="subtitle">Transformation & Innovation</div>
        </div>

        ${data.requestNumber ? `<div class="reference">Référence: ${data.requestNumber}</div>` : ''}

        <!-- Informations Client -->
        <div class="client-info">
          <p><span class="label">Client:</span> ${data.clientName}</p>
          ${!data.isIndividual && data.companyName ? 
            `<p><span class="label">Entreprise:</span> ${data.companyName}</p>` : ''}
          ${data.businessSector ? 
            `<p><span class="label">Secteur d'activité:</span> ${data.businessSector}</p>` : ''}
          <p><span class="label">Type de service:</span> ${serviceTypeLabels[data.serviceType] || data.serviceType}</p>
          <p><span class="label">Projet:</span> ${data.title}</p>
        </div>

        <!-- Contexte et Besoins -->
        <div class="section">
          <h2 class="section-title">📋 Contexte et Besoins Identifiés</h2>
          <div class="highlight-box">
            <h3>Votre Vision</h3>
            <p>Nous avons analysé vos besoins et votre vision pour ce projet. Voici notre compréhension de vos objectifs et des enjeux identifiés.</p>
          </div>
          <div class="content-box">
            <div class="content-text">${data.specifications}</div>
          </div>
        </div>

        <!-- Nos Propositions -->
        <div class="section">
          <h2 class="section-title">💡 Nos Solutions sur Mesure</h2>
          <div class="highlight-box">
            <h3>Approche Personnalisée</h3>
            <p>Nous avons conçu une stratégie adaptée à vos besoins spécifiques, combinant innovation technologique et expertise métier pour maximiser votre retour sur investissement.</p>
          </div>
          <div class="content-box">
            <div class="content-text">${data.proposals}</div>
          </div>
        </div>

        <!-- Bénéfices Clés -->
        <div class="section">
          <h2 class="section-title">🎯 Bénéfices et Optimisations</h2>
          <div class="solutions-list">
            <div class="solution-item">
              <h5>Gain de Productivité</h5>
              <p>Automatisation des processus répétitifs et optimisation des workflows pour libérer du temps sur les tâches à forte valeur ajoutée.</p>
              <div>
                <span class="benefit-tag">⏱️ Gain de temps</span>
                <span class="benefit-tag">📊 Efficacité accrue</span>
              </div>
            </div>
            <div class="solution-item">
              <h5>Transformation Digitale</h5>
              <p>Modernisation de vos outils et processus pour rester compétitif dans un environnement en constante évolution.</p>
              <div>
                <span class="benefit-tag">🚀 Innovation</span>
                <span class="benefit-tag">💼 Compétitivité</span>
              </div>
            </div>
            <div class="solution-item">
              <h5>Retour sur Investissement</h5>
              <p>Solutions évolutives pensées pour générer de la valeur dès le court terme tout en assurant une croissance pérenne.</p>
              <div>
                <span class="benefit-tag">💰 ROI mesurable</span>
                <span class="benefit-tag">📈 Scalabilité</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-section">
          <h3>Prêt à Transformer Votre Vision en Réalité ?</h3>
          <p>Notre équipe d'experts est à votre disposition pour échanger sur votre projet et affiner ensemble les détails de cette proposition.</p>
          <p style="margin-top: 20px; font-size: 18px;"><strong>Contactez-nous pour une étude personnalisée et un devis détaillé.</strong></p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Ce document présente nos propositions de solutions. Un devis détaillé vous sera transmis sur demande.</p>
          <p style="margin-top: 10px;">Document généré le ${new Date().toLocaleDateString('fr-FR', { 
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
    filename: `proposition-commerciale-${data.requestNumber || 'client'}.pdf`,
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
