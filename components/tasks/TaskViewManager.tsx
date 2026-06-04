import React from "react";
import { SavedView, StatusFilter, DueFilter } from "./types";

interface TaskViewManagerProps {
  savedViews: SavedView[];
  activeViewId: string | null;
  searchQuery: string;
  statusFilter: StatusFilter;
  dueFilter: DueFilter;
  viewName: string;
  viewError: string | null;
  onApplyView: (view: SavedView) => void;
  onDeleteView: (id: string) => void;
  onSaveView: () => void;
  onViewNameChange: (name: string) => void;
  onReset: () => void;
}

export function TaskViewManager({
  savedViews,
  activeViewId,
  searchQuery,
  statusFilter,
  dueFilter,
  viewName,
  viewError,
  onApplyView,
  onDeleteView,
  onSaveView,
  onViewNameChange,
  onReset,
}: TaskViewManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-text-muted">
          Saved views
        </span>
        <button
          type="button"
          onClick={onReset}
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
              onClick={() => onApplyView(view)}
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
              onClick={() => onDeleteView(view.id)}
              className="rounded-full px-1 text-xs text-text-muted hover:text-red-300"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={viewName}
          onChange={(event) => onViewNameChange(event.target.value)}
          placeholder="Save this view as..."
          className="w-full flex-1 rounded-lg border border-border-subtle bg-surface-overlay px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70"
        />
        <button
          type="button"
          onClick={onSaveView}
          className="rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-indigo-500/30 hover:bg-surface-overlay"
        >
          Save view
        </button>
      </div>
      {viewError && (
        <p className="text-xs text-amber-200">{viewError}</p>
      )}
    </div>
  );
}
