# Framework de Tests IMOTION

## Structure

```
tests/
├── unit/          # Tests unitaires
├── integration/   # Tests d'intégration (workflow, edge functions)
├── e2e/          # Tests end-to-end
├── rls/          # Tests de sécurité RLS
├── utils/        # Utilitaires de test
└── reports/      # Rapports générés
```

## Commandes

```bash
# Exécuter tous les tests
npm run test:full

# Tests d'intégration uniquement
npm run test:integration

# Tests unitaires
npm run test:unit

# Tests RLS (sécurité)
npm run test:rls
```

## Rapport

Le rapport HTML est généré dans `tests/reports/last-test-report.html` après chaque exécution.

## Objectifs

✅ Valider le workflow complet (Audit → Devis → Intervention → Projet)
✅ Vérifier l'envoi d'emails avec BCC ops@imotion.tech
✅ Tester les transitions d'état avec guardTransition()
✅ Valider les RLS policies
✅ Mesurer les performances des edge functions
