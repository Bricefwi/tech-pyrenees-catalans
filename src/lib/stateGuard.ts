/**
 * IMOTION State Guard - Protection et validation des transitions d'état
 */

import { supabase } from "@/integrations/supabase/client";
import { 
  WorkflowEntity, 
  EntityStatus, 
  isTransitionAllowed, 
  getTransitionActions 
} from "@/domain/workflow";
import { toast } from "sonner";

interface GuardTransitionParams {
  entity: WorkflowEntity;
  entityId: string;
  from: EntityStatus;
  to: EntityStatus;
  userRole?: 'admin' | 'client';
}

/**
 * Vérifie et exécute une transition d'état sécurisée
 */
export async function guardTransition({
  entity,
  entityId,
  from,
  to,
  userRole = 'admin'
}: GuardTransitionParams): Promise<boolean> {
  console.log(`🔒 Guard: Tentative de transition ${entity} ${from} → ${to}`);
  
  // 1. Vérifier si la transition est autorisée
  if (!isTransitionAllowed(entity, from, to, userRole)) {
    console.error(`❌ Transition non autorisée pour le rôle ${userRole}`);
    toast.error("Transition non autorisée");
    return false;
  }
  
  // 2. Récupérer les actions à déclencher
  const actions = getTransitionActions(entity, from, to);
  console.log(`⚙️ Actions à déclencher:`, actions);
  
  // 3. Mettre à jour l'état dans la base
  const tableName = getTableName(entity);
  const { error: updateError } = await supabase
    .from(tableName)
    .update({ status: to })
    .eq('id', entityId);
  
  if (updateError) {
    console.error(`❌ Erreur mise à jour ${entity}:`, updateError);
    toast.error("Erreur lors de la mise à jour");
    return false;
  }
  
  // 4. Déclencher les actions (workflow-hook, emails, etc.)
  for (const action of actions) {
    try {
      if (action === 'workflow-hook') {
        await supabase.functions.invoke('workflow-hook', {
          body: {
            entity_type: entity,
            entity_id: entityId,
            new_status: to,
            old_status: from
          }
        });
      }
    } catch (err) {
      console.error(`⚠️ Erreur action ${action}:`, err);
    }
  }
  
  console.log(`✅ Transition ${entity} réussie: ${from} → ${to}`);
  toast.success("Statut mis à jour avec succès");
  return true;
}

function getTableName(entity: WorkflowEntity): 'audits' | 'quotes' | 'interventions' | 'projects' | 'followups' {
  const tableMap: Record<WorkflowEntity, 'audits' | 'quotes' | 'interventions' | 'projects' | 'followups'> = {
    audit: 'audits',
    quote: 'quotes',
    intervention: 'interventions',
    project: 'projects',
    followup: 'followups'
  };
  return tableMap[entity];
}
