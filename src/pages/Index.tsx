import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ZoneIntervention from "@/components/ZoneIntervention";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <ZoneIntervention />
      </main>
    </div>
  );
};

export default Index;
