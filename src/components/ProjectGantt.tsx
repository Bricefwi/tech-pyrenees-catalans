import React, { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToPDF } from "@/lib/pdfExport";
import "../styles/gantt.css";

/**
 * Composant Gantt
 * Affiche la planification des projets (jalons, tâches, délais)
 * Compatible avec Supabase ou toute source d'API contenant : id, name, start, end, progress
 * Supporte aussi les données JSON du roadmap AI (format generate-audit-report)
 */
interface ProjectTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
}

interface ProjectGanttProps {
  tasks: ProjectTask[];
  onClickTask?: (task: ProjectTask) => void;
  showExportButton?: boolean;
  exportFilename?: string;
}

export default function ProjectGantt({ 
  tasks, 
  onClickTask, 
  showExportButton = false,
  exportFilename = "Planning_IMOTION"
}: ProjectGanttProps) {
  const ganttRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ganttRef.current || !tasks?.length) return;

    const gantt = new Gantt(ganttRef.current, tasks, {
      view_mode: "Week",
      language: "fr",
      bar_height: 22,
      padding: 28,
      custom_popup_html: (task: ProjectTask) => {
        return `
          <div class="p-2 text-left text-sm">
            <strong>${task.name}</strong><br/>
            <span>Début : ${task.start}</span><br/>
            <span>Fin : ${task.end}</span><br/>
            <span>Avancement : ${task.progress}%</span>
          </div>
        `;
      },
      on_click: (task: any) => {
        if (onClickTask) onClickTask(task);
      },
    });

    return () => {
      // Clean-up pour éviter les doublons lors d'un re-render
      if (ganttRef.current) ganttRef.current.innerHTML = "";
    };
  }, [tasks, onClickTask]);

  const handleExportPDF = async () => {
    if (ganttRef.current) {
      await exportToPDF(
        ganttRef.current.id || "gantt-export",
        exportFilename,
        "Planning Projet IMOTION",
        "IMOTION"
      );
    }
  };

  return (
    <div className="gantt-container" id="gantt-export">
      {showExportButton && tasks?.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter en PDF
          </Button>
        </div>
      )}
      {tasks?.length ? (
        <div ref={ganttRef} className="gantt w-full"></div>
      ) : (
        <p className="text-center text-gray-500 text-sm p-4">
          Aucun projet à afficher pour le moment.
        </p>
      )}
    </div>
  );
}
