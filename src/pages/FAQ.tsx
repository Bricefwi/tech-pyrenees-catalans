import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQComponent from "@/components/FAQ";
import ChatAssistant from "@/components/ChatAssistant";

const FAQPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
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