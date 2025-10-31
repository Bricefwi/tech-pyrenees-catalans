const MentionsLegales = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">
          Mentions Légales
        </h1>
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Éditeur du site</h2>
            <p>
              Le site web <strong>imotion.fr</strong> est édité par :
            </p>
            <div className="mt-3 space-y-1">
              <p><strong>Raison sociale :</strong> IMOTION</p>
              <p><strong>Forme juridique :</strong> [À compléter : SARL, SAS, Auto-entrepreneur, etc.]</p>
              <p><strong>Capital social :</strong> [À compléter si applicable]</p>
              <p><strong>Siège social :</strong> Perpignan, France</p>
              <p><strong>SIRET :</strong> [À compléter]</p>
              <p><strong>TVA intracommunautaire :</strong> [À compléter]</p>
              <p><strong>Email :</strong> <a href="mailto:contact@imotion.fr" className="text-primary hover:underline">contact@imotion.fr</a></p>
              <p><strong>Téléphone :</strong> [À compléter]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Directeur de la publication</h2>
            <p>
              Le directeur de la publication est : [À compléter : Nom du représentant légal]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Hébergement</h2>
            <p>
              Le site est hébergé par :
            </p>
            <div className="mt-3 space-y-1">
              <p><strong>Hébergeur :</strong> Lovable (Supabase)</p>
              <p><strong>Adresse :</strong> [À compléter selon l'hébergeur final]</p>
              <p><strong>Localisation des serveurs :</strong> Union Européenne</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu du site (textes, images, vidéos, logos, icônes, etc.) est la propriété exclusive d'IMOTION ou de ses partenaires, sauf mention contraire.
            </p>
            <p className="mt-2">
              Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable d'IMOTION.
            </p>
            <p className="mt-2">
              Toute exploitation non autorisée du site ou de son contenu engagerait la responsabilité de l'utilisateur et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Marques</h2>
            <p>
              Les marques et logos présents sur le site sont des marques déposées. Toute reproduction non autorisée constitue une contrefaçon passible de sanctions pénales.
            </p>
            <p className="mt-2">
              Apple, Mac, iPhone, iPad et autres marques Apple sont des marques déposées d'Apple Inc. IMOTION est un prestataire indépendant non affilié à Apple Inc.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Liens hypertextes</h2>
            <p>
              Le site peut contenir des liens vers d'autres sites web. IMOTION n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
            <p className="mt-2">
              La création de liens hypertextes vers le site d'IMOTION nécessite une autorisation préalable écrite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Responsabilité</h2>
            <p>
              IMOTION s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site. Toutefois, IMOTION ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations disponibles.
            </p>
            <p className="mt-2">
              IMOTION ne saurait être tenue responsable :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Des interruptions temporaires du site pour maintenance</li>
              <li>Des dommages directs ou indirects résultant de l'utilisation du site</li>
              <li>De l'impossibilité d'accéder au site</li>
              <li>Des virus informatiques ou autres composants nuisibles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Données personnelles</h2>
            <p>
              Les données personnelles collectées sur ce site font l'objet d'un traitement conforme au Règlement Général sur la Protection des Données (RGPD).
            </p>
            <p className="mt-2">
              Pour plus d'informations, consultez notre <a href="/rgpd" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Cookies</h2>
            <p>
              Le site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visite.
            </p>
            <p className="mt-2">
              Vous pouvez gérer vos préférences de cookies via le bandeau de consentement ou les paramètres de votre navigateur. Pour plus d'informations, consultez notre <a href="/rgpd" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige, et après échec de toute tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Médiation</h2>
            <p>
              Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, IMOTION adhère à [À compléter : nom du service de médiation].
            </p>
            <p className="mt-2">
              En cas de litige, vous pouvez déposer une réclamation sur la plateforme de résolution des litiges mise en ligne par la Commission Européenne : <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr/</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact</h2>
            <p>
              Pour toute question concernant les mentions légales, vous pouvez nous contacter :
            </p>
            <div className="mt-3 space-y-1">
              <p><strong>Email :</strong> <a href="mailto:contact@imotion.fr" className="text-primary hover:underline">contact@imotion.fr</a></p>
              <p><strong>Adresse :</strong> Perpignan, France</p>
            </div>
          </section>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Ces mentions légales ont été mises à jour le {new Date().toLocaleDateString('fr-FR')}. IMOTION se réserve le droit de les modifier à tout moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
