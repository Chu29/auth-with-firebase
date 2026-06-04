import React, { type ChangeEvent, type FormEvent } from "react";
import { TaskFormState } from "./types";

interface TaskCreateFormProps {
  form: TaskFormState;
  creating: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function TaskCreateForm({ form, creating, onChange, onSubmit }: TaskCreateFormProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20 h-fit">
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
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs uppercase tracking-wide text-text-muted">
              Title
            </span>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
            className="rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-indigo-500/30 hover:bg-surface-overlay disabled:pointer-events-none disabled:opacity-40"
          >
            {creating ? "Creating..." : "Add task"}
          </button>
        </div>
      </form>
    </div>
  );
}
