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
  UsersRound,
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
  normalizeTasks,
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

const STORAGE_KEY = "ritmoar-tasks-v1";
const SETTINGS_KEY = "ritmoar-settings-v1";
const LEGACY_TASKS_KEY = ["dashboard", "g", "pro", "tasks", "v2"].join("-");
const LEGACY_SETTINGS_KEY = ["dashboard", "g", "pro", "settings"].join("-");

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
  widgetOrder: ["board", "newTask", "agenda", "reports"],
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

const widgetLabels: Record<WidgetId, string> = {
  newTask: "Nova tarefa",
  board: "Fluxo de trabalho",
  agenda: "Agenda",
  reports: "Relatórios",
};

const accentThemes: Record<
  Accent,
  { label: string; color: string; soft: string; contrast: string }
> = {
  cyan: {
    label: "Verde operacional",
    color: "#2f6b4f",
    soft: "#e5efe8",
    contrast: "#ffffff",
  },
  violet: {
    label: "Âmbar",
    color: "#a6631a",
    soft: "#fbefdd",
    contrast: "#ffffff",
  },
  emerald: {
    label: "Sálvia",
    color: "#5d7764",
    soft: "#e8eee9",
    contrast: "#ffffff",
  },
  rose: {
    label: "Terracota",
    color: "#b04f39",
    soft: "#f8e8e3",
    contrast: "#ffffff",
  },
};

const backgroundPresets: Record<
  BackgroundPreset,
  { label: string; color: string }
> = {
  aurora: { label: "Papel", color: "#f4f1e8" },
  workspace: { label: "Névoa", color: "#e9efec" },
  city: { label: "Concreto", color: "#e7e8e5" },
  minimal: { label: "Neutro", color: "#f2f3f1" },
};

const navItems: Array<{
  id: View;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "painel", label: "Painel", icon: LayoutDashboard },
  { id: "tarefas", label: "Tarefas", icon: CheckCircle2 },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
];

const surfaceClass =
  "rounded-[22px] border border-[#dce2dd] bg-white shadow-[0_12px_30px_rgba(29,37,33,0.06)]";
const insetClass = "rounded-2xl border border-[#e1e6e2] bg-[#f7f8f6]";
const focusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6b4f]";

function loadTasks() {
  try {
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_TASKS_KEY);
    if (!stored) return createInitialTasks();
    return normalizeTasks(JSON.parse(stored));
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return createInitialTasks();
  }
}

