import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface Request {
  id: string;
  title: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string } | null;
  quotes?: { id: string; status: string | null }[];
}

export default function Admin() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function loadRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_requests")
      .select("id, title, status, created_at, profiles(full_name), quotes(id, status)")
      .order("created_at", { ascending: false });

    if (error) toast({ title: "Erreur", description: error.message });
    else setRequests(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = requests.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  function colorForStatus(status: string) {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-50 text-gray-600";
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold mb-2">Administration</h1>
      <p className="text-gray-600 mb-4">
        Suivi global des demandes et des propositions commerciales.
      </p>

      {/* ---- Filtres ---- */}
      <div className="flex gap-2 mb-4">
        {["all", "pending", "in_progress", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md border ${
              filter === f ? "bg-blue-500 text-white" : "bg-white text-gray-700"
            }`}
          >
            {f === "all"
              ? "Toutes"
              : f === "pending"
              ? "En attente"
              : f === "in_progress"
              ? "En cours"
              : "Terminées"}
          </button>
        ))}
      </div>

      {/* ---- Tableau principal ---- */}
      {loading && <p className="text-gray-500">Chargement…</p>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Titre</th>
                <th className="text-left px-3 py-2 font-medium">Client</th>
                <th className="text-left px-3 py-2 font-medium">Date</th>
                <th className="text-left px-3 py-2 font-medium">Statut</th>
                <th className="text-left px-3 py-2 font-medium">Devis</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr
                  key={req.id}
                  className="border-b hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {req.title || "Sans titre"}
                  </td>
                  <td className="px-3 py-2">{req.profiles?.full_name || "—"}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {format(new Date(req.created_at), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-md font-medium ${colorForStatus(
                        req.status
                      )}`}
                    >
                      {req.status === "pending"
                        ? "En attente"
                        : req.status === "in_progress"
                        ? "En cours"
                        : "Terminée"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {req.quotes && req.quotes.length > 0 ? (
                      <span className="text-blue-600 font-medium cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/proposal/${req.id}`)
                        }>
                        Devis #{req.quotes[0].id.slice(0, 6)}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Aucun</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => navigate(`/admin/proposal/${req.id}`)}
                    >
                      Ouvrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="text-gray-500 mt-4">Aucune demande trouvée.</p>
          )}
        </div>
      )}
    </div>
  );
}
