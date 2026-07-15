export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "alta" | "media" | "baixa";

export type Task = {
  id: string;
  title: string;
  client: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimate: number;
};

export type NewTaskDraft = Omit<Task, "id" | "status">;

export const columns: Array<{
  status: TaskStatus;
  title: string;
  description: string;
}> = [
  { status: "todo", title: "A Fazer", description: "Demandas capturadas e priorizadas" },
  { status: "doing", title: "Em Progresso", description: "Trabalho ativo do dia" },
  { status: "done", title: "Concluido", description: "Entregas finalizadas" },
];

export const priorityMeta: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  alta: {
    label: "Alta",
    className: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  },
  media: {
    label: "Media",
    className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  },
  baixa: {
    label: "Baixa",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
};

export const statusLabel: Record<TaskStatus, string> = {
  todo: "A Fazer",
  doing: "Em Progresso",
  done: "Concluido",
};

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function offsetIso(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createInitialTasks(): Task[] {
  return [
    {
      id: "task-1",
      title: "Revisar apresentacao dos projetos",
      client: "Portfolio LipDev",
      status: "doing",
      priority: "alta",
      dueDate: offsetIso(1),
      estimate: 3,
    },
    {
      id: "task-2",
      title: "Validar estados vazios do agendamento",
      client: "Bookly",
      status: "todo",
      priority: "alta",
      dueDate: offsetIso(2),
      estimate: 2,
    },
    {
      id: "task-3",
      title: "Revisar responsividade dos graficos",
      client: "Dashboard G-Pro",
      status: "todo",
      priority: "media",
      dueDate: offsetIso(4),
      estimate: 2,
    },
    {
      id: "task-4",
      title: "Documentar fluxo de demonstracao",
      client: "Plataforma de pedidos",
      status: "done",
      priority: "baixa",
      dueDate: offsetIso(-1),
      estimate: 1,
    },
  ];
}

export function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "Sem prazo";
  return `${day}/${month}`;
}

export function nextStatus(status: TaskStatus): TaskStatus {
  if (status === "todo") return "doing";
  if (status === "doing") return "done";
  return "done";
}

export function previousStatus(status: TaskStatus): TaskStatus {
  if (status === "done") return "doing";
  if (status === "doing") return "todo";
  return "todo";
}

export function daysUntil(value: string) {
  const today = new Date(`${todayIso()}T00:00:00`).getTime();
  const date = new Date(`${value}T00:00:00`).getTime();
  return Math.round((date - today) / 86_400_000);
}

export function dueTone(task: Task) {
  if (task.status === "done") return "text-emerald-300";
  const days = daysUntil(task.dueDate);
  if (days < 0) return "text-rose-300";
  if (days <= 1) return "text-amber-200";
  return "text-slate-400";
}

export function dueLabel(task: Task) {
  if (task.status === "done") return "Finalizada";
  const days = daysUntil(task.dueDate);
  if (days < 0) return `${Math.abs(days)}d atrasada`;
  if (days === 0) return "Vence hoje";
  if (days === 1) return "Vence amanha";
  return `Faltam ${days}d`;
}
