import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-overlay ${className}`}
    />
  );
}

export function TaskSkeleton() {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-overlay px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-lg shadow-black/20 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
