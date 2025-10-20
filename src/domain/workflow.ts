/**
 * IMOTION Workflow Domain - Définition des états et transitions
 */

export type WorkflowEntity = 'audit' | 'quote' | 'intervention' | 'project' | 'followup';

export type AuditStatus = 'in_progress' | 'completed' | 'report_generated';
export type QuoteStatus = 'pending' | 'sent' | 'accepted' | 'rejected';
export type InterventionStatus = 'En attente' | 'Planifiée' | 'En cours' | 'Terminée';
export type ProjectStatus = 'pending' | 'active' | 'done';

export type EntityStatus = AuditStatus | QuoteStatus | InterventionStatus | ProjectStatus;

export interface WorkflowTransition {
  entity: WorkflowEntity;
  from: EntityStatus;
  to: EntityStatus;
  allowedRoles: ('admin' | 'client')[];
  triggerActions?: string[];
}

/**
 * Matrice des transitions autorisées
 */
export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  // Audits
  { entity: 'audit', from: 'in_progress', to: 'completed', allowedRoles: ['admin', 'client'], triggerActions: ['generate-report'] },
  { entity: 'audit', from: 'completed', to: 'report_generated', allowedRoles: ['admin'], triggerActions: ['send-email'] },
  
  // Devis
  { entity: 'quote', from: 'pending', to: 'sent', allowedRoles: ['admin'], triggerActions: ['send-email', 'workflow-hook'] },
  { entity: 'quote', from: 'sent', to: 'accepted', allowedRoles: ['admin', 'client'], triggerActions: ['create-order', 'workflow-hook'] },
  { entity: 'quote', from: 'sent', to: 'rejected', allowedRoles: ['admin', 'client'], triggerActions: ['workflow-hook'] },
  
  // Interventions
  { entity: 'intervention', from: 'En attente', to: 'Planifiée', allowedRoles: ['admin'], triggerActions: ['workflow-hook'] },
  { entity: 'intervention', from: 'Planifiée', to: 'En cours', allowedRoles: ['admin'], triggerActions: ['workflow-hook'] },
  { entity: 'intervention', from: 'En cours', to: 'Terminée', allowedRoles: ['admin'], triggerActions: ['workflow-hook', 'create-followup'] },
  
  // Projets
  { entity: 'project', from: 'pending', to: 'active', allowedRoles: ['admin'] },
  { entity: 'project', from: 'active', to: 'done', allowedRoles: ['admin'], triggerActions: ['create-followup'] },
];

/**
 * Vérifie si une transition est autorisée
 */
export function isTransitionAllowed(
  entity: WorkflowEntity,
  from: EntityStatus,
  to: EntityStatus,
  userRole: 'admin' | 'client'
): boolean {
  const transition = WORKFLOW_TRANSITIONS.find(
    t => t.entity === entity && t.from === from && t.to === to
  );
  
  if (!transition) return false;
  return transition.allowedRoles.includes(userRole);
}

/**
 * Récupère les actions à déclencher pour une transition
 */
export function getTransitionActions(
  entity: WorkflowEntity,
  from: EntityStatus,
  to: EntityStatus
): string[] {
  const transition = WORKFLOW_TRANSITIONS.find(
    t => t.entity === entity && t.from === from && t.to === to
  );
  
  return transition?.triggerActions || [];
}
