import { Clock3, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import {
  priorityMeta,
  type NewTaskDraft,
  type TaskPriority,
} from "../dashboard/task-model";

type NewTaskPanelProps = {
  newTask: NewTaskDraft;
  setNewTask: Dispatch<SetStateAction<NewTaskDraft>>;
  addTask: () => void;
};

export function NewTaskPanel({ newTask, setNewTask, addTask }: NewTaskPanelProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045]">
      <div className="h-1 bg-[var(--accent)]" />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Nova tarefa</h2>
            <p className="text-sm text-slate-400">Registre contexto, responsável e prazo.</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
            <Plus size={20} />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tarefa</span>
            <input
              value={newTask.title}
              onChange={(event) => setNewTask((task) => ({ ...task, title: event.target.value }))}
              onKeyDown={(event) => event.key === "Enter" && addTask()}
              placeholder="Ex: Aprovar roteiro da campanha"
              className="h-12 min-w-0 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus-visible:ring-2 focus-visible:ring-cyan-200/50"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Cliente ou projeto</span>
            <input
              value={newTask.client}
              onChange={(event) => setNewTask((task) => ({ ...task, client: event.target.value }))}
              placeholder="Ex: Casa Mimo"
              className="h-12 min-w-0 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus-visible:ring-2 focus-visible:ring-cyan-200/50"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Responsável</span>
            <input
              value={newTask.owner}
              onChange={(event) => setNewTask((task) => ({ ...task, owner: event.target.value }))}
              placeholder="Ex: Marina Costa"
              className="h-12 min-w-0 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus-visible:ring-2 focus-visible:ring-cyan-200/50"
            />
          </label>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Prazo</span>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(event) => setNewTask((task) => ({ ...task, dueDate: event.target.value }))}
                className="h-12 min-w-0 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition focus:border-cyan-300/60 focus-visible:ring-2 focus-visible:ring-cyan-200/50"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Horas</span>
              <input
                type="number"
                min="1"
                max="24"
                value={newTask.estimate}
                onChange={(event) => setNewTask((task) => ({ ...task, estimate: Number(event.target.value) }))}
                className="h-12 min-w-0 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition focus:border-cyan-300/60 focus-visible:ring-2 focus-visible:ring-cyan-200/50"
              />
            </label>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Prioridade</span>
            <div className="grid grid-cols-3 gap-2">
              {(["alta", "media", "baixa"] as TaskPriority[]).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setNewTask((task) => ({ ...task, priority }))}
                  className={`rounded-2xl border px-2 py-2 text-xs font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${newTask.priority === priority ? priorityMeta[priority].className : "border-white/10 bg-slate-950/40 text-slate-500 hover:text-slate-300"}`}
                >
                  {priorityMeta[priority].label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={addTask}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 font-black text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Plus size={17} />
            Adicionar tarefa
          </button>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock3 size={16} />
            <span className="text-sm font-black">Atenção da equipe</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Antes de iniciar uma nova frente, confirme quem responde pelas entregas de alta prioridade e pelos prazos de hoje.
          </p>
        </div>
      </div>
    </section>
  );
}
