import React, { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import "@/styles/gantt.css";

/**
 * Composant Gantt
 * Affiche la planification des projets (jalons, tâches, délais)
 * Compatible avec Supabase ou toute source d'API contenant : id, name, start, end, progress
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
}

export default function ProjectGantt({ tasks, onClickTask }: ProjectGanttProps) {
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

  return (
    <div className="gantt-container">
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
