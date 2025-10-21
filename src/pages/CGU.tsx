const CGU = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">
          Conditions Générales d'Utilisation (CGU)
        </h1>
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : 16 octobre 2025
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU)
              régissent l'accès et l'utilisation du site web et des services
              fournis par Tech Catalan (ci-après "le Service").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Acceptation</h2>
            <p>
              L'accès et l'utilisation du site impliquent l'acceptation
              implicite et sans réserve des présentes CGU. En utilisant le
              Service, l'utilisateur déclare accepter les termes décrits
              ci-après.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Services</h2>
            <p>
              Le Service propose des diagnostics, des devis, des prestations
              de réparation Apple, développement web/mobile, automatisation,
              intégration IA, no-code et des conseils digitaux. Les
              descriptions et tarifs sont susceptibles d'évoluer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              4. Responsabilités
            </h2>
            <p>
              Tech Catalan s'efforce de fournir des informations exactes.
              Toutefois, les réponses automatisées (IA) sont fournies à titre
              informatif et ne remplacent pas un diagnostic professionnel.
              Tech Catalan ne saurait être tenu responsable des dommages
              indirects résultant de l'utilisation des informations fournies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              5. Données personnelles
            </h2>
            <p>
              Les données collectées sont traitées conformément à la politique
              de confidentialité et au RGPD. Pour toute demande d'exercice des
              droits (accès, rectification, suppression), contactez-nous à :{" "}
              <a
                href="mailto:contact@tech-catalan.fr"
                className="text-primary hover:underline"
              >
                contact@tech-catalan.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              6. Archivage et preuve
            </h2>
            <p>
              Les échanges et logs peuvent être conservés à des fins
              d'amélioration du service et de preuve. L'utilisateur accepte
              cette conservation lors de l'utilisation du site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              7. Propriété intellectuelle
            </h2>
            <p>
              Tous les contenus du site sont la propriété de Tech Catalan ou
              de ses partenaires. Toute reproduction est strictement interdite
              sans autorisation écrite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              8. Loi applicable
            </h2>
            <p>
              Les présentes CGU sont soumises au droit français. Tout litige
              relève des tribunaux compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
            <p>
              Pour toute question :{" "}
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
              En utilisant ce site, vous reconnaissez avoir lu et accepté ces
              conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGU;
