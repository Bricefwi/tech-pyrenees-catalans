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
