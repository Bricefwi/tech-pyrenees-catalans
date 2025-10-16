import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CGV = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">
            Conditions Générales de Vente (CGV)
          </h1>
          <p className="text-muted-foreground mb-8">
            Dernière mise à jour : 16 octobre 2025
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Objet</h2>
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les
                prestations techniques proposées par Tech Catalan (le
                Prestataire) :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Diagnostic, réparation, maintenance, installation,
                  intervention sur site ou à distance pour matériel Apple
                </li>
                <li>
                  Développement web et mobile (applications, sites internet)
                </li>
                <li>
                  Accompagnement Digital / IA / NoCode pour la mise en place de
                  solutions digitales, IA ou no-code (Bubble, Airtable, Make,
                  etc.)
                </li>
                <li>
                  Audit Technologique / Organisationnel : réalisation d'un audit
                  technologique, organisationnel ou numérique
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Devis</h2>
              <p>
                Tout devis établi est valable 30 jours. L'acceptation du devis
                vaut commande ferme. Les tarifs sont en euros HT, TVA applicable
                en sus.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Commande</h2>
              <p>
                La commande est réputée acceptée dès signature du devis ou
                validation en ligne. Toute modification ultérieure peut donner
                lieu à un avenant tarifé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                4. Modalités de paiement
              </h2>
              <p>
                Les prestations sont facturables selon les modalités suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Interventions techniques</strong> : paiement à la
                  livraison ou fin d'intervention
                </li>
                <li>
                  <strong>Développement et accompagnement</strong> : acompte de
                  30-50% à la commande, solde à la livraison
                </li>
                <li>
                  <strong>Audit</strong> : 50% à la commande, 50% à remise du
                  rapport
                </li>
              </ul>
              <p className="mt-3">
                Délai de paiement : 15 jours à réception de facture. En cas de
                retard, pénalités de 3 fois le taux d'intérêt légal + indemnité
                forfaitaire de 40€.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Livraison</h2>
              <p>
                Les délais annoncés sont indicatifs. Tech Catalan s'engage à
                respecter au mieux les délais convenus. Tout retard ne peut
                donner lieu à annulation ou indemnité sauf accord préalable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Garanties</h2>
              <p>
                <strong>Réparations</strong> : garantie 3 mois sur pièces et
                main d'œuvre. Hors dommages accidentels ou usure normale.
              </p>
              <p className="mt-2">
                <strong>Développement et audit</strong> : obligation de moyens.
                Aucune garantie de résultat commercial ou technique au-delà des
                spécifications validées.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                7. Propriété intellectuelle
              </h2>
              <p>
                Toute création (code, design, documentation) reste propriété du
                Prestataire jusqu'au paiement intégral. Une licence d'usage non
                exclusive est ensuite accordée au Client.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                8. Confidentialité
              </h2>
              <p>
                Les deux parties s'engagent à respecter la confidentialité des
                informations échangées pendant la durée de la prestation et 3
                ans après.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                9. Données personnelles
              </h2>
              <p>
                Conformité RGPD. Les données sont traitées uniquement pour
                l'exécution de la prestation et la relation commerciale. Droits
                d'accès, rectification, suppression sur demande à
                contact@tech-catalan.fr
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                10. Responsabilité
              </h2>
              <p>
                La responsabilité du Prestataire est limitée au montant HT de la
                prestation. Aucune responsabilité en cas de perte de données,
                lucre cessant ou préjudice indirect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Résiliation</h2>
              <p>
                En cas de manquement grave, résiliation possible après mise en
                demeure de 15 jours restée sans effet. Indemnisation au prorata
                des travaux réalisés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                12. Force majeure
              </h2>
              <p>
                Aucune partie ne sera responsable en cas d'impossibilité
                d'exécution due à un cas de force majeure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Litiges</h2>
              <p>
                Droit français applicable. En cas de litige, compétence du
                Tribunal de Commerce du siège de Tech Catalan (Perpignan).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">14. Contact</h2>
              <p>
                Tech Catalan
                <br />
                Perpignan, France
                <br />
                Email :{" "}
                <a
                  href="mailto:contact@tech-catalan.fr"
                  className="text-primary hover:underline"
                >
                  contact@tech-catalan.fr
                </a>
              </p>
            </section>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                L'acceptation d'un devis vaut acceptation sans réserve des
                présentes CGV.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CGV;