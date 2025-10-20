import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminEmailLogs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["emailLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Chargement des logs d&apos;e-mails...
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center mt-6">Erreur : {error.message}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Historique des e-mails envoyés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">Aucun e-mail envoyé pour le moment.</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Pièce jointe</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>{log.recipient}</TableCell>
                      <TableCell className="font-medium">{log.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.pdf_url ? (
                          <a
                            href={log.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center gap-1 hover:underline"
                          >
                            <FileText className="h-4 w-4" /> Voir PDF
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">Aucun</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.status === "sent" ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200">
                            ✅ Envoyé
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200">
                            ❌ Échec
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
