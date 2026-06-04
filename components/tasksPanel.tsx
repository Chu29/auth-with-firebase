"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

type TaskStatus = "completed" | "uncompleted";
type StatusFilter = "all" | "completed" | "uncompleted";
type DueFilter = "all" | "today" | "overdue" | "week" | "none";

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string | null;
  updatedAt?: string | null;
};

type TaskFormState = {
  title: string;
  description: string;
  dueDate: string;
};

type ViewFilters = {
  query: string;
  status: StatusFilter;
  due: DueFilter;
};

type SavedView = {
  id: string;
  name: string;
  filters: ViewFilters;
};

type FilterTab = {
  id: string;
  label: string;
  status: StatusFilter;
  due: DueFilter;
};

const emptyForm: TaskFormState = {
  title: "",
  description: "",
  dueDate: "",
};

const FILTER_TABS: FilterTab[] = [
  { id: "all", label: "All", status: "all", due: "all" },
  { id: "in-progress", label: "In progress", status: "uncompleted", due: "all" },
  { id: "completed", label: "Completed", status: "completed", due: "all" },
  { id: "today", label: "Due today", status: "all", due: "today" },
  { id: "week", label: "Next 7 days", status: "all", due: "week" },
  { id: "overdue", label: "Overdue", status: "all", due: "overdue" },
  { id: "no-due", label: "No due date", status: "all", due: "none" },
];

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

