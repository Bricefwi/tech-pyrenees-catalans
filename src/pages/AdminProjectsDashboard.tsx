import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function AdminProjectsDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, status, client_name, start_date, end_date, critical_points, progress")
        .order("start_date", { ascending: true });

      if (!error && data) setProjects(data);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-80 text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Chargement du tableau de bord...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Pilotage des Projets IA & Accompagnements</h1>

      {projects.length === 0 ? (
        <p className="text-gray-500">Aucun projet enregistré pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">{p.title}</h2>
                <StatusBadge status={p.status} />
              </div>

              <p className="text-sm text-gray-600 mb-1">
                Client : <span className="font-medium">{p.client_name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Du {new Date(p.start_date).toLocaleDateString("fr-FR")} au{" "}
                {new Date(p.end_date).toLocaleDateString("fr-FR")}
              </p>

              <div className="mt-3">
                <ProgressBar value={p.progress || 0} />
              </div>

              {p.critical_points && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ {p.critical_points.length} point(s) critique(s)
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, any> = {
    pending: { color: "bg-yellow-100 text-yellow-700", icon: <Clock size={16} /> },
    active: { color: "bg-blue-100 text-blue-700", icon: <AlertTriangle size={16} /> },
    done: { color: "bg-green-100 text-green-700", icon: <CheckCircle size={16} /> },
  };

  const cfg = map[status] || map["pending"];
  return (
    <span
      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${cfg.color}`}
    >
      {cfg.icon}
      {status === "pending" && "À planifier"}
      {status === "active" && "En cours"}
      {status === "done" && "Terminé"}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${Math.min(value, 100)}%` }}
      ></div>
    </div>
  );
}