function loadSettings(): DashboardSettings {
  try {
    const stored =
      window.localStorage.getItem(SETTINGS_KEY) ??
      window.localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored) as Partial<DashboardSettings>;
    return {
      visibleWidgets: {
        ...defaultSettings.visibleWidgets,
        ...parsed.visibleWidgets,
      },
      widgetAccents: {
        ...defaultSettings.widgetAccents,
        ...parsed.widgetAccents,
      },
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

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 content-center rounded-xl bg-[#1d2521] px-2 ${
        compact ? "h-10 w-10" : "h-11 w-11"
      }`}
    >
      <span className="block h-1.5 w-5 rounded-full bg-[#f4f1e8]" />
      <span className="mt-1 block h-1.5 w-7 rounded-full bg-[#7fba91]" />
      <span className="mt-1 block h-1.5 w-4 rounded-full bg-[#f4f1e8]" />
    </span>
  );
}

function Navigation({
  activeView,
  setActiveView,
  mobile = false,
}: {
  activeView: View;
  setActiveView: (view: View) => void;
  mobile?: boolean;
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className={mobile ? "grid grid-cols-4 gap-1" : "space-y-1.5"}
    >
      {navItems.map(({ id, label, icon: Icon }) => {
        const active = activeView === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => setActiveView(id)}
            className={`min-h-11 rounded-xl text-sm font-semibold transition ${focusClass} ${
              mobile
                ? "flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-[0.68rem]"
                : "flex w-full items-center gap-3 px-3 py-2.5 text-left"
            } ${
              active
                ? "bg-[#e5efe8] text-[#24563e]"
                : "text-[#68736d] hover:bg-[#f2f5f2] hover:text-[#1d2521]"
            }`}
          >
            <Icon size={mobile ? 16 : 18} strokeWidth={1.8} />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

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
    <details className="mt-5 border-t border-[#e4e8e5] pt-4">
      <summary
        className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-2 text-sm font-semibold text-[#52605a] hover:bg-[#f4f6f4] ${focusClass}`}
      >
        <Settings2 size={16} />
        Personalizar painel
      </summary>

      <div className="mt-3 space-y-4 rounded-2xl bg-[#f7f8f6] p-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#77817c]">
            Cor de destaque
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {(Object.keys(accentThemes) as Accent[]).map((key) => (
              <button
                key={key}
                type="button"
                title={accentThemes[key].label}
                aria-label={`Usar ${accentThemes[key].label}`}
                aria-pressed={settings.accent === key}
                onClick={() =>
                  setSettings((current) => ({ ...current, accent: key }))
                }
                className={`h-10 rounded-xl border-2 transition ${focusClass} ${
                  settings.accent === key
                    ? "border-[#1d2521]"
                    : "border-transparent hover:border-[#aeb8b1]"
                }`}
                style={{ backgroundColor: accentThemes[key].color }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#77817c]">
            Base do painel
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(backgroundPresets) as BackgroundPreset[]).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={settings.background === key}
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      background: key,
                    }))
                  }
                  className={`min-h-11 rounded-xl border px-3 text-left text-xs font-semibold transition ${focusClass} ${
                    settings.background === key
                      ? "border-[#2f6b4f] text-[#24563e]"
                      : "border-[#dce2dd] text-[#68736d]"
                  }`}
                  style={{ backgroundColor: backgroundPresets[key].color }}
                >
                  {backgroundPresets[key].label}
                </button>
              ),
            )}
          </div>
        </div>

        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#77817c]">
            Densidade
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["confortavel", "compacta"] as Density[]).map((density) => (
              <button
                key={density}
                type="button"
                aria-pressed={settings.density === density}
                onClick={() =>
                  setSettings((current) => ({ ...current, density }))
                }
                className={`min-h-11 rounded-xl px-2 text-xs font-semibold capitalize ${focusClass} ${
                  settings.density === density
                    ? "bg-[#2f6b4f] text-white"
                    : "border border-[#dce2dd] bg-white text-[#68736d]"
                }`}
              >
                {density}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#77817c]">
            Blocos do painel
          </p>
          <div className="mt-2 space-y-2">
            {settings.widgetOrder.map((id, index) => (
              <div
                key={id}
                className="flex items-center gap-1 rounded-xl border border-[#dce2dd] bg-white p-1.5"
              >
                <button
                  type="button"
                  aria-pressed={settings.visibleWidgets[id]}
                  onClick={() => toggleWidget(id)}
                  className={`min-h-9 min-w-0 flex-1 rounded-lg px-2 text-left text-xs font-semibold ${focusClass} ${
                    settings.visibleWidgets[id]
                      ? "text-[#1d2521]"
                      : "text-[#8a948e] line-through"
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
                  className={`h-9 w-16 rounded-lg border border-[#dce2dd] bg-white px-1 text-[0.65rem] text-[#52605a] ${focusClass}`}
                  aria-label={`Cor do bloco ${widgetLabels[id]}`}
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
                  className={`grid h-9 w-9 place-items-center rounded-lg text-[#68736d] hover:bg-[#eef2ef] disabled:opacity-25 ${focusClass}`}
                  aria-label={`Subir ${widgetLabels[id]}`}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === settings.widgetOrder.length - 1}
                  onClick={() => moveWidget(id, 1)}
                  className={`grid h-9 w-9 place-items-center rounded-lg text-[#68736d] hover:bg-[#eef2ef] disabled:opacity-25 ${focusClass}`}
                  aria-label={`Descer ${widgetLabels[id]}`}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={resetSettings}
          className={`min-h-11 w-full rounded-xl border border-[#ccd4ce] bg-white px-3 text-xs font-semibold text-[#52605a] hover:border-[#8f9c93] ${focusClass}`}
        >
          Restaurar preferências
        </button>
      </div>
    </details>
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
        <span className="sr-only">Buscar por tarefa, projeto ou responsável</span>
        <Search
          aria-hidden="true"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77817c]"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar no trabalho"
          className={`h-11 w-full rounded-xl border border-[#d7ded8] bg-white pl-10 pr-4 text-sm text-[#1d2521] outline-none placeholder:text-[#8a948e] sm:w-64 ${focusClass}`}
        />
      </label>

      <label className="relative">
        <span className="sr-only">Filtrar por prioridade</span>
        <Filter
          aria-hidden="true"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77817c]"
        />
        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value as "todas" | TaskPriority)
          }
          className={`h-11 w-full appearance-none rounded-xl border border-[#d7ded8] bg-white pl-10 pr-8 text-sm text-[#1d2521] outline-none sm:w-44 ${focusClass}`}
        >
          <option value="todas">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
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
  const filtered = Boolean(query.trim()) || priorityFilter !== "todas";

  return (
    <section className={`${surfaceClass} min-w-0 overflow-hidden`}>
      <div className="h-1 bg-[var(--accent)]" />
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#728079]">
              Visão da equipe
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#1d2521]">
              Fluxo de trabalho
            </h2>
            <p className="mt-1 text-sm text-[#68736d]">
              Leia prioridade, responsável e prazo antes de mover cada entrega.
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
            const statusColor =
              column.status === "todo"
                ? "#a6631a"
                : column.status === "doing"
                  ? "#2f6b4f"
                  : "#5d7764";

            return (
              <div
                key={column.status}
                className="min-h-[360px] rounded-2xl border border-[#e0e5e1] bg-[#f7f8f6] p-3"
              >
                <div className="border-b border-[#e1e6e2] px-1 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      <h3 className="font-bold text-[#1d2521]">{column.title}</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#52605a] shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>
                  <p className="mt-1 pl-[18px] text-xs text-[#77817c]">
                    {column.description}
                  </p>
                </div>

                <div className="mt-3 space-y-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      updateStatus={updateStatus}
                      deleteTask={deleteTask}
                    />
                  ))}
                  {columnTasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#ccd4ce] bg-white/70 p-5 text-center text-sm text-[#77817c]">
                      {filtered
                        ? "Nenhum resultado com estes filtros."
                        : "Nenhuma tarefa nesta etapa."}
                    </div>
                  ) : null}
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
    <section className={`${surfaceClass} overflow-hidden`}>
      <div className="h-1 bg-[var(--accent)]" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1d2521]">Próximos prazos</h2>
            <p className="mt-1 text-sm text-[#68736d]">
              Entregas abertas em ordem de vencimento.
            </p>
          </div>
          <CalendarDays className="text-[var(--accent)]" size={20} />
        </div>

        <div className="mt-4 divide-y divide-[#e4e8e5]">
          {openTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className={`text-xs font-bold ${dueTone(task)}`}>
                  {dueLabel(task)} · {formatDate(task.dueDate)}
                </p>
                <h3 className="mt-1 truncate text-sm font-bold text-[#1d2521]">
                  {task.title}
                </h3>
                <p className="mt-1 truncate text-xs text-[#77817c]">
                  {task.client} · {task.owner}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateStatus(task.id, nextStatus(task.status))}
                className={`min-h-10 shrink-0 rounded-xl bg-[var(--accent-soft)] px-3 text-xs font-bold text-[var(--accent)] hover:brightness-95 ${focusClass}`}
                aria-label={`Avançar tarefa: ${task.title}`}
              >
                Avançar
              </button>
            </div>
          ))}
          {openTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ccd4ce] p-6 text-center text-sm text-[#68736d]">
              Tudo em dia. Não há entregas abertas.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ReportsMiniWidget({ stats }: { stats: Stats }) {
  return (
    <section className={`${surfaceClass} overflow-hidden`}>
      <div className="h-1 bg-[var(--accent)]" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1d2521]">Leitura operacional</h2>
            <p className="mt-1 text-sm text-[#68736d]">
              Volume, risco e andamento da semana.
            </p>
          </div>
          <BarChart3 className="text-[var(--accent)]" size={20} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            ["Progresso", `${stats.progress}%`, "text-[#2f6b4f]"],
            ["Atrasadas", stats.overdue, "text-[#b04f39]"],
            ["Alta prioridade", stats.highPriority, "text-[#a6631a]"],
            ["Horas abertas", `${stats.hours}h`, "text-[#1d2521]"],
          ].map(([label, value, tone]) => (
            <div key={String(label)} className={`${insetClass} p-4`}>
              <p className={`text-2xl font-bold ${tone}`}>{value}</p>
              <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#77817c]">
                {label}
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5e9e6]"
          aria-label={`${stats.progress}% das tarefas concluídas`}
        >
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

type Stats = {
  total: number;
  done: number;
  doing: number;
  todo: number;
  overdue: number;
  highPriority: number;
  hours: number;
  progress: number;
};

function PersonalizedDashboard({
  settings,
  panelGap,
  newTask,
  setNewTask,
  addTask,
  filteredTasks,
  agendaTasks,
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
  newTask: NewTaskDraft;
  setNewTask: Dispatch<SetStateAction<NewTaskDraft>>;
  addTask: () => void;
  filteredTasks: Task[];
  agendaTasks: Task[];
  stats: Stats;
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
    agenda: <AgendaMiniWidget tasks={agendaTasks} updateStatus={updateStatus} />,
    reports: <ReportsMiniWidget stats={stats} />,
  };
  const visibleOrder = settings.widgetOrder.filter(
    (id) => settings.visibleWidgets[id],
  );

  if (visibleOrder.length === 0) {
    return (
      <div className={`${surfaceClass} ${panelGap} p-10 text-center`}>
        <h2 className="font-bold text-[#1d2521]">Painel sem blocos ativos</h2>
        <p className="mt-2 text-sm text-[#68736d]">
          Abra “Personalizar painel” para reativar o conteúdo que deseja acompanhar.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid min-w-0 xl:grid-cols-2 ${panelGap}`}>
      {visibleOrder.map((id) => {
        const theme = accentThemes[settings.widgetAccents[id]];
        return (
          <div
            key={id}
            className={`min-w-0 ${id === "board" ? "xl:col-span-2" : ""}`}
            style={
              {
                "--accent": theme.color,
                "--accent-soft": theme.soft,
              } as CSSProperties
            }
          >
            {widgets[id]}
          </div>
        );
      })}
    </div>
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
      <div className={`${surfaceClass} p-5`}>
        <h2 className="text-xl font-bold text-[#1d2521]">Agenda por prazo</h2>
        <p className="mt-1 text-sm text-[#68736d]">
          O que vence primeiro aparece no topo, com responsável e risco visíveis.
        </p>
        <div className="mt-5 space-y-3">
          {openTasks.map((task) => (
            <div
              key={task.id}
              className={`${insetClass} grid gap-3 p-4 lg:grid-cols-[130px_1fr_auto] lg:items-center`}
            >
              <div>
                <p className={`text-sm font-bold ${dueTone(task)}`}>
                  {dueLabel(task)}
                </p>
                <p className="mt-1 text-xs text-[#77817c]">
                  {formatDate(task.dueDate)}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#1d2521]">{task.title}</h3>
                <p className="mt-1 text-sm text-[#68736d]">
                  {task.client} · {task.owner} · {statusLabel[task.status]} ·{" "}
                  {task.estimate}h
                </p>
              </div>
              <div className="flex items-center gap-2 lg:justify-end">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] ${priorityMeta[task.priority].className}`}
                >
                  {priorityMeta[task.priority].label}
                </span>
                <button
                  type="button"
                  onClick={() => updateStatus(task.id, nextStatus(task.status))}
                  className={`min-h-10 rounded-xl bg-[#e5efe8] px-3 text-xs font-bold text-[#24563e] ${focusClass}`}
                  aria-label={`Avançar tarefa: ${task.title}`}
                >
                  Avançar
                </button>
              </div>
            </div>
          ))}
          {openTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ccd4ce] p-8 text-center text-[#68736d]">
              Tudo em dia. Não há entregas abertas.
            </div>
          ) : null}
        </div>
      </div>

      <div className={`${surfaceClass} p-5`}>
        <h2 className="text-lg font-bold text-[#1d2521]">Histórico recente</h2>
        <p className="mt-1 text-sm text-[#68736d]">Últimas entregas concluídas.</p>
        <div className="mt-5 space-y-3">
          {doneTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              updateStatus={updateStatus}
              deleteTask={deleteTask}
            />
          ))}
          {doneTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ccd4ce] p-6 text-center text-sm text-[#68736d]">
              Nenhuma entrega concluída ainda.
            </div>
          ) : null}
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
  rows: Array<{ label: string; count: number }>;
  total: number;
}) {
  return (
    <div className={`${insetClass} p-5`}>
      <h3 className="font-bold text-[#1d2521]">{title}</h3>
      <div className="mt-4 space-y-4">
        {rows.map((row) => {
          const percent = total === 0 ? 0 : Math.round((row.count / total) * 100);
          return (
            <div key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#52605a]">{row.label}</span>
                <span className="font-bold text-[#1d2521]">{row.count}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e2e7e3]">
                <div
                  className="h-full rounded-full bg-[#2f6b4f]"
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

function ReportsView({ tasks, stats }: { tasks: Task[]; stats: Stats }) {
  const statusRows = columns.map((column) => ({
    label: column.title,
    count: tasks.filter((task) => task.status === column.status).length,
  }));
  const priorityRows = (["alta", "media", "baixa"] as TaskPriority[]).map(
    (priority) => ({
      label: priorityMeta[priority].label,
      count: tasks.filter((task) => task.priority === priority).length,
    }),
  );

  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className={`${surfaceClass} p-5`}>
        <h2 className="text-xl font-bold text-[#1d2521]">Relatório da semana</h2>
        <p className="mt-1 text-sm text-[#68736d]">
          Leitura rápida do volume, risco e andamento das entregas.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Progresso", `${stats.progress}%`, "text-[#2f6b4f]"],
            ["Alta prioridade", stats.highPriority, "text-[#a6631a]"],
            ["Atrasadas", stats.overdue, "text-[#b04f39]"],
            ["Horas abertas", `${stats.hours}h`, "text-[#1d2521]"],
          ].map(([label, value, tone]) => (
            <div key={String(label)} className={`${insetClass} p-4`}>
              <p className={`text-3xl font-bold ${tone}`}>{value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#77817c]">
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ReportList title="Por status" rows={statusRows} total={stats.total} />
          <ReportList
            title="Por prioridade"
            rows={priorityRows}
            total={stats.total}
          />
        </div>
      </div>

      <aside className={`${surfaceClass} p-5`}>
        <h2 className="text-lg font-bold text-[#1d2521]">Resumo operacional</h2>
        <div className="mt-4 space-y-3 text-sm leading-6 text-[#52605a]">
          <p>
            A equipe tem <strong className="text-[#1d2521]">{stats.todo}</strong>{" "}
            tarefas a fazer e{" "}
            <strong className="text-[#1d2521]">{stats.doing}</strong> em progresso.
          </p>
          <p>
            <strong className="text-[#b04f39]">{stats.overdue}</strong> tarefas
            estão atrasadas e{" "}
            <strong className="text-[#a6631a]">{stats.highPriority}</strong> de
            alta prioridade seguem abertas.
          </p>
          <p>
            Revise primeiro os prazos mais próximos e confirme os responsáveis
            antes de iniciar novas frentes.
          </p>
        </div>
      </aside>
    </section>
  );
}

function Header({
  activeTitle,
  activeView,
  setActiveView,
  stats,
}: {
  activeTitle: string;
  activeView: View;
  setActiveView: (view: View) => void;
  stats: Stats;
}) {
  const metrics = [
    ["Em progresso", stats.doing, "text-[#2f6b4f]"],
    ["Alta prioridade", stats.highPriority, "text-[#a6631a]"],
    ["Atrasadas", stats.overdue, "text-[#b04f39]"],
    ["Horas abertas", `${stats.hours}h`, "text-[#1d2521]"],
  ];

  return (
    <header className={`${surfaceClass} p-4 sm:p-6`}>
      <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark compact />
          <div className="min-w-0">
            <p className="font-bold text-[#1d2521]">Ritmoar</p>
            <p className="truncate text-xs text-[#68736d]">Estúdio Norte</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[#d7ded8] bg-[#f7f8f6] px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[#68736d]">
          Demonstração de produto
        </span>
      </div>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f6b4f]">
            {activeTitle} · Estúdio Norte
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.025em] text-[#17201c] sm:text-4xl">
            Ritmo claro. Trabalho em movimento.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#5d6963] sm:text-base">
            Prioridades, responsáveis e prazos em uma visão direta para pequenas
            equipes que precisam entregar sem excesso de processo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:w-[520px]">
          {metrics.map(([label, value, tone]) => (
            <div key={String(label)} className={`${insetClass} p-3`}>
              <p className={`text-2xl font-bold ${tone}`}>{value}</p>
              <p className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[#77817c]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-[#e4e8e5] pt-3 lg:hidden">
        <Navigation
          activeView={activeView}
          setActiveView={setActiveView}
          mobile
        />
      </div>
    </header>
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
    owner: "Marina Costa",
    priority: "media",
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
        task.client.toLowerCase().includes(normalizedQuery) ||
        task.owner.toLowerCase().includes(normalizedQuery);
      const matchesPriority =
        priorityFilter === "todas" || task.priority === priorityFilter;
      return matchesQuery && matchesPriority;
    });
  }, [tasks, query, priorityFilter]);

  const stats = useMemo<Stats>(() => {
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
        owner: newTask.owner.trim() || "Equipe Ritmoar",
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
      owner: "Marina Costa",
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
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return current;
      const [item] = order.splice(index, 1);
      order.splice(nextIndex, 0, item);
      return { ...current, widgetOrder: order };
    });
  }

  function resetSettings() {
    setSettings(defaultSettings);
  }

  const activeTitle =
    navItems.find((item) => item.id === activeView)?.label ?? "Painel";
  const accent = accentThemes[settings.accent];
  const panelGap = settings.density === "compacta" ? "mt-4 gap-4" : "mt-5 gap-5";
  const background = backgroundPresets[settings.background];

  return (
    <main
      className="ritmoar-shell min-h-screen bg-[#f4f1e8] text-[#1d2521]"
      style={
        {
          backgroundColor: background.color,
          "--accent": accent.color,
          "--accent-soft": accent.soft,
          "--accent-contrast": accent.contrast,
        } as CSSProperties
      }
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-3 py-3 sm:px-5 sm:py-5">
        <aside className={`${surfaceClass} hidden w-64 shrink-0 flex-col p-4 lg:flex`}>
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="font-bold tracking-[-0.01em] text-[#1d2521]">Ritmoar</p>
              <p className="text-xs text-[#68736d]">Estúdio Norte</p>
            </div>
          </div>
          <span className="mt-4 w-fit rounded-full border border-[#d7ded8] bg-[#f7f8f6] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[#68736d]">
            Demonstração de produto
          </span>

          <div className="mt-7">
            <Navigation activeView={activeView} setActiveView={setActiveView} />
          </div>

          <CustomizationPanel
            settings={settings}
            setSettings={setSettings}
            toggleWidget={toggleWidget}
            moveWidget={moveWidget}
            resetSettings={resetSettings}
          />

          <div className="mt-auto rounded-2xl border border-[#d7e4da] bg-[#eef5f0] p-4">
            <div className="flex items-center gap-2 text-[#2f6b4f]">
              <UsersRound size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.1em]">
                Trabalho da equipe
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-bold text-[#1d2521]">{stats.progress}%</p>
              <p className="pb-1 text-xs font-semibold text-[#68736d]">
                {stats.done}/{stats.total} concluídas
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d8e5dc]">
              <div
                className="h-full rounded-full bg-[#2f6b4f]"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <Header
            activeTitle={activeTitle}
            activeView={activeView}
            setActiveView={setActiveView}
            stats={stats}
          />

          {activeView === "painel" ? (
            <PersonalizedDashboard
              settings={settings}
              panelGap={panelGap}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              filteredTasks={filteredTasks}
              agendaTasks={agendaTasks}
              stats={stats}
              query={query}
              setQuery={setQuery}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              updateStatus={updateStatus}
              deleteTask={deleteTask}
            />
          ) : null}

          {activeView === "tarefas" ? (
            <div className={`grid xl:grid-cols-[360px_1fr] ${panelGap}`}>
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
          ) : null}

          {activeView === "agenda" ? (
            <AgendaView
              tasks={agendaTasks}
              updateStatus={updateStatus}
              deleteTask={deleteTask}
            />
          ) : null}

          {activeView === "relatorios" ? (
            <ReportsView tasks={tasks} stats={stats} />
          ) : null}

          <footer className="px-2 py-6 text-center text-xs text-[#77817c]">
            Ritmoar é uma demonstração fictícia de produto. Os dados exibidos
            existem apenas neste navegador.
          </footer>
        </section>
      </div>
    </main>
  );
}
