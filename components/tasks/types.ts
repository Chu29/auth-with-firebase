export type TaskStatus = "completed" | "uncompleted";
export type StatusFilter = "all" | "completed" | "uncompleted";
export type DueFilter = "all" | "today" | "overdue" | "week" | "none";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string | null;
  updatedAt?: string | null;
};

export type TaskFormState = {
  title: string;
  description: string;
  dueDate: string;
};

export type ViewFilters = {
  query: string;
  status: StatusFilter;
  due: DueFilter;
};

export type SavedView = {
  id: string;
  name: string;
  filters: ViewFilters;
};

export type FilterTab = {
  id: string;
  label: string;
  status: StatusFilter;
  due: DueFilter;
};

export const FILTER_TABS: FilterTab[] = [
  { id: "all", label: "All", status: "all", due: "all" },
  { id: "in-progress", label: "In progress", status: "uncompleted", due: "all" },
  { id: "completed", label: "Completed", status: "completed", due: "all" },
  { id: "today", label: "Due today", status: "all", due: "today" },
  { id: "week", label: "Next 7 days", status: "all", due: "week" },
  { id: "overdue", label: "Overdue", status: "all", due: "overdue" },
  { id: "no-due", label: "No due date", status: "all", due: "none" },
];

export function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
}

export function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDelta(delta: number, label: string) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta} ${label}`;
}
