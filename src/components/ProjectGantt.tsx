import { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import "frappe-gantt/dist/frappe-gantt.css";

type Task = {
  id: string;
  name: string;
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
  progress?: number;
  custom_class?: string;
};

export default function ProjectGantt({ tasks }: { tasks: Task[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || tasks.length === 0) return;
    
    // nettoie le container
    ref.current.innerHTML = '<svg></svg>';
    
    // init gantt
    new Gantt(ref.current.querySelector("svg")!, tasks, {
      view_mode: "Week", // Day | Week | Month
      language: "fr",
      custom_popup_html: (task: any) => `
        <div class="p-2">
          <div class="font-semibold">${task.name}</div>
          <div class="text-xs text-gray-600">${task.start} → ${task.end}</div>
          <div class="text-xs">Progression: ${task.progress || 0}%</div>
        </div>`
    });
  }, [tasks]);

  if (tasks.length === 0) {
    return <div className="text-muted-foreground p-4">Aucun jalon à afficher</div>;
  }

  return (
    <div id="gantt-container" className="overflow-auto border rounded bg-background" ref={ref} />
  );
}
