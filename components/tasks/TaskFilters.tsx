import React from "react";
import { FilterTab, FILTER_TABS, StatusFilter, DueFilter } from "./types";

interface TaskFiltersProps {
  searchQuery: string;
  activeTabId: string | null;
  onFilterChange: (key: "query" | "status" | "due", value: string | StatusFilter | DueFilter) => void;
  onApplyTab: (tab: FilterTab) => void;
}

export function TaskFilters({ searchQuery, activeTabId, onFilterChange, onApplyTab }: TaskFiltersProps) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs uppercase tracking-wide text-text-muted">
          Search
        </span>
        <input
          value={searchQuery}
          onChange={(event) =>
            onFilterChange("query", event.target.value)
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
              onClick={() => onApplyTab(tab)}
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
  );
}
