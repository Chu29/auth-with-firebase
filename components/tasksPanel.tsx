"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

type TaskStatus = "completed" | "uncompleted";

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string | null;
};

type TaskFormState = {
  title: string;
  description: string;
  dueDate: string;
};

const emptyForm: TaskFormState = {
  title: "",
  description: "",
  dueDate: "",
};

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data.error === "string") {
      return data.error;
    }
  } catch {
    // Fall through to generic message.
  }
  return `Request failed with status ${response.status}`;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
}

export default function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);

  const markPending = (taskId: string) => {
    setPendingIds((prev) => new Set(prev).add(taskId));
  };

  const clearPending = (taskId: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }
      const data = (await response.json()) as { tasks?: Task[] };
      setTasks(data.tasks ?? []);
    } catch (err) {
      setError((err as Error).message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const payload: {
        title: string;
        description?: string;
        dueDate?: string;
      } = { title };
      const description = form.description.trim();
      if (description) payload.description = description;
      if (form.dueDate) payload.dueDate = form.dueDate;

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }
      const data = (await response.json()) as { task: Task };
      setTasks((prev) => [data.task, ...prev]);
      setForm(emptyForm);
    } catch (err) {
      setError((err as Error).message ?? "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (task: Task) => {
    const nextStatus =
      task.status === "completed" ? "uncompleted" : "completed";
    markPending(task._id);
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task._id, status: nextStatus }),
      });
      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }
      const data = (await response.json()) as { task: Task };
      setTasks((prev) =>
        prev.map((current) =>
          current._id === task._id ? data.task : current,
        ),
      );
    } catch (err) {
      setError((err as Error).message ?? "Failed to update task");
    } finally {
      clearPending(task._id);
    }
  };

  const deleteTask = async (taskId: string) => {
    markPending(taskId);
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });
      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err) {
      setError((err as Error).message ?? "Failed to delete task");
    } finally {
      clearPending(taskId);
    }
  };

  return (
    <section className="mt-10">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Create, track, and complete your work.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">
                Title
              </span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Add a new task"
                className="mt-2 w-full rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70"
              />
            </label>
            <label>
              <span className="text-xs uppercase tracking-wide text-text-muted">
                Due date
              </span>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">
                Notes
              </span>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Optional details"
                className="mt-2 w-full resize-none rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : (
              <span className="text-sm text-text-muted">
                {loading ? "Loading tasks..." : `${tasks.length} task(s)`}
              </span>
            )}
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-indigo-500/30 hover:bg-white/6 disabled:pointer-events-none disabled:opacity-40"
            >
              {creating ? "Creating..." : "Add task"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-text-secondary">Loading tasks…</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-text-muted">No tasks yet.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => {
                const due = formatDate(task.dueDate);
                const isPending = pendingIds.has(task._id);
                const isComplete = task.status === "completed";
                return (
                  <li
                    key={task._id}
                    className="rounded-xl border border-border-subtle bg-surface-overlay px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isComplete
                              ? "text-text-muted line-through"
                              : "text-text-primary"
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-1 text-sm text-text-secondary">
                            {task.description}
                          </p>
                        )}
                        {due && (
                          <p className="mt-2 text-xs text-text-muted">
                            Due {due}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStatus(task)}
                          disabled={isPending}
                          className="rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-emerald-500/30 hover:text-emerald-300 disabled:pointer-events-none disabled:opacity-40"
                        >
                          {isComplete ? "Mark uncompleted" : "Mark completed"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task._id)}
                          disabled={isPending}
                          className="rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-red-500/30 hover:text-red-300 disabled:pointer-events-none disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
