import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Loader2, FileText, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Proposal {
  id?: string;
  request_id: string;
  content: string;
  created_at?: string;
}

export default function AdminProposal() {
  const { requestId } = useParams();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [requestId]);

  async function loadData() {
    if (!requestId) return;
    setLoading(true);

    // Charger la demande
    const { data: req, error: reqErr } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqErr) {
      toast({ title: "Erreur", description: reqErr.message });
      setLoading(false);
      return;
    }
    setRequest(req);

    // Charger la proposition existante
    const { data: prop, error: propErr } = await supabase
      .from("quotes")
      .select("*")
      .eq("request_id", requestId)
      .maybeSingle();

    if (propErr) toast({ title: "Erreur", description: propErr.message });
    setProposal(prop || { request_id: requestId, content: "" });

    setLoading(false);
  }

  async function generateProposal() {
    if (!requestId) return;
    setGenerating(true);

    const { data, error } = await supabase.functions.invoke("generate-admin-proposals", {
      body: { requestId },
    });

    if (error) {
      toast({ title: "Erreur IA", description: error.message });
    } else {
      setProposal({ request_id: requestId, content: data?.content || "" });
      toast({ title: "Proposition générée", description: "Contenu IA prêt à être revu." });
    }

    setGenerating(false);
  }

  async function saveProposal() {
    if (!proposal || !requestId) return;

    const payload = {
      request_id: requestId,
      content: proposal.content,
      status: "generated",
    };

    // upsert = insert or update
    const { error } = await supabase.from("quotes").upsert(payload, { onConflict: "request_id" });

    if (error) {
      toast({ title: "Erreur", description: error.message });
    } else {
      toast({ title: "Enregistré", description: "Proposition sauvegardée dans la base." });
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Loader2 className="animate-spin inline-block mr-2" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-2">Proposition commerciale</h1>

      {request && (
        <div className="p-4 bg-slate-50 rounded-lg border">
          <h2 className="font-medium mb-1">{request.title}</h2>
          <p className="text-sm text-gray-600 mb-1">
            Client : {request.client_name || "Inconnu"}
          </p>
          <p className="text-sm text-gray-600">Statut : {request.status}</p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button
          onClick={generateProposal}
          disabled={generating}
          className="flex items-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" /> Génération...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Générer via IA
            </>
          )}
        </Button>

        <Button
          onClick={saveProposal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4" /> Enregistrer
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => window.print()}
        >
          <FileText className="w-4 h-4" /> Télécharger PDF
        </Button>
      </div>

      <Textarea
        rows={20}
        value={proposal?.content || ""}
        onChange={(e) =>
          setProposal({ ...proposal!, content: e.target.value })
        }
        placeholder="Contenu de la proposition commerciale..."
        className="w-full text-sm border rounded-lg p-3 font-mono bg-white"
      />
    </div>
  );
}
