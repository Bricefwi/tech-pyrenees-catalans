import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  id: string;
  question: string;
  reponse: string;
  category: string | null;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [search, setSearch] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    loadFAQs();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const query = search.toLowerCase();
      setFilteredFaqs(
        faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            faq.reponse.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredFaqs(faqs);
    }
  }, [search, faqs]);

  const loadFAQs = async () => {
    const { data, error } = await supabase
      .from("faq")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Erreur chargement FAQ:", error);
    } else {
      setFaqs(data || []);
      setFilteredFaqs(data || []);
    }
  };

  return (
    <section id="faq" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Questions Fréquentes
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Recherchez un mot-clé ou parcourez les questions — l'assistant peut
            répondre automatiquement.
          </p>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="🔍 Rechercher dans la FAQ (ex: devis, Apple, IA...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {faq.reponse}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">
              Aucune question trouvée. Essayez l'assistant ci-dessous pour
              obtenir une réponse personnalisée.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}