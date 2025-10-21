const baseStyles = `
  body { margin:0;background:#FAFAFA;color:#111;font-family:Inter,system-ui,Arial }
  .container{max-width:640px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden}
  .header{padding:20px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:12px}
  .title{font-size:18px;font-weight:700;color:#111}
  .content{padding:24px;line-height:1.6}
  .btn{display:inline-block;background:#E31E24;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:500}
  .muted{color:#6B7280;font-size:12px}
  .footer{padding:16px;border-top:1px solid #E5E7EB;background:#FAFAFA;text-align:center}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th,td{padding:8px;text-align:left;border-bottom:1px solid #E5E7EB}
  th{background:#FAFAFA;font-weight:600}
`;

export function wrapEmailHTML(innerHtml: string, emailTitle = "IMOTION") {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${baseStyles}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">${emailTitle}</div>
        </div>
        <div class="content">${innerHtml}</div>
        <div class="footer">
          <div class="muted">
            © ${new Date().getFullYear()} IMOTION · Intégrateur Apple & IA · contact@imotion.fr
          </div>
        </div>
      </div>
    </body></html>`;
}

export function proposalEmailHtml({
  clientName,
  projectTitle,
  summary,
  milestones,
  contactSignature,
}: {
  clientName: string;
  projectTitle: string;
  summary: string;
  milestones: { title: string; eta?: string; owner?: string }[];
  contactSignature: string;
}) {
  const milestonesHtml = milestones.length > 0 
    ? `
      <table>
        <thead>
          <tr>
            <th>Jalon</th>
            <th>Échéance</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          ${milestones.map(m => `
            <tr>
              <td>${m.title}</td>
              <td>${m.eta || 'À définir'}</td>
              <td>${m.owner || 'IMOTION'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    : '';

  const inner = `
    <p>Bonjour ${clientName},</p>
    <p>Nous avons le plaisir de vous présenter notre proposition pour le projet <b>${projectTitle}</b>.</p>
    <p>${summary}</p>
    ${milestonesHtml}
    <p>Nous restons à votre disposition pour tout ajustement ou précision.</p>
    <p>Cordialement,<br>${contactSignature}<br><b>IMOTION</b></p>
  `;
  return wrapEmailHTML(inner, "Proposition commerciale");
}

export function projectProposalEmail({
  clientName,
  projectTitle,
  message,
  downloadLink,
  companyName = "IMOTION",
}: {
  clientName: string;
  projectTitle: string;
  message: string;
  downloadLink: string;
  companyName?: string;
}) {
  const inner = `
    <p>Bonjour ${clientName},</p>
    <p>Vous trouverez ci-joint notre proposition pour <b>${projectTitle}</b>.</p>
    <p>${message}</p>
    <p><a class="btn" href="${downloadLink}">Télécharger la proposition (PDF)</a></p>
    <p>Nous restons disponibles pour échanger sur cette proposition.</p>
    <p>Cordialement,<br>L'équipe ${companyName}</p>
  `;
  return wrapEmailHTML(inner, "Nouvelle proposition");
}

// Template pour audit prêt avec score
export function auditReportReadyEmail({
  clientName,
  reportUrl,
  score,
}: {
  clientName: string;
  reportUrl: string;
  score?: string;
}) {
  const inner = `
    <h2 style="color:#E31E24;margin-bottom:16px">Votre rapport d'audit est prêt</h2>
    <p>Bonjour ${clientName},</p>
    <p>Votre rapport d'audit personnalisé est maintenant disponible.</p>
    ${score ? `<p style="font-size:18px;font-weight:700;color:#E31E24;margin:16px 0">Score global pondéré : ${score}</p>` : ''}
    <p style="text-align:center;margin:24px 0">
      <a class="btn" href="${reportUrl}">Consulter le rapport complet</a>
    </p>
    <p>Ce rapport inclut :</p>
    <ul style="line-height:1.8">
      <li>Analyse détaillée par secteur</li>
      <li>Axes d'amélioration priorisés avec gains attendus</li>
      <li>Plan d'accompagnement avec jalons et Gantt</li>
    </ul>
    <p>Nous proposons un <strong>atelier de cadrage (2h)</strong> pour valider les priorités et caler le planning.</p>
    <p>Notre équipe reste à votre disposition.</p>
    <p>Cordialement,<br>L'équipe IMOTION<br><span style="color:#6B7280;font-size:12px">Apple • Automatisation • IA</span></p>
  `;
  return wrapEmailHTML(inner, "Rapport d'audit IMOTION");
}

// Template pour devis envoyé
export function quoteSentEmail({
  clientName,
  quoteTitle,
  pdfUrl,
}: {
  clientName: string;
  quoteTitle: string;
  pdfUrl?: string;
}) {
  const inner = `
    <h2 style="color:#D91E18;margin-bottom:16px">Votre devis personnalisé</h2>
    <p>Bonjour ${clientName},</p>
    <p>Nous avons le plaisir de vous transmettre notre devis pour <strong>${quoteTitle}</strong>.</p>
    ${pdfUrl ? `<p style="text-align:center;margin:24px 0"><a class="btn" href="${pdfUrl}">Consulter le devis</a></p>` : ''}
    <p>Vous pouvez le valider directement depuis votre espace client IMOTION.</p>
    <p>Nous restons à votre disposition pour toute question.</p>
    <p>Cordialement,<br>L'équipe IMOTION</p>
  `;
  return wrapEmailHTML(inner, "Devis IMOTION");
}

// Template pour devis validé
export function quoteValidatedEmail({
  clientName,
  quoteTitle,
}: {
  clientName: string;
  quoteTitle: string;
}) {
  const inner = `
    <h2 style="color:#D91E18;margin-bottom:16px">Merci pour votre confiance !</h2>
    <p>Bonjour ${clientName},</p>
    <p>Votre devis pour <strong>${quoteTitle}</strong> a bien été validé.</p>
    <p>Notre équipe prend contact avec vous dans les plus brefs délais pour planifier l'intervention.</p>
    <p>Vous pouvez suivre l'avancement de votre projet depuis votre espace client.</p>
    <p>Cordialement,<br>L'équipe IMOTION</p>
  `;
  return wrapEmailHTML(inner, "Devis validé - IMOTION");
}

// Template pour projet planifié
export function projectPlannedEmail({
  clientName,
  projectTitle,
  startDate,
  technicianName,
}: {
  clientName: string;
  projectTitle: string;
  startDate?: string;
  technicianName?: string;
}) {
  const inner = `
    <h2 style="color:#D91E18;margin-bottom:16px">Planification de votre projet</h2>
    <p>Bonjour ${clientName},</p>
    <p>Votre projet <strong>${projectTitle}</strong> est maintenant planifié.</p>
    ${startDate ? `<p>Date de début prévue : <strong>${startDate}</strong></p>` : ''}
    ${technicianName ? `<p>Technicien référent : ${technicianName}</p>` : ''}
    <p>Vous pouvez suivre l'avancement en temps réel depuis votre espace client.</p>
    <p>Cordialement,<br>L'équipe IMOTION</p>
  `;
  return wrapEmailHTML(inner, "Projet planifié - IMOTION");
}
