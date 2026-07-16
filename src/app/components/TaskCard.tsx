import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  dueLabel,
  dueTone,
  formatDate,
  nextStatus,
  previousStatus,
  priorityMeta,
  type Task,
  type TaskStatus,
} from "../dashboard/task-model";

type TaskCardProps = {
  task: Task;
  updateStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
};

const focusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6b4f]";

export function TaskCard({ task, updateStatus, deleteTask }: TaskCardProps) {
  return (
    <article className="rounded-2xl border border-[#dce2dd] bg-white p-4 shadow-[0_5px_14px_rgba(29,37,33,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] ${priorityMeta[task.priority].className}`}
          >
            {priorityMeta[task.priority].label}
          </span>
          <h4 className="mt-3 text-sm font-bold leading-5 text-[#1d2521]">
            {task.title}
          </h4>
          <p className="mt-1 truncate text-xs font-medium text-[#68736d]">
            {task.client}
          </p>
        </div>
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#8a948e] transition hover:bg-[#f8e8e3] hover:text-[#9d402f] ${focusClass}`}
          aria-label={`Remover tarefa: ${task.title}`}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-[#5f6c65]">
        <span className="inline-flex min-w-0 items-center gap-2">
          <UserRound size={13} className="shrink-0 text-[#2f6b4f]" aria-hidden="true" />
          <span className="truncate">{task.owner}</span>
        </span>
        <span className={`inline-flex items-center gap-2 ${dueTone(task)}`}>
          <CalendarDays size={13} className="shrink-0" aria-hidden="true" />
          <span>{dueLabel(task)} · {formatDate(task.dueDate)}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock3 size={13} className="shrink-0 text-[#77817c]" aria-hidden="true" />
          <span>{task.estimate}h estimadas</span>
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#e4e8e5] pt-3">
        <button
          type="button"
          disabled={task.status === "todo"}
          onClick={() => updateStatus(task.id, previousStatus(task.status))}
          className={`inline-flex min-h-10 items-center gap-1 rounded-xl px-2.5 text-xs font-semibold text-[#68736d] transition hover:bg-[#f1f4f2] hover:text-[#1d2521] disabled:cursor-not-allowed disabled:opacity-30 ${focusClass}`}
          aria-label={`Voltar tarefa: ${task.title}`}
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Voltar
        </button>
        <button
          type="button"
          onClick={() => updateStatus(task.id, nextStatus(task.status))}
          disabled={task.status === "done"}
          className={`inline-flex min-h-10 items-center gap-1 rounded-xl bg-[#e5efe8] px-3 text-xs font-bold text-[#24563e] transition hover:bg-[#d9e9de] disabled:cursor-not-allowed disabled:opacity-45 ${focusClass}`}
          aria-label={
            task.status === "done"
              ? `Tarefa concluída: ${task.title}`
              : `Avançar tarefa: ${task.title}`
          }
        >
          {task.status === "done" ? (
            <CheckCircle2 size={14} aria-hidden="true" />
          ) : (
            <Circle size={14} aria-hidden="true" />
          )}
          {task.status === "done" ? "Concluída" : "Avançar"}
          {task.status !== "done" ? (
            <ChevronRight size={14} aria-hidden="true" />
          ) : null}
        </button>
      </div>
    </article>
  );
}