function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDelta(delta: number, label: string) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta} ${label}`;
}

export default function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [viewName, setViewName] = useState("");
  const [viewError, setViewError] = useState<string | null>(null);

  const activeTabId = useMemo(() => {
    const match = FILTER_TABS.find(
      (tab) => tab.status === statusFilter && tab.due === dueFilter,
    );
    return match?.id ?? null;
  }, [statusFilter, dueFilter]);

  const summary = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    let dueToday = 0;
    let dueYesterday = 0;
    let overdue = 0;
    let overduePrev = 0;
    let completedThisWeek = 0;
    let completedPrevWeek = 0;
    let completedTotal = 0;

    for (const task of tasks) {
      if (task.status === "completed") {
        completedTotal += 1;
        const updatedAt = toDate(task.updatedAt);
        if (updatedAt) {
          if (updatedAt >= weekStart && updatedAt < tomorrowStart) {
            completedThisWeek += 1;
          } else if (updatedAt >= prevWeekStart && updatedAt < weekStart) {
            completedPrevWeek += 1;
          }
        }
        continue;
      }

      const due = toDate(task.dueDate);
      if (!due) continue;

      if (due >= todayStart && due < tomorrowStart) {
        dueToday += 1;
      }
      if (due >= yesterdayStart && due < todayStart) {
        dueYesterday += 1;
      }
      if (due < todayStart) {
        overdue += 1;
      }
      if (due < yesterdayStart) {
        overduePrev += 1;
      }
    }

    return {
      dueToday,
      dueYesterday,
      overdue,
      overduePrev,
      completedThisWeek,
      completedPrevWeek,
      completedTotal,
    };
  }, [tasks]);

  const dueTodayDelta = summary.dueToday - summary.dueYesterday;
  const overdueDelta = summary.overdue - summary.overduePrev;
  const completedDelta = summary.completedThisWeek - summary.completedPrevWeek;

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const todayStart = startOfDay(new Date());
    const tomorrowStart = addDays(todayStart, 1);
    const weekEnd = addDays(todayStart, 7);

    return tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      const dueDate = toDate(task.dueDate);
      if (dueFilter === "today") {
        if (!dueDate || dueDate < todayStart || dueDate >= tomorrowStart) {
          return false;
        }
      }
      if (dueFilter === "overdue") {
        if (!dueDate || dueDate >= todayStart) {
          return false;
        }
      }
      if (dueFilter === "week") {
        if (!dueDate || dueDate < todayStart || dueDate >= weekEnd) {
          return false;
        }
      }
      if (dueFilter === "none") {
        if (dueDate) {
          return false;
        }
      }

      if (!query) return true;
      const haystack = `${task.title} ${task.description ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [tasks, searchQuery, statusFilter, dueFilter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("taskViews");
      if (!stored) return;
      const parsed = JSON.parse(stored) as SavedView[];
      if (Array.isArray(parsed)) {
        setSavedViews(parsed);
      }
    } catch (err) {
      setViewError(
        (err as Error).message ?? "Failed to load saved task views",
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("taskViews", JSON.stringify(savedViews));
      setViewError(null);
    } catch (err) {
      setViewError(
        (err as Error).message ?? "Failed to save task view changes",
      );
    }
  }, [savedViews]);

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

  const handleFilterChange = (
    key: keyof ViewFilters,
    value: ViewFilters[keyof ViewFilters],
  ) => {
    setActiveViewId(null);
    if (key === "query") setSearchQuery(value as string);
    if (key === "status") setStatusFilter(value as StatusFilter);
    if (key === "due") setDueFilter(value as DueFilter);
  };

  const applyTab = (tab: FilterTab) => {
    setActiveViewId(null);
    setStatusFilter(tab.status);
    setDueFilter(tab.due);
  };

  const applyView = (view: SavedView) => {
    setActiveViewId(view.id);
    setSearchQuery(view.filters.query);
    setStatusFilter(view.filters.status);
    setDueFilter(view.filters.due);
  };

  const saveView = () => {
    const trimmedName = viewName.trim();
    if (!trimmedName) {
      setViewError("Provide a name to save this view.");
      return;
    }
    const newView: SavedView = {
      id: `${Date.now()}`,
      name: trimmedName,
      filters: {
        query: searchQuery,
        status: statusFilter,
        due: dueFilter,
      },
    };
    setSavedViews((prev) => [newView, ...prev]);
    setViewName("");
    setViewError(null);
    setActiveViewId(newView.id);
  };

  const deleteView = (id: string) => {
    setSavedViews((prev) => prev.filter((view) => view.id !== id));
    if (activeViewId === id) {
      setActiveViewId(null);
    }
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Create, track, and complete your work.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span>{loading ? "Loading tasks..." : `${tasks.length} task(s)`}</span>
          <button
            type="button"
            onClick={loadTasks}
            disabled={loading}
            className="rounded-full border border-border-subtle px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary transition hover:border-indigo-500/30 hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Due today
          </p>
          <p className="mt-3 text-2xl font-semibold text-text-primary">
            {summary.dueToday}
          </p>
          <p
            className={`mt-2 text-xs ${
              dueTodayDelta > 0
                ? "text-indigo-300"
                : dueTodayDelta < 0
                  ? "text-text-secondary"
                  : "text-text-muted"
            }`}
          >
            {formatDelta(dueTodayDelta, "vs yesterday")}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Completed this week
          </p>
          <p className="mt-3 text-2xl font-semibold text-text-primary">
            {summary.completedThisWeek}
          </p>
          <p
            className={`mt-2 text-xs ${
              completedDelta > 0
                ? "text-emerald-300"
                : completedDelta < 0
                  ? "text-amber-300"
                  : "text-text-muted"
            }`}
          >
            {formatDelta(completedDelta, "vs last week")}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-wide text-text-muted">
            Overdue
          </p>
          <p className="mt-3 text-2xl font-semibold text-text-primary">
            {summary.overdue}
          </p>
          <p
            className={`mt-2 text-xs ${
              overdueDelta > 0
                ? "text-red-300"
                : overdueDelta < 0
                  ? "text-emerald-300"
                  : "text-text-muted"
            }`}
          >
            {formatDelta(overdueDelta, "since yesterday")}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {viewError && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {viewError}
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                New task
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Add clear, actionable items.
              </p>
            </div>
            <span className="rounded-full border border-border-subtle bg-surface-overlay px-3 py-1 text-xs font-medium text-text-secondary">
              {creating ? "Saving..." : "Draft"}
            </span>
          </div>
          <form onSubmit={handleCreate} className="mt-5 space-y-4">
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
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-text-muted">
                Keep titles short and specific.
              </span>
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-indigo-500/30 hover:bg-white/6 disabled:pointer-events-none disabled:opacity-40"
              >
                {creating ? "Creating..." : "Add task"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Task list
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Stay on top of what matters.
              </p>
            </div>
            <span className="rounded-full border border-border-subtle bg-surface-overlay px-3 py-1 text-xs font-medium text-text-secondary">
              {summary.completedTotal} done
            </span>
          </div>

          <div className="mt-5">
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  Search
                </span>
                <input
                  value={searchQuery}
                  onChange={(event) =>
                    handleFilterChange("query", event.target.value)
                  }
                  placeholder="Search tasks..."
                  className="mt-2 w-full rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_TABS.map((tab) => {
                  const isActive = activeTabId === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => applyTab(tab)}
                      aria-pressed={isActive}
                      className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition ${
                        isActive
                          ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-200"
                          : "border-border-subtle text-text-secondary hover:border-indigo-500/30 hover:text-text-primary"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
                {activeTabId === null && (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-200">
                    Custom
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">
                Saved views
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveViewId(null);
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDueFilter("all");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition ${
                  activeViewId === null &&
                  searchQuery === "" &&
                  statusFilter === "all" &&
                  dueFilter === "all"
                    ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-200"
                    : "border-border-subtle text-text-secondary hover:border-indigo-500/30 hover:text-text-primary"
                }`}
              >
                Default
              </button>
              {savedViews.map((view) => (
                <span
                  key={view.id}
                  className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface-overlay px-2 py-1 text-xs text-text-secondary"
                >
                  <button
                    type="button"
                    onClick={() => applyView(view)}
                    className={`px-2 py-1 text-xs font-medium ${
                      activeViewId === view.id
                        ? "text-indigo-200"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {view.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteView(view.id)}
                    className="rounded-full px-1 text-xs text-text-muted hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                value={viewName}
                onChange={(event) => setViewName(event.target.value)}
                placeholder="Save this view as..."
                className="w-full flex-1 rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70"
              />
              <button
                type="button"
                onClick={saveView}
                className="rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-indigo-500/30 hover:bg-white/6"
              >
                Save view
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-text-secondary">Loading tasks…</p>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-subtle bg-surface-overlay px-4 py-6 text-sm text-text-muted">
                No tasks match these filters.
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredTasks.map((task) => {
                  const due = formatDate(task.dueDate);
                  const isPending = pendingIds.has(task._id);
                  const isComplete = task.status === "completed";
                  return (
                    <li
                      key={task._id}
                      className="rounded-xl border border-border-subtle bg-surface-overlay px-4 py-4 transition hover:border-indigo-500/30"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                isComplete
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-indigo-500/10 text-indigo-300"
                              }`}
                            >
                              {isComplete ? "Completed" : "In progress"}
                            </span>
                            {due && (
                              <span className="text-xs text-text-muted">
                                Due {due}
                              </span>
                            )}
                          </div>
                          <p
                            className={`mt-2 text-sm font-semibold ${
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
      </div>
    </section>
  );
}
