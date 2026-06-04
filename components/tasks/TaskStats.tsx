import React from "react";
import { StatSkeleton } from "../skeletons";
import { formatDelta } from "./types";

interface TaskSummary {
  dueToday: number;
  dueYesterday: number;
  overdue: number;
  overduePrev: number;
  completedThisWeek: number;
  completedPrevWeek: number;
  completedTotal: number;
}

interface TaskStatsProps {
  summary: TaskSummary;
  loading: boolean;
}

export function TaskStats({ summary, loading }: TaskStatsProps) {
  const dueTodayDelta = summary.dueToday - summary.dueYesterday;
  const overdueDelta = summary.overdue - summary.overduePrev;
  const completedDelta = summary.completedThisWeek - summary.completedPrevWeek;

  if (loading) {
    return (
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-lg shadow-black/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Due today
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-xl font-bold text-text-primary">
            {summary.dueToday}
          </p>
          <p
            className={`text-[10px] font-medium ${
              dueTodayDelta > 0
                ? "text-indigo-300"
                : dueTodayDelta < 0
                  ? "text-text-secondary"
                  : "text-text-muted"
            }`}
          >
            {formatDelta(dueTodayDelta, "")}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-lg shadow-black/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Completed week
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-xl font-bold text-text-primary">
            {summary.completedThisWeek}
          </p>
          <p
            className={`text-[10px] font-medium ${
              completedDelta > 0
                ? "text-emerald-300"
                : completedDelta < 0
                  ? "text-amber-300"
                  : "text-text-muted"
            }`}
          >
            {formatDelta(completedDelta, "")}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-lg shadow-black/20">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Overdue
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-xl font-bold text-text-primary">
            {summary.overdue}
          </p>
          <p
            className={`text-[10px] font-medium ${
              overdueDelta > 0
                ? "text-red-300"
                : overdueDelta < 0
                  ? "text-emerald-300"
                  : "text-text-muted"
            }`}
          >
            {formatDelta(overdueDelta, "")}
          </p>
        </div>
      </div>
    </div>
  );
}
