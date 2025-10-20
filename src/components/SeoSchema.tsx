import { Helmet } from "react-helmet-async";

type SeoSchemaProps = {
  type: "Organization" | "Service" | "Product";
  name: string;
  description: string;
  url: string;
  image?: string;
  serviceType?: string;
  areaServed?: string;
  offersName?: string;
  offersPrice?: string;
};

export default function SeoSchema({
  type,
  name,
  description,
  url,
  image = "https://imotion.fr/logo-imotion.png",
  serviceType,
  areaServed = "France, Espagne",
  offersName,
  offersPrice,
}: SeoSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url,
    image,
    serviceType,
    provider: {
      "@type": "Organization",
      name: "IMOTION",
      url: "https://imotion.fr",
      logo: "https://imotion.fr/logo-imotion.png",
    },
    areaServed,
    offers: offersName
      ? {
          "@type": "Offer",
          name: offersName,
          price: offersPrice || "Sur devis",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url,
        }
      : undefined,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
