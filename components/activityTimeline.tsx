"use client";

import { useEffect, useState } from "react";
import { ActivitySkeleton } from "./skeletons";

type ActivityType = "sign-in" | "task-created" | "task-completed" | "task-deleted" | "task-updated";

type Activity = {
  _id: string;
  type: ActivityType;
  metadata?: {
    taskTitle?: string;
    taskId?: string;
  };
  createdAt: string;
};

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "sign-in":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
          </svg>
        </div>
      );
    case "task-created":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      );
    case "task-completed":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      );
    case "task-deleted":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 12m-4.72 0-.34-12M4.5 7.51h15m-1.5 0-1.29 12.45c-.06.57-.35 1.05-.75 1.45s-.96.6-1.52.6h-6.18c-.56 0-1.12-.2-1.52-.6s-.69-.88-.75-1.45L5.25 7.51" />
          </svg>
        </div>
      );
    case "task-updated":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </div>
      );
  }
}

function getActivityText(activity: Activity) {
  const title = activity.metadata?.taskTitle ? `"${activity.metadata.taskTitle}"` : "a task";
  switch (activity.type) {
    case "sign-in":
      return "Signed in to the dashboard";
    case "task-created":
      return `Created task ${title}`;
    case "task-completed":
      return `Completed task ${title}`;
    case "task-deleted":
      return `Deleted task ${title}`;
    case "task-updated":
      return `Updated task ${title}`;
  }
}

export default function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadActivities();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20">
        <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
        <div className="mt-6 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
        <button 
          onClick={loadActivities}
          className="text-xs font-medium text-text-muted hover:text-indigo-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted italic">No recent activity found.</p>
      ) : (
        <div className="mt-6 space-y-6 relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-border-subtle" />
          
          {activities.map((activity) => (
            <div key={activity._id} className="relative flex gap-4">
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center bg-surface-raised">
                {getActivityIcon(activity.type)}
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="text-sm text-text-secondary leading-tight">
                  <span className="font-medium text-text-primary">
                    {getActivityText(activity)}
                  </span>
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                  <span>{formatDate(activity.createdAt)}</span>
                  <span>•</span>
                  <span>{formatTime(activity.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
