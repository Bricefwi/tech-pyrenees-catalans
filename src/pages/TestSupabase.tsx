import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabase() {
  const [message, setMessage] = useState("Vérification...");

  useEffect(() => {
    async function checkConnection() {
      const { data, error } = await supabase.from("service_requests").select("*").limit(1);
      if (error) setMessage("❌ Erreur : " + error.message);
      else setMessage("✅ Connexion OK (" + (data?.length || 0) + " enregistrements trouvés)");
    }
    checkConnection();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Test connexion Supabase</h1>
      <p>{message}</p>
    </div>
  );
}
