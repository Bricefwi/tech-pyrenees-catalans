const RGPD = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">
          Politique de confidentialité et protection des données (RGPD)
        </h1>
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Responsable du traitement</h2>
            <p>
              IMOTION, ci-après "le Responsable", est responsable du traitement de vos données personnelles.
            </p>
            <p className="mt-2">
              <strong>Contact :</strong> contact@imotion.fr<br />
              <strong>Siège social :</strong> Perpignan, France
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Données collectées</h2>
            <p>
              Nous collectons les données suivantes dans le cadre de nos services :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
              <li><strong>Données de l'entreprise :</strong> nom de l'entreprise, secteur d'activité, taille</li>
              <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, durée de visite</li>
              <li><strong>Cookies :</strong> cookies techniques et de mesure d'audience</li>
              <li><strong>Données techniques :</strong> informations sur vos équipements Apple, besoins en solutions IA</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Finalités du traitement</h2>
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Réalisation d'audits et diagnostics techniques</li>
              <li>Établissement de devis et gestion des commandes</li>
              <li>Communication commerciale (avec votre consentement)</li>
              <li>Amélioration de nos services et analyses statistiques</li>
              <li>Respect de nos obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Base légale du traitement</h2>
            <p>
              Le traitement de vos données repose sur les bases légales suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Exécution d'un contrat :</strong> pour la fourniture de nos services</li>
              <li><strong>Consentement :</strong> pour les communications marketing et cookies non essentiels</li>
              <li><strong>Intérêt légitime :</strong> pour l'amélioration de nos services</li>
              <li><strong>Obligation légale :</strong> pour la conformité comptable et fiscale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Destinataires des données</h2>
            <p>
              Vos données peuvent être communiquées aux destinataires suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personnel autorisé d'IMOTION</li>
              <li>Prestataires techniques (hébergement, maintenance)</li>
              <li>Services de paiement sécurisés</li>
              <li>Autorités compétentes sur demande légale</li>
            </ul>
            <p className="mt-2">
              Aucune donnée n'est vendue à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant les durées suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Données clients :</strong> pendant la durée de la relation commerciale + 3 ans</li>
              <li><strong>Données prospects :</strong> 3 ans à compter du dernier contact</li>
              <li><strong>Données comptables :</strong> 10 ans (obligation légale)</li>
              <li><strong>Logs de connexion :</strong> 1 an maximum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@imotion.fr" className="text-primary hover:underline">contact@imotion.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement des communications (HTTPS/SSL)</li>
              <li>Contrôle d'accès strict aux données</li>
              <li>Sauvegardes régulières et sécurisées</li>
              <li>Hébergement sur des serveurs sécurisés en Europe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Cookies et traceurs</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences via le bandeau de consentement qui apparaît lors de votre première visite.
            </p>
            <p className="mt-2">
              Types de cookies utilisés :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies analytiques :</strong> mesure d'audience (anonymisés)</li>
              <li><strong>Cookies fonctionnels :</strong> mémorisation de vos préférences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Transferts internationaux</h2>
            <p>
              Vos données sont hébergées en Europe. En cas de transfert hors UE, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, Privacy Shield, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Réclamation</h2>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :
            </p>
            <p className="mt-2">
              <strong>CNIL</strong><br />
              3 Place de Fontenoy - TSA 80715<br />
              75334 PARIS CEDEX 07<br />
              Tél : 01 53 73 22 22<br />
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique à tout moment. Les modifications entrent en vigueur dès leur publication sur cette page.
            </p>
          </section>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              En utilisant nos services, vous acceptez cette politique de confidentialité. Pour toute question : <a href="mailto:contact@imotion.fr" className="text-primary hover:underline">contact@imotion.fr</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RGPD;
