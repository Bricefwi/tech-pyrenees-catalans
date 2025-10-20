import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X } from "lucide-react";

export default function AnalysesHistory() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    async function loadAnalyses() {
      const { data, error } = await supabase
        .from("analyses")
        .select(`
          id, 
          created_at, 
          contenu, 
          profiles(full_name), 
          service_requests(title, request_number)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAnalyses(data);
      }
      setLoading(false);
    }
    loadAnalyses();
  }, []);

  const filtered = analyses.filter((a) =>
    filter
      ? JSON.stringify(a.contenu).toLowerCase().includes(filter.toLowerCase()) ||
        a.profiles?.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
        a.service_requests?.title?.toLowerCase().includes(filter.toLowerCase())
      : true
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Historique des Analyses IA</h1>
        <Button variant="outline" onClick={() => window.location.href = "/analyze"}>
          Nouvelle analyse
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher par client, demande ou mot-clé..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des analyses...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {filter ? "Aucune analyse trouvée pour cette recherche." : "Aucune analyse enregistrée."}
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map((a) => (
          <Card
            key={a.id}
            onClick={() => setSelected(a)}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {a.contenu?.client || "Client inconnu"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {a.service_requests?.request_number && `${a.service_requests.request_number} - `}
                    {a.service_requests?.title || "Sans demande liée"}
                  </p>
                  {a.profiles?.full_name && (
                    <p className="text-xs text-muted-foreground">
                      Par {a.profiles.full_name}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Fenêtre de détail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected?.contenu?.client || "Client inconnu"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selected?.service_requests?.request_number && `${selected.service_requests.request_number} - `}
              {selected?.service_requests?.title || "Sans demande liée"} —{" "}
              {selected && new Date(selected.created_at).toLocaleString("fr-FR")}
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            {selected?.contenu?.specs && (
              <div>
                <h3 className="font-semibold mb-2">Cahier des charges</h3>
                <div className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
                  {selected.contenu.specs}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold mb-2">Analyse IA</h3>
              <div className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
                {selected?.contenu?.analysis || "Analyse indisponible."}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
