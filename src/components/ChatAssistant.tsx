import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "bot";
  content: string;
  source?: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Bonjour ! Je suis l'assistant de Tech Catalan. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (sessionData?.session?.access_token) {
        headers.authorization = `Bearer ${sessionData.session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-faq`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ question }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur de connexion");
      }

      const data = await response.json();

      if (data.reponse) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: data.reponse,
            source: data.source,
          },
        ]);
      } else {
        throw new Error("Pas de réponse");
      }
    } catch (error) {
      console.error("Erreur chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Désolé, une erreur s'est produite. Veuillez réessayer ou nous contacter directement.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <section id="chat" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Assistant Intelligent
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Posez vos questions — l'assistant consulte d'abord notre FAQ puis
            utilise l'IA si nécessaire.
          </p>

          <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
            <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.source && (
                        <p className="text-xs opacity-70 mt-1">
                          Source: {msg.source === "faq" ? "FAQ" : "IA"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        Rédaction de la réponse...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4 bg-background">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={send} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Vos échanges peuvent être conservés à des fins d'amélioration du
                service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}