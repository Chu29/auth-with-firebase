import React, { type ChangeEvent } from "react";
import { Task, TaskFormState, formatDate, toDate, startOfDay } from "./types";

interface TaskListItemProps {
  task: Task;
  isEditing: boolean;
  editForm: TaskFormState;
  onStartEdit: (task: Task) => void;
  onCancelEdit: () => void;
  onEditChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSaveEdit: (taskId: string) => void;
  onToggleStatus: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskListItem({
  task,
  isEditing,
  editForm,
  onStartEdit,
  onCancelEdit,
  onEditChange,
  onSaveEdit,
  onToggleStatus,
  onDelete,
}: TaskListItemProps) {
  const due = formatDate(task.dueDate);
  const isComplete = task.status === "completed";

  if (isEditing) {
    return (
      <li className="group rounded-xl border border-indigo-500/50 bg-surface-raised ring-1 ring-indigo-500/20 px-4 py-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Editing Task
            </span>
            <div className="flex gap-2">
              <button
                onClick={onCancelEdit}
                className="text-xs font-medium text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => onSaveEdit(task._id)}
                className="text-xs font-bold text-indigo-300 hover:text-indigo-200"
              >
                Save Changes
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <input
              name="title"
              value={editForm.title}
              onChange={onEditChange}
              className="w-full rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              placeholder="Task title"
              autoFocus
            />
            <div className="flex gap-3">
              <input
                type="date"
                name="dueDate"
                value={editForm.dueDate}
                onChange={onEditChange}
                className="flex-1 rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            <textarea
              name="description"
              rows={2}
              value={editForm.description}
              onChange={onEditChange}
              className="w-full resize-none rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              placeholder="Add notes..."
            />
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="group rounded-xl border border-border-subtle bg-surface-overlay hover:border-indigo-500/30 px-4 py-4 transition-all">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 cursor-pointer" onClick={() => onStartEdit(task)}>
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
              <span className={`text-xs ${toDate(task.dueDate)! < startOfDay(new Date()) && !isComplete ? "text-red-400" : "text-text-muted"}`}>
                Due {due}
              </span>
            )}
          </div>
          <p
            className={`mt-2 text-sm font-semibold ${
              isComplete
                ? "text-text-muted line-through"
                : "text-text-primary group-hover:text-indigo-200"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 text-sm text-text-secondary line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleStatus(task)}
            className="rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-emerald-500/30 hover:text-emerald-300"
          >
            {isComplete ? "Mark uncompleted" : "Mark completed"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            className="rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-xs font-medium text-text-secondary transition-all hover:border-red-500/30 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
