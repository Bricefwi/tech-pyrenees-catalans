import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CGUAcceptanceProps {
  onAccepted?: () => void;
}

export default function CGUAcceptance({ onAccepted }: CGUAcceptanceProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    checkAcceptance();
  }, []);

  const checkAcceptance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("cgu_accepted")
        .eq("user_id", user.id)
        .single();

      if (data?.cgu_accepted) {
        setHasAccepted(true);
        onAccepted?.();
      }
    } catch (error) {
      console.error("Erreur vérification CGU:", error);
    }
  };

  const handleAccept = async () => {
    if (!accepted) {
      toast.error("Vous devez accepter les CGU pour continuer");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("profiles")
        .update({
          cgu_accepted: true,
          cgu_accepted_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("CGU acceptées avec succès");
      setHasAccepted(true);
      onAccepted?.();
    } catch (error) {
      console.error("Erreur acceptation CGU:", error);
      toast.error("Erreur lors de l'acceptation des CGU");
    } finally {
      setLoading(false);
    }
  };

  if (hasAccepted) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg shadow-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4">
          Conditions Générales d'Utilisation
        </h2>
        <div className="max-h-96 overflow-y-auto mb-6 p-4 bg-muted/30 rounded">
          <p className="text-sm text-muted-foreground mb-4">
            Avant de continuer, vous devez accepter nos Conditions Générales
            d'Utilisation.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            En utilisant ce site, vous acceptez que :
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>
              Vos données personnelles seront traitées conformément au RGPD
            </li>
            <li>
              Les échanges et logs peuvent être conservés à des fins
              d'amélioration
            </li>
            <li>
              Les informations fournies par l'IA sont à titre informatif
            </li>
            <li>
              Vous reconnaissez avoir lu et compris les termes d'utilisation
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <Checkbox
            id="cgu"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
          />
          <label
            htmlFor="cgu"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            J'ai lu et j'accepte les{" "}
            <Link
              to="/cgu"
              target="_blank"
              className="text-primary hover:underline"
            >
              Conditions Générales d'Utilisation
            </Link>{" "}
            et les{" "}
            <Link
              to="/cgv"
              target="_blank"
              className="text-primary hover:underline"
            >
              Conditions Générales de Vente
            </Link>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleAccept}
            disabled={!accepted || loading}
            className="w-full md:w-auto"
          >
            {loading ? "Validation..." : "Accepter et continuer"}
          </Button>
        </div>
      </div>
    </div>
  );
}