import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Filter,
  LayoutDashboard,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import { NewTaskPanel } from "./components/NewTaskPanel";
import { TaskCard } from "./components/TaskCard";
import {
  columns,
  createInitialTasks,
  daysUntil,
  dueLabel,
  dueTone,
  formatDate,
  nextStatus,
  priorityMeta,
  statusLabel,
  todayIso,
  type NewTaskDraft,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "./dashboard/task-model";

type View = "painel" | "tarefas" | "agenda" | "relatorios";
type WidgetId = "newTask" | "board" | "agenda" | "reports";
type Accent = "cyan" | "violet" | "emerald" | "rose";
type Density = "compacta" | "confortavel";
type BackgroundPreset = "aurora" | "workspace" | "city" | "minimal";

const STORAGE_KEY = "dashboard-g-pro-tasks-v2";
const SETTINGS_KEY = "dashboard-g-pro-settings";

type DashboardSettings = {
  visibleWidgets: Record<WidgetId, boolean>;
  widgetOrder: WidgetId[];
  widgetAccents: Record<WidgetId, Accent>;
  accent: Accent;
  density: Density;
  background: BackgroundPreset;
};

const defaultSettings: DashboardSettings = {
  visibleWidgets: {
    newTask: true,
    board: true,
    agenda: true,
    reports: true,
  },
  widgetOrder: ["newTask", "board", "agenda", "reports"],
  widgetAccents: {
    newTask: "cyan",
    board: "violet",
    agenda: "emerald",
    reports: "rose",
  },
  accent: "cyan",
  density: "confortavel",
  background: "aurora",
};

function loadTasks() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createInitialTasks();
    const parsed = JSON.parse(stored) as Task[];
    return Array.isArray(parsed) ? parsed : createInitialTasks();
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return createInitialTasks();
  }
}

const widgetLabels: Record<WidgetId, string> = {
  newTask: "Nova tarefa",
  board: "Quadro Kanban",
  agenda: "Agenda",
  reports: "Relatorios",
};

function loadSettings(): DashboardSettings {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored) as Partial<DashboardSettings>;
    return {
      visibleWidgets: { ...defaultSettings.visibleWidgets, ...parsed.visibleWidgets },
      widgetAccents: { ...defaultSettings.widgetAccents, ...parsed.widgetAccents },
      widgetOrder: parsed.widgetOrder?.length
        ? parsed.widgetOrder.filter((id): id is WidgetId => id in widgetLabels)
        : defaultSettings.widgetOrder,
      accent: parsed.accent ?? defaultSettings.accent,
      density: parsed.density ?? defaultSettings.density,
      background: parsed.background ?? defaultSettings.background,
    };
  } catch {
    window.localStorage.removeItem(SETTINGS_KEY);
    return defaultSettings;
  }
}

const accentThemes: Record<Accent, { label: string; color: string; soft: string }> = {
  cyan: { label: "Ciano", color: "#67e8f9", soft: "rgba(103,232,249,0.14)" },
  violet: { label: "Violeta", color: "#a78bfa", soft: "rgba(167,139,250,0.14)" },
  emerald: { label: "Verde", color: "#6ee7b7", soft: "rgba(110,231,183,0.14)" },
  rose: { label: "Rosa", color: "#fda4af", soft: "rgba(253,164,175,0.14)" },
};

const backgroundPresets: Record<BackgroundPreset, { label: string; image: string }> = {
  aurora: {
    label: "Aurora",
    image:
      "radial-gradient(circle at 18% 12%, rgba(34,211,238,0.18), transparent 28%), radial-gradient(circle at 82% 4%, rgba(132,92,246,0.16), transparent 30%), linear-gradient(135deg, rgba(8,13,28,0.98), rgba(3,7,18,1))",
  },
  workspace: {
    label: "Workspace",
    image:
      "linear-gradient(rgba(3,7,18,0.82), rgba(3,7,18,0.94)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80')",
  },
  city: {
    label: "Cidade",
    image:
      "linear-gradient(rgba(3,7,18,0.78), rgba(3,7,18,0.94)), url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1800&q=80')",
  },
  minimal: {
    label: "Minimal",
    image:
      "linear-gradient(135deg, rgba(2,6,23,1), rgba(15,23,42,1) 48%, rgba(8,13,28,1))",
  },
};

const navItems: Array<{
  id: View;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "painel", label: "Painel", icon: LayoutDashboard },
  { id: "tarefas", label: "Tarefas", icon: CheckCircle2 },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "relatorios", label: "Relatorios", icon: BarChart3 },
];

function CustomizationPanel({
  settings,
  setSettings,
  toggleWidget,
  moveWidget,
  resetSettings,
}: {
  settings: DashboardSettings;
  setSettings: Dispatch<SetStateAction<DashboardSettings>>;
  toggleWidget: (id: WidgetId) => void;
  moveWidget: (id: WidgetId, direction: -1 | 1) => void;
  resetSettings: () => void;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-center gap-2 text-slate-200">
        <Settings2 size={16} />
        <h2 className="text-sm font-black">Personalizar</h2>
      </div>

      <div className="mt-4">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">
          Cor de destaque
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {(Object.keys(accentThemes) as Accent[]).map((key) => (
            <button
              key={key}
              type="button"
              title={accentThemes[key].label}
              onClick={() =>
                setSettings((current) => ({ ...current, accent: key }))
              }
              className={`h-9 rounded-xl border transition ${
                settings.accent === key
                  ? "border-white/70"
                  : "border-white/10 hover:border-white/30"
              }`}
              style={{ background: accentThemes[key].color }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">
          Imagem de fundo
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(Object.keys(backgroundPresets) as BackgroundPreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setSettings((current) => ({ ...current, background: key }))
              }
              className={`h-16 overflow-hidden rounded-2xl border p-2 text-left text-xs font-black transition ${
                settings.background === key
                  ? "border-white/70 text-white"
                  : "border-white/10 text-slate-400 hover:border-white/30"
              }`}
              style={{
                backgroundImage: backgroundPresets[key].image,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {backgroundPresets[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">
          Densidade
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["confortavel", "compacta"] as Density[]).map((density) => (
            <button
              key={density}
              type="button"
              onClick={() =>
                setSettings((current) => ({ ...current, density }))
              }
              className={`rounded-xl px-2 py-2 text-xs font-black capitalize transition ${
                settings.density === density
                  ? "bg-[var(--accent)] text-slate-950"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {density}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">
          Widgets do painel
        </p>
        <div className="mt-2 space-y-2">
          {settings.widgetOrder.map((id, index) => (
            <div
              key={id}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2"
            >
              <button
                type="button"
                onClick={() => toggleWidget(id)}
                className={`h-7 flex-1 rounded-xl px-2 text-left text-xs font-bold transition ${
                  settings.visibleWidgets[id]
                    ? "text-white"
                    : "text-slate-600 line-through"
                }`}
              >
                {widgetLabels[id]}
              </button>
              <select
                value={settings.widgetAccents[id]}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    widgetAccents: {
                      ...current.widgetAccents,
                      [id]: event.target.value as Accent,
                    },
                  }))
                }
                className="h-7 rounded-lg border border-white/10 bg-slate-950 px-1 text-[0.65rem] font-bold text-slate-300 outline-none"
                aria-label={`Cor do widget ${widgetLabels[id]}`}
              >
                {(Object.keys(accentThemes) as Accent[]).map((accent) => (
                  <option key={accent} value={accent}>
                    {accentThemes[accent].label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveWidget(id, -1)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-20"
                aria-label="Subir widget"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                disabled={index === settings.widgetOrder.length - 1}
                onClick={() => moveWidget(id, 1)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-20"
                aria-label="Descer widget"
              >
                <ArrowDown size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={resetSettings}
        className="mt-4 w-full rounded-2xl border border-white/10 px-3 py-2 text-xs font-black text-slate-400 transition hover:border-white/25 hover:text-white"
      >
        Restaurar layout
      </button>
    </section>
  );
}

function PersonalizedDashboard({
  settings,
  panelGap,
  newTask,
  setNewTask,
  addTask,
  filteredTasks,
  agendaTasks,
  tasks,
  stats,
  query,
  setQuery,
  priorityFilter,
  setPriorityFilter,
  updateStatus,
  deleteTask,
}: {
  settings: DashboardSettings;
  panelGap: string;
  newTask: {
    title: string;
    client: string;
    priority: TaskPriority;
    dueDate: string;
    estimate: number;
  };
  setNewTask: Dispatch<
    SetStateAction<{
      title: string;
      client: string;
      priority: TaskPriority;
      dueDate: string;
      estimate: number;
    }>
  >;
  addTask: () => void;
  filteredTasks: Task[];
  agendaTasks: Task[];
  tasks: Task[];
  stats: {
    total: number;
    done: number;
    doing: number;
    todo: number;
    overdue: number;
    highPriority: number;
    hours: number;
    progress: number;
  };
  query: string;
  setQuery: (value: string) => void;
  priorityFilter: "todas" | TaskPriority;
  setPriorityFilter: (value: "todas" | TaskPriority) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}) {
  const widgets: Record<WidgetId, ReactNode> = {
    newTask: (
      <NewTaskPanel
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
      />
    ),
    board: (
      <TasksBoard
        filteredTasks={filteredTasks}
        query={query}
        setQuery={setQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        updateStatus={updateStatus}
        deleteTask={deleteTask}
      />
    ),
    agenda: (
      <AgendaMiniWidget
        tasks={agendaTasks}
        updateStatus={updateStatus}
      />
    ),
    reports: <ReportsMiniWidget tasks={tasks} stats={stats} />,
  };

  const visibleOrder = settings.widgetOrder.filter(
    (id) => settings.visibleWidgets[id],
  );

  if (visibleOrder.length === 0) {
    return (
      <div className={`rounded-[28px] border border-dashed border-white/10 bg-white/[0.045] p-10 text-center text-slate-500 ${panelGap}`}>
        Nenhum widget ativo. Use o painel Personalizar para reativar widgets.
      </div>
    );
  }

  return (
    <div className={`grid min-w-0 xl:grid-cols-2 ${panelGap}`}>
      {visibleOrder.map((id) => (
        <div
          key={id}
          className={`min-w-0 ${id === "board" ? "xl:col-span-2" : ""}`}
          style={
            {
              "--accent": accentThemes[settings.widgetAccents[id]].color,
              "--accent-soft": accentThemes[settings.widgetAccents[id]].soft,
            } as CSSProperties
          }
        >
          {widgets[id]}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("painel");
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [settings, setSettings] = useState<DashboardSettings>(loadSettings);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"todas" | TaskPriority>(
    "todas",
  );
  const [newTask, setNewTask] = useState<NewTaskDraft>({
    title: "",
    client: "",
    priority: "media" as TaskPriority,
    dueDate: todayIso(),
    estimate: 2,
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesQuery =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.client.toLowerCase().includes(normalizedQuery);
      const matchesPriority =
        priorityFilter === "todas" || task.priority === priorityFilter;

      return matchesQuery && matchesPriority;
    });
  }, [tasks, query, priorityFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.status === "done").length;
    const doing = tasks.filter((task) => task.status === "doing").length;
    const todo = tasks.filter((task) => task.status === "todo").length;
    const overdue = tasks.filter(
      (task) => task.status !== "done" && daysUntil(task.dueDate) < 0,
    ).length;
    const highPriority = tasks.filter(
      (task) => task.priority === "alta" && task.status !== "done",
    ).length;
    const hours = tasks
      .filter((task) => task.status !== "done")
      .reduce((sum, task) => sum + task.estimate, 0);
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, doing, todo, overdue, highPriority, hours, progress };
  }, [tasks]);

  const agendaTasks = useMemo(
    () => [...filteredTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [filteredTasks],
  );

  function addTask() {
    if (!newTask.title.trim()) return;

    setTasks((current) => [
      {
        id: `task-${Date.now()}`,
        title: newTask.title.trim(),
        client: newTask.client.trim() || "Projeto interno",
        status: "todo",
        priority: newTask.priority,
        dueDate: newTask.dueDate || todayIso(),
        estimate: Number(newTask.estimate) || 1,
      },
      ...current,
    ]);

    setNewTask({
      title: "",
      client: "",
      priority: "media",
      dueDate: todayIso(),
      estimate: 2,
    });
    setActiveView("tarefas");
  }

  function updateStatus(id: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function toggleWidget(id: WidgetId) {
    setSettings((current) => ({
      ...current,
      visibleWidgets: {
        ...current.visibleWidgets,
        [id]: !current.visibleWidgets[id],
      },
    }));
  }

  function moveWidget(id: WidgetId, direction: -1 | 1) {
    setSettings((current) => {
      const order = [...current.widgetOrder];
      const index = order.indexOf(id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) {
        return current;
      }

      const [item] = order.splice(index, 1);
      order.splice(nextIndex, 0, item);

      return {
        ...current,
        widgetOrder: order,
      };
    });
  }

  function resetSettings() {
    setSettings(defaultSettings);
  }

  const activeTitle = navItems.find((item) => item.id === activeView)?.label;
  const accent = accentThemes[settings.accent];
  const panelGap = settings.density === "compacta" ? "mt-4 gap-4" : "mt-5 gap-5";
  const background = backgroundPresets[settings.background];

  return (
    <main
      className="min-h-screen bg-[#070a12] text-slate-100"
      style={
        {
          "--accent": accent.color,
          "--accent-soft": accent.soft,
        } as CSSProperties
      }
    >
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: background.image }}
        />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1480px] gap-5 px-4 py-4 lg:px-6">
        <aside className="hidden w-72 shrink-0 flex-col rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-slate-950 shadow-lg shadow-cyan-400/20">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <p className="text-sm font-black">Dashboard G-Pro</p>
              <p className="text-xs text-slate-400">Organizador de tarefas</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  activeView === id
                    ? "bg-[var(--accent)] text-slate-950"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          <CustomizationPanel
            settings={settings}
            setSettings={setSettings}
            toggleWidget={toggleWidget}
            moveWidget={moveWidget}
            resetSettings={resetSettings}
          />

          <div className="mt-5 rounded-3xl border border-white/10 bg-[var(--accent-soft)] p-4">
            <div className="flex items-center gap-2" style={{ color: accent.color }}>
              <Sparkles size={16} />
              <span className="text-xs font-black uppercase tracking-[0.18em]">
                Sprint ativo
              </span>
            </div>
            <p className="mt-3 text-3xl font-black">{stats.progress}%</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Entregas concluidas no ciclo atual. Continue movendo tarefas para
              concluido.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  {activeTitle}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Organize tarefas, prazos e prioridades.
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Um painel operacional para freelancers e pequenas equipes
                  acompanharem demandas, foco do dia e progresso de entrega.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
                {[
                  ["Total", stats.total],
                  ["Em progresso", stats.doing],
                  ["Concluidas", stats.done],
                  ["Horas abertas", stats.hours],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-3"
                  >
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 lg:hidden">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveView(id)}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition ${
                    activeView === id
                      ? "bg-[var(--accent)] text-slate-950"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </header>

          {activeView === "painel" && (
            <PersonalizedDashboard
              settings={settings}
              panelGap={panelGap}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              filteredTasks={filteredTasks}
              agendaTasks={agendaTasks}
              tasks={tasks}
              stats={stats}
              query={query}
              setQuery={setQuery}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              updateStatus={updateStatus}
              deleteTask={deleteTask}
            />
          )}

          {activeView === "tarefas" && (
            <div className={`grid xl:grid-cols-[380px_1fr] ${panelGap}`}>
              <NewTaskPanel
                newTask={newTask}
                setNewTask={setNewTask}
                addTask={addTask}
              />
              <TasksBoard
                filteredTasks={filteredTasks}
                query={query}
                setQuery={setQuery}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                updateStatus={updateStatus}
                deleteTask={deleteTask}
              />
            </div>
          )}

          {activeView === "agenda" && (
            <AgendaView
              tasks={agendaTasks}
              updateStatus={updateStatus}
              deleteTask={deleteTask}
            />
          )}

          {activeView === "relatorios" && <ReportsView tasks={tasks} stats={stats} />}
        </section>
      </div>
    </main>
  );
}

function BoardToolbar({
  query,
  setQuery,
  priorityFilter,
  setPriorityFilter,
}: {
  query: string;
  setQuery: (value: string) => void;
  priorityFilter: "todas" | TaskPriority;
  setPriorityFilter: (value: "todas" | TaskPriority) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <label className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar tarefa"
          className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 sm:w-56"
        />
      </label>

      <label className="relative">
        <Filter
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value as "todas" | TaskPriority)
          }
          className="h-11 w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/60 pl-10 pr-8 text-sm text-white outline-none transition focus:border-cyan-300/60 sm:w-44"
        >
          <option value="todas">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baixa">Baixa</option>
        </select>
      </label>
    </div>
  );
}

function TasksBoard({
  filteredTasks,
  query,
  setQuery,
  priorityFilter,
  setPriorityFilter,
  updateStatus,
  deleteTask,
}: {
  filteredTasks: Task[];
  query: string;
  setQuery: (value: string) => void;
  priorityFilter: "todas" | TaskPriority;
  setPriorityFilter: (value: "todas" | TaskPriority) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045]">
      <div className="h-1 bg-[var(--accent)]" />
      <div className="p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-black">Quadro de tarefas</h2>
          <p className="text-sm text-slate-400">
            Priorize, mova e acompanhe cada entrega.
          </p>
        </div>

        <BoardToolbar
          query={query}
          setQuery={setQuery}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <div
              key={column.status}
              className="min-h-[520px] rounded-3xl border border-white/10 bg-slate-950/35 p-3"
            >
              <div className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{column.title}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black text-slate-300">
                    {columnTasks.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {column.description}
                </p>
              </div>

              <div className="mt-2 space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    updateStatus={updateStatus}
                    deleteTask={deleteTask}
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-600">
                    Nenhuma tarefa aqui.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}

function AgendaMiniWidget({
  tasks,
  updateStatus,
}: {
  tasks: Task[];
  updateStatus: (id: string, status: TaskStatus) => void;
}) {
  const openTasks = tasks.filter((task) => task.status !== "done").slice(0, 5);

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045]">
      <div className="h-1 bg-[var(--accent)]" />
      <div className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black">Agenda</h2>
          <p className="text-sm text-slate-400">Proximos prazos abertos.</p>
        </div>
        <CalendarDays className="text-[var(--accent)]" size={20} />
      </div>

      <div className="mt-5 space-y-3">
        {openTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3"
          >
            <div className="min-w-0">
              <p className={`text-xs font-black ${dueTone(task)}`}>
                {dueLabel(task)} - {formatDate(task.dueDate)}
              </p>
              <h3 className="mt-1 truncate text-sm font-black">{task.title}</h3>
              <p className="mt-1 truncate text-xs text-slate-500">
                {task.client}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateStatus(task.id, nextStatus(task.status))}
              className="shrink-0 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-xs font-black text-slate-100"
            >
              Avancar
            </button>
          </div>
        ))}

        {openTasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-600">
            Sem entregas abertas.
          </div>
        )}
      </div>
      </div>
    </section>
  );
}

function ReportsMiniWidget({
  stats,
}: {
  tasks: Task[];
  stats: {
    total: number;
    done: number;
    doing: number;
    todo: number;
    overdue: number;
    highPriority: number;
    hours: number;
    progress: number;
  };
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045]">
      <div className="h-1 bg-[var(--accent)]" />
      <div className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black">Relatorios</h2>
          <p className="text-sm text-slate-400">Resumo do sprint atual.</p>
        </div>
        <BarChart3 className="text-[var(--accent)]" size={20} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          ["Progresso", `${stats.progress}%`],
          ["Atrasadas", stats.overdue],
          ["Alta prioridade", stats.highPriority],
          ["Horas abertas", `${stats.hours}h`],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <p className="text-2xl font-black">{value}</p>
            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${stats.progress}%` }}
        />
      </div>
      </div>
    </section>
  );
}

function AgendaView({
  tasks,
  updateStatus,
  deleteTask,
}: {
  tasks: Task[];
  updateStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
        <div>
          <h2 className="text-lg font-black">Agenda por prazo</h2>
          <p className="text-sm text-slate-400">
            Tarefas ordenadas pela data de entrega, com alerta de atraso.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {openTasks.map((task) => (
            <div
              key={task.id}
              className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/40 p-4 lg:grid-cols-[130px_1fr_180px]"
            >
              <div>
                <p className={`text-sm font-black ${dueTone(task)}`}>
                  {dueLabel(task)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(task.dueDate)}
                </p>
              </div>
              <div>
                <h3 className="font-black">{task.title}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {task.client} - {statusLabel[task.status]} - {task.estimate}h
                </p>
              </div>
              <div className="flex items-center gap-2 lg:justify-end">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] ${
                    priorityMeta[task.priority].className
                  }`}
                >
                  {priorityMeta[task.priority].label}
                </span>
                <button
                  type="button"
                  onClick={() => updateStatus(task.id, nextStatus(task.status))}
                  className="rounded-xl bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-200"
                >
                  Avancar
                </button>
              </div>
            </div>
          ))}

          {openTasks.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-500">
              Sem entregas abertas.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
        <h2 className="text-lg font-black">Historico recente</h2>
        <p className="text-sm text-slate-400">
          Ultimas tarefas marcadas como concluidas.
        </p>
        <div className="mt-5 space-y-3">
          {doneTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              updateStatus={updateStatus}
              deleteTask={deleteTask}
            />
          ))}
          {doneTasks.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-600">
              Nada concluido ainda.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ReportsView({
  tasks,
  stats,
}: {
  tasks: Task[];
  stats: {
    total: number;
    done: number;
    doing: number;
    todo: number;
    overdue: number;
    highPriority: number;
    hours: number;
    progress: number;
  };
}) {
  const statusRows = columns.map((column) => ({
    label: column.title,
    count: tasks.filter((task) => task.status === column.status).length,
  }));

  const priorityRows = (["alta", "media", "baixa"] as TaskPriority[]).map(
    (priority) => ({
      label: priorityMeta[priority].label,
      count: tasks.filter((task) => task.priority === priority).length,
      className: priorityMeta[priority].className,
    }),
  );

  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
        <h2 className="text-lg font-black">Relatorios do sprint</h2>
        <p className="text-sm text-slate-400">
          Leitura rapida do volume, risco e progresso das entregas.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Progresso", `${stats.progress}%`],
            ["Alta prioridade", stats.highPriority],
            ["Atrasadas", stats.overdue],
            ["Horas abertas", `${stats.hours}h`],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-3xl border border-white/10 bg-slate-950/40 p-5"
            >
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black">Conclusao geral</h3>
            <span className="text-sm font-black text-cyan-200">
              {stats.done}/{stats.total}
            </span>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-300"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ReportList title="Por status" rows={statusRows} total={stats.total} />
          <ReportList title="Por prioridade" rows={priorityRows} total={stats.total} />
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
        <h2 className="text-lg font-black">Resumo operacional</h2>
        <div className="mt-5 space-y-3 text-sm text-slate-400">
          <p>
            O sprint tem <strong className="text-white">{stats.todo}</strong>{" "}
            tarefas a fazer e{" "}
            <strong className="text-white">{stats.doing}</strong> em progresso.
          </p>
          <p>
            Existem{" "}
            <strong className="text-rose-200">{stats.overdue}</strong> tarefas
            atrasadas e{" "}
            <strong className="text-rose-200">{stats.highPriority}</strong> de
            alta prioridade ainda abertas.
          </p>
          <p>
            Use a Agenda para atacar primeiro os prazos mais curtos e o Kanban
            para manter o fluxo limpo.
          </p>
        </div>
      </div>
    </section>
  );
}

function ReportList({
  title,
  rows,
  total,
}: {
  title: string;
  rows: Array<{ label: string; count: number; className?: string }>;
  total: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
      <h3 className="font-black">{title}</h3>
      <div className="mt-4 space-y-4">
        {rows.map((row) => {
          const percent = total === 0 ? 0 : Math.round((row.count / total) * 100);
          return (
            <div key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{row.label}</span>
                <span className="font-black text-white">{row.count}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
