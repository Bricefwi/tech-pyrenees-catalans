import { Helmet } from "react-helmet-async";
import SeoSchema from "@/components/SeoSchema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQComponent from "@/components/FAQ";
import ChatAssistant from "@/components/ChatAssistant";

const FAQPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>FAQ – Questions fréquentes – IMOTION</title>
        <meta name="description" content="Trouvez des réponses aux questions fréquentes sur les services IMOTION : réparation Apple, automatisation IA, développement no-code." />
        <link rel="canonical" href="https://imotion.fr/faq" />
      </Helmet>

      <SeoSchema
        type="Service"
        name="FAQ & Support IMOTION"
        description="Questions fréquentes et assistance pour les services IMOTION : Apple, IA, automatisation."
        url="https://imotion.fr/faq"
        serviceType="Support client"
      />

      <Header />
      <main className="flex-1">
        <FAQComponent />
        <ChatAssistant />
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;