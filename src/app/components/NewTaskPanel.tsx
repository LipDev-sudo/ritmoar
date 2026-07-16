import { CircleAlert, Plus } from "lucide-react";
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

const inputClass =
  "h-11 min-w-0 w-full rounded-xl border border-[#d7ded8] bg-white px-3 text-sm text-[#1d2521] outline-none placeholder:text-[#8a948e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6b4f]";
const labelClass =
  "mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#68736d]";

export function NewTaskPanel({
  newTask,
  setNewTask,
  addTask,
}: NewTaskPanelProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#dce2dd] bg-white shadow-[0_12px_30px_rgba(29,37,33,0.06)]">
      <div className="h-1 bg-[var(--accent)]" />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1d2521]">Nova tarefa</h2>
            <p className="mt-1 text-sm text-[#68736d]">
              Registre contexto, responsável e prazo.
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Plus size={19} aria-hidden="true" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block min-w-0">
            <span className={labelClass}>Tarefa</span>
            <input
              value={newTask.title}
              onChange={(event) =>
                setNewTask((task) => ({ ...task, title: event.target.value }))
              }
              onKeyDown={(event) => event.key === "Enter" && addTask()}
              placeholder="Ex: Aprovar roteiro da campanha"
              className={inputClass}
            />
          </label>

          <label className="block min-w-0">
            <span className={labelClass}>Cliente ou projeto</span>
            <input
              value={newTask.client}
              onChange={(event) =>
                setNewTask((task) => ({ ...task, client: event.target.value }))
              }
              placeholder="Ex: Casa Mimo"
              className={inputClass}
            />
          </label>

          <label className="block min-w-0">
            <span className={labelClass}>Responsável</span>
            <input
              value={newTask.owner}
              onChange={(event) =>
                setNewTask((task) => ({ ...task, owner: event.target.value }))
              }
              placeholder="Ex: Marina Costa"
              className={inputClass}
            />
          </label>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className={labelClass}>Prazo</span>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(event) =>
                  setNewTask((task) => ({
                    ...task,
                    dueDate: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>Horas</span>
              <input
                type="number"
                min="1"
                max="24"
                value={newTask.estimate}
                onChange={(event) =>
                  setNewTask((task) => ({
                    ...task,
                    estimate: Number(event.target.value),
                  }))
                }
                className={inputClass}
              />
            </label>
          </div>

          <fieldset>
            <legend className={labelClass}>Prioridade</legend>
            <div className="grid grid-cols-3 gap-2">
              {(["alta", "media", "baixa"] as TaskPriority[]).map(
                (priority) => (
                  <button
                    key={priority}
                    type="button"
                    aria-pressed={newTask.priority === priority}
                    onClick={() =>
                      setNewTask((task) => ({ ...task, priority }))
                    }
                    className={`min-h-11 rounded-xl border px-2 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6b4f] ${
                      newTask.priority === priority
                        ? priorityMeta[priority].className
                        : "border-[#d7ded8] bg-white text-[#68736d] hover:bg-[#f5f7f5]"
                    }`}
                  >
                    {priorityMeta[priority].label}
                  </button>
                ),
              )}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={addTask}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-[var(--accent-contrast,#fff)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2521]"
          >
            <Plus size={17} aria-hidden="true" />
            Adicionar tarefa
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-[#ead8bd] bg-[#fff8eb] p-4">
          <div className="flex items-center gap-2 text-[#8d561b]">
            <CircleAlert size={16} aria-hidden="true" />
            <span className="text-sm font-bold">Atenção da equipe</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#6d6253]">
            Antes de iniciar uma nova frente, confirme quem responde pelas
            entregas de alta prioridade e pelos prazos de hoje.
          </p>
        </div>
      </div>
    </section>
  );
}
