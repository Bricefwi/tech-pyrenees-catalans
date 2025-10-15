import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  is_admin: boolean;
  created_at: string;
  read: boolean;
}

const AdminRequestChat = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState<any>(null);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [requestId]);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administration",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await loadRequestData();
      await loadMessages();
    } catch (error) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequestData = async () => {
    const { data, error } = await supabase
      .from("service_requests")
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          email,
          mobile_phone
        )
      `)
      .eq("id", requestId)
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la demande",
        variant: "destructive",
      });
      return;
    }

    setRequestDetails(data);
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("service_request_id", requestId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        service_request_id: requestId,
        sender_id: user.id,
        content: newMessage,
        is_admin: true,
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
    await loadMessages();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button onClick={() => navigate("/admin")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {requestDetails && (
          <Card>
            <CardHeader>
              <CardTitle>{requestDetails.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Client:</strong> {requestDetails.profiles?.first_name} {requestDetails.profiles?.last_name}</p>
                <p><strong>Email:</strong> {requestDetails.profiles?.email}</p>
                <p><strong>Téléphone:</strong> {requestDetails.profiles?.mobile_phone}</p>
                <p><strong>Description:</strong> {requestDetails.description}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.is_admin
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-muted mr-12"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRequestChat;
