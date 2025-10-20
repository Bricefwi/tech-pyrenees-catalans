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
  const rows = milestones.map(m => `
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;">${m.title}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;">${m.eta || "-"}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;">${m.owner || "-"}</td>
    </tr>
  `).join("");

  return `
  <!doctype html>
  <html lang="fr">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Proposition ${projectTitle}</title>
  </head>
  <body style="font-family:Inter,Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:24px;">
        <h1 style="margin:0 0 4px 0;font-size:20px;">Proposition — ${projectTitle}</h1>
        <p style="margin:0 0 24px 0;color:#64748b;">Destinataire : ${clientName}</p>

        <h2 style="font-size:16px;margin:0 0 8px 0;">Synthèse</h2>
        <p style="margin:0 0 16px 0;line-height:1.6;">${summary}</p>

        <h2 style="font-size:16px;margin:16px 0 8px 0;">Jalons</h2>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th align="left" style="padding:8px;border:1px solid #e5e7eb;">Jalon</th>
              <th align="left" style="padding:8px;border:1px solid #e5e7eb;">Échéance</th>
              <th align="left" style="padding:8px;border:1px solid #e5e7eb;">Responsable</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <p style="margin:24px 0 0 0;color:#64748b;">${contactSignature}</p>
      </td></tr>
    </table>
  </body>
  </html>`;
}

export function projectProposalEmail({
  clientName,
  projectTitle,
  message,
  downloadLink,
  companyName = "Tech Catalan",
}: {
  clientName: string;
  projectTitle: string;
  message: string;
  downloadLink: string;
  companyName?: string;
}) {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: 'Inter', Arial, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 40px 0;
        color: #111827;
      }
      .container {
        background-color: #ffffff;
        max-width: 640px;
        margin: 0 auto;
        padding: 32px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      h1 {
        color: #1e3a8a;
        font-size: 22px;
        margin-bottom: 16px;
      }
      p {
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 16px;
      }
      a.button {
        display: inline-block;
        background-color: #2563eb;
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
      }
      .footer {
        font-size: 12px;
        color: #6b7280;
        margin-top: 32px;
        border-top: 1px solid #e5e7eb;
        padding-top: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Bonjour ${clientName},</h1>
      <p>Vous trouverez ci-joint le document d'analyse et la proposition pour le projet <strong>${projectTitle}</strong>.</p>

      <p>${message}</p>

      <p style="margin-top: 24px;">
        <a href="${downloadLink}" class="button">📄 Télécharger la proposition</a>
      </p>

      <div class="footer">
        ${companyName} — Analyse IA & Transformation Digitale.<br/>
        Ce message a été généré automatiquement par notre plateforme de gestion de projets.
      </div>
    </div>
  </body>
  </html>
  `;
}
