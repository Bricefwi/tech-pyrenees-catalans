import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  is_admin: boolean;
  created_at: string;
  read: boolean;
}

const ClientRequestChat = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadData();
    
    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`messages:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `service_request_id=eq.${requestId}`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);
      await loadRequestData(user.id);
      await loadMessages();
    } catch (error) {
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequestData = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", requestId)
      .eq("client_user_id", currentUserId)
      .single();

    if (error || !data) {
      toast({
        title: "Erreur",
        description: "Demande introuvable ou accès non autorisé",
        variant: "destructive",
      });
      navigate("/client-dashboard");
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
      console.error("Error loading messages:", error);
      return;
    }

    setMessages(data || []);
    
    // Mark unread admin messages as read
    const unreadAdminMessages = data?.filter(m => m.is_admin && !m.read) || [];
    if (unreadAdminMessages.length > 0) {
      await supabase
        .from("messages")
        .update({ read: true })
        .in('id', unreadAdminMessages.map(m => m.id));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    setIsSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({
        service_request_id: requestId,
        sender_id: userId,
        content: newMessage.trim(),
        is_admin: false,
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      setIsSending(false);
      return;
    }

    setNewMessage("");
    setIsSending(false);
    await loadMessages();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      in_progress: "default",
      completed: "outline",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours",
      completed: "Terminé",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button onClick={() => navigate("/client-dashboard")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Button>

        {requestDetails && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{requestDetails.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Référence: {requestDetails.request_number}
                  </p>
                </div>
                {getStatusBadge(requestDetails.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Type de service:</strong> {requestDetails.service_type}</p>
                <p><strong>Description:</strong> {requestDetails.description}</p>
                {requestDetails.admin_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="font-semibold mb-1">Notes de l'équipe IMOTION:</p>
                    <p className="text-muted-foreground">{requestDetails.admin_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Discussion avec l'équipe IMOTION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-[500px] overflow-y-auto p-4 bg-muted/30 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun message pour le moment.</p>
                  <p className="text-sm mt-2">Commencez la conversation ci-dessous.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.is_admin
                        ? "bg-primary/10 border border-primary/20 mr-12"
                        : "bg-secondary ml-12"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold">
                        {message.is_admin ? "Équipe IMOTION" : "Vous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString("fr-FR", {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="min-h-[80px]"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || isSending}
                className="self-end"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientRequestChat;
