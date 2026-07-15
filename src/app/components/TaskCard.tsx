import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Trash2,
} from "lucide-react";
import {
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

export function TaskCard({ task, updateStatus, deleteTask }: TaskCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#0b1020] p-4 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] ${priorityMeta[task.priority].className}`}
          >
            {priorityMeta[task.priority].label}
          </span>
          <h4 className="mt-3 text-sm font-black leading-5 text-white">{task.title}</h4>
        </div>
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          aria-label={`Remover tarefa: ${task.title}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="rounded-full bg-white/5 px-2.5 py-1">{task.client}</span>
        <span className={`inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 ${dueTone(task)}`}>
          <CalendarDays size={12} />
          {formatDate(task.dueDate)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
          <Clock3 size={12} />
          {task.estimate}h
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <button
          type="button"
          disabled={task.status === "todo"}
          onClick={() => updateStatus(task.id, previousStatus(task.status))}
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={14} />
          Voltar
        </button>
        <button
          type="button"
          onClick={() => updateStatus(task.id, nextStatus(task.status))}
          disabled={task.status === "done"}
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {task.status === "done" ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          Avancar
          <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}
