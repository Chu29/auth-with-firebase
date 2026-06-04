"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { TaskSkeleton } from "./skeletons";
import {
  Task,
  TaskFormState,
  StatusFilter,
  DueFilter,
  SavedView,
  FILTER_TABS,
  toDate,
  startOfDay,
  addDays,
  TaskStats,
  TaskCreateForm,
  TaskFilters,
  TaskViewManager,
  TaskListItem,
} from "./tasks";

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
    // Fall through
  }
  return `Request failed with status ${response.status}`;
}

export default function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [viewName, setViewName] = useState("");
  const [viewError, setViewError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TaskFormState>(emptyForm);
  const { notify } = useNotifications();

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

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }
      const data = (await response.json()) as { tasks?: Task[] };
      const fetchedTasks = data.tasks ?? [];
      setTasks(fetchedTasks);
      
      const overdueCount = fetchedTasks.filter(t => 
        t.status === "uncompleted" && 
        t.dueDate && 
        new Date(t.dueDate) < startOfDay(new Date())
      ).length;

      if (overdueCount > 0) {
        notify(`You have ${overdueCount} overdue task(s)!`, "warning");
      }
    } catch (err) {
      setError((err as Error).message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("taskViews");
      if (!stored) return;
      const parsed = JSON.parse(stored) as SavedView[];
      if (Array.isArray(parsed)) setSavedViews(parsed);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("taskViews", JSON.stringify(savedViews));
    } catch {
      // Ignore
    }
  }, [savedViews]);

  const handleFormChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (key: "query" | "status" | "due", value: string | StatusFilter | DueFilter) => {
    setActiveViewId(null);
    if (key === "query") setSearchQuery(value as string);
    if (key === "status") setStatusFilter(value as StatusFilter);
    if (key === "due") setDueFilter(value as DueFilter);
  };

  const handleApplyTab = (tab: typeof FILTER_TABS[0]) => {
    setActiveViewId(null);
    setStatusFilter(tab.status);
    setDueFilter(tab.due);
  };

  const handleApplyView = (view: SavedView) => {
    setActiveViewId(view.id);
    setSearchQuery(view.filters.query);
    setStatusFilter(view.filters.status);
    setDueFilter(view.filters.due);
  };

  const handleSaveView = () => {
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

  const handleDeleteView = (id: string) => {
    setSavedViews((prev) => prev.filter((view) => view.id !== id));
    if (activeViewId === id) setActiveViewId(null);
  };

  const handleResetViews = () => {
    setActiveViewId(null);
    setSearchQuery("");
    setStatusFilter("all");
    setDueFilter("all");
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
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: form.description.trim() || undefined,
          dueDate: form.dueDate || undefined,
        }),
      });
      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }
      const data = (await response.json()) as { task: Task };
      setTasks((prev) => [data.task, ...prev]);
      setForm(emptyForm);
      notify("Task created successfully!", "success");
    } catch (err) {
      setError((err as Error).message ?? "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "uncompleted" : "completed";
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t)),
    );

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task._id, status: nextStatus }),
      });
      if (!response.ok) {
        setError(await readErrorMessage(response));
        setTasks(previousTasks);
        return;
      }
      const data = (await response.json()) as { task: Task };
      setTasks((prev) =>
        prev.map((current) => (current._id === task._id ? data.task : current)),
      );
      notify(`Task marked as ${nextStatus}!`, "success");
    } catch {
      setError("Failed to update task");
      setTasks(previousTasks);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((task) => task._id !== taskId));

    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });
      if (!response.ok) {
        setError(await readErrorMessage(response));
        setTasks(previousTasks);
        return;
      }
      notify("Task deleted.", "info");
    } catch {
      setError("Failed to delete task");
      setTasks(previousTasks);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title,
      description: task.description ?? "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditForm(emptyForm);
  };

  const handleSaveEdit = async (taskId: string) => {
    const title = editForm.title.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }

    const previousTasks = [...tasks];
    const nextTask = {
      ...tasks.find((t) => t._id === taskId)!,
      title,
      description: editForm.description.trim(),
      dueDate: editForm.dueDate || null,
    };
    setTasks((prev) => prev.map((t) => (t._id === taskId ? nextTask : t)));
    setEditingTaskId(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          title,
          description: editForm.description.trim(),
          dueDate: editForm.dueDate || null,
        }),
      });
      if (!response.ok) {
        setError(await readErrorMessage(response));
        setTasks(previousTasks);
        return;
      }
      const data = (await response.json()) as { task: Task };
      setTasks((prev) =>
        prev.map((current) => (current._id === taskId ? data.task : current)),
      );
      notify("Task updated.", "success");
    } catch {
      setError("Failed to update task");
      setTasks(previousTasks);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Tasks</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>{loading ? "Loading..." : `${tasks.length} tasks`}</span>
          <button
            type="button"
            onClick={loadTasks}
            disabled={loading}
            className="rounded-full border border-border-subtle px-3 py-1 font-medium uppercase tracking-wide text-text-secondary transition hover:border-indigo-500/30 hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
      </div>

      <TaskStats summary={summary} loading={loading} />

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <TaskCreateForm
            form={form}
            creating={creating}
            onChange={handleFormChange}
            onSubmit={handleCreate}
          />
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20 lg:col-span-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Task list</p>
              <p className="mt-1 text-xs text-text-muted">Stay on top of what matters.</p>
            </div>
            <span className="rounded-full border border-border-subtle bg-surface-overlay px-3 py-1 text-xs font-medium text-text-secondary">
              {summary.completedTotal} done
            </span>
          </div>

          <div className="mt-5 space-y-6">
            <TaskFilters
              searchQuery={searchQuery}
              activeTabId={activeTabId}
              onFilterChange={handleFilterChange}
              onApplyTab={handleApplyTab}
            />

            <TaskViewManager
              savedViews={savedViews}
              activeViewId={activeViewId}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              dueFilter={dueFilter}
              viewName={viewName}
              viewError={viewError}
              onApplyView={handleApplyView}
              onDeleteView={handleDeleteView}
              onSaveView={handleSaveView}
              onViewNameChange={setViewName}
              onReset={handleResetViews}
            />

            {loading ? (
              <div className="mt-6 space-y-3">
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border-subtle bg-surface-overlay px-4 py-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H9.75M8.25 21H15.75A2.25 2.25 0 0 0 18 18.75V5.25A2.25 2.25 0 0 0 15.75 3H8.25A2.25 2.25 0 0 0 6 5.25v13.5A2.25 2.25 0 0 0 8.25 21Z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-medium text-text-primary">No tasks found</p>
                <p className="mt-1 text-xs text-text-muted">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {filteredTasks.map((task) => (
                  <TaskListItem
                    key={task._id}
                    task={task}
                    isEditing={editingTaskId === task._id}
                    editForm={editForm}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onEditChange={handleEditChange}
                    onSaveEdit={handleSaveEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
