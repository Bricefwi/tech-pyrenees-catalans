import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from "recharts";
import { Loader2, TrendingUp, Eye, MousePointer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#E11932", "#222", "#555", "#8884d8"];

interface AnalyticsSummary {
  id: string;
  title: string;
  total_interactions: number;
  clicks: number;
  views: number;
}

export default function AdminIAAnalytics() {
  const [data, setData] = useState<AnalyticsSummary[]>([]);
  const [ctrData, setCtrData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    avgCtr: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: result, error } = await supabase
          .from("ia_analytics_summary")
          .select("*");

        if (error) throw error;

        setData(result || []);

        const ctr = (result || []).map((r: AnalyticsSummary) => ({
          name: r.title.substring(0, 30) + "...",
          ctr: r.views > 0 ? Math.round((r.clicks / r.views) * 100) : 0,
        }));
        setCtrData(ctr);

        // Calculate totals
        const totalViews = result?.reduce((sum, r) => sum + r.views, 0) || 0;
        const totalClicks = result?.reduce((sum, r) => sum + r.clicks, 0) || 0;
        const avgCtr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

        setTotalStats({ totalViews, totalClicks, avgCtr });
      } catch (e) {
        console.error("Erreur chargement analytics :", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 IA Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Suivi des performances des contenus IA : vues, clics et taux de clics par thématique.
          </p>
        </div>
        <Link to="/admin">
          <Button variant="outline">Retour Admin</Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Vues</p>
                <p className="text-3xl font-bold">{totalStats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Clics</p>
                <p className="text-3xl font-bold">{totalStats.totalClicks}</p>
              </div>
              <MousePointer className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">CTR Moyen</p>
                <p className="text-3xl font-bold">{totalStats.avgCtr}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Interactions totales par sujet
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis 
                  dataKey="title" 
                  tick={false}
                  height={20}
                />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded p-2 shadow-lg">
                          <p className="font-semibold text-sm mb-1">{payload[0].payload.title}</p>
                          <p className="text-sm">Interactions: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="total_interactions" 
                  fill="#E11932" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Taux de clic (CTR %)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ctrData}>
                <XAxis 
                  dataKey="name" 
                  tick={false}
                  height={20}
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="ctr" 
                  fill="#222" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">
            Répartition des clics par sujet
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                dataKey="clicks"
                nameKey="title"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#E11932"
                label={(entry) => `${entry.clicks} clics`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucune donnée analytics disponible pour le moment.
        </div>
      )}
    </div>
  );
}
