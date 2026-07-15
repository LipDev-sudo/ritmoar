export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "alta" | "media" | "baixa";

export type Task = {
  id: string;
  title: string;
  client: string;
  owner: string;
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
  { status: "done", title: "Concluído", description: "Entregas finalizadas" },
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
    label: "Média",
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
  done: "Concluído",
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
      title: "Aprovar roteiro da campanha de lançamento",
      client: "Casa Mimo",
      owner: "Marina Costa",
      status: "doing",
      priority: "alta",
      dueDate: offsetIso(1),
      estimate: 3,
    },
    {
      id: "task-2",
      title: "Ajustar página de captação",
      client: "Casa Mimo",
      owner: "Caio Mendes",
      status: "todo",
      priority: "alta",
      dueDate: offsetIso(2),
      estimate: 4,
    },
    {
      id: "task-3",
      title: "Preparar variações para redes sociais",
      client: "Feira da Vila",
      owner: "Luiza Ramos",
      status: "todo",
      priority: "media",
      dueDate: offsetIso(3),
      estimate: 3,
    },
    {
      id: "task-4",
      title: "Revisar orçamento de produção",
      client: "Feira da Vila",
      owner: "Marina Costa",
      status: "doing",
      priority: "alta",
      dueDate: offsetIso(0),
      estimate: 2,
    },
    {
      id: "task-5",
      title: "Consolidar aprendizados da retrospectiva",
      client: "Operação interna",
      owner: "Caio Mendes",
      status: "todo",
      priority: "baixa",
      dueDate: offsetIso(5),
      estimate: 1,
    },
    {
      id: "task-6",
      title: "Entregar guia visual ao cliente",
      client: "Casa Mimo",
      owner: "Luiza Ramos",
      status: "done",
      priority: "media",
      dueDate: offsetIso(-1),
      estimate: 5,
    },
  ];
}

function isStoredTask(value: unknown): value is Omit<Task, "owner"> & {
  owner?: unknown;
} {
  if (!value || typeof value !== "object") return false;

  const task = value as Partial<Task>;
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.client === "string" &&
    (task.status === "todo" || task.status === "doing" || task.status === "done") &&
    (task.priority === "alta" || task.priority === "media" || task.priority === "baixa") &&
    typeof task.dueDate === "string" &&
    typeof task.estimate === "number"
  );
}

export function normalizeTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return createInitialTasks();

  return value.filter(isStoredTask).map((task) => ({
    ...task,
    owner:
      typeof task.owner === "string" && task.owner.trim()
        ? task.owner.trim()
        : "Equipe Ritmoar",
  }));
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
  if (days === 1) return "Vence amanhã";
  return `Faltam ${days}d`;
}
