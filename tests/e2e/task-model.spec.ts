import { expect, test } from "@playwright/test";
import {
  createInitialTasks,
  normalizeTasks,
} from "../../src/app/dashboard/task-model";

test("initial demo tasks form one coherent agency workspace", () => {
  const tasks = createInitialTasks();

  expect(tasks.length).toBeGreaterThanOrEqual(6);
  expect(tasks.every((task) => task.owner.length > 0)).toBe(true);
  expect(tasks.some((task) => task.client === "Casa Mimo")).toBe(true);
  expect(tasks.some((task) => task.client === "Feira da Vila")).toBe(true);
  expect(tasks.some((task) => task.client === "Operação interna")).toBe(true);
});

test("legacy stored tasks receive a safe owner fallback", () => {
  const tasks = normalizeTasks([
    {
      id: "legacy",
      title: "Tarefa antiga",
      client: "Projeto",
      status: "todo",
      priority: "media",
      dueDate: "2026-07-15",
      estimate: 2,
    },
  ]);

  expect(tasks).toEqual([
    expect.objectContaining({
      id: "legacy",
      title: "Tarefa antiga",
      owner: "Equipe Ritmoar",
    }),
  ]);
});

test("invalid stored data falls back to the complete demo workspace", () => {
  expect(normalizeTasks({ invalid: true })).toEqual(createInitialTasks());
});
