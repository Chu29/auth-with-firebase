"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: Notification[];
  notify: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((message: string, type: NotificationType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, notify, removeNotification }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all animate-in slide-in-from-right-full ${
              n.type === "success"
                ? "border-success/20 bg-success/10 text-success"
                : n.type === "error"
                ? "border-danger/20 bg-danger/10 text-danger"
                : n.type === "warning"
                ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-200"
                : "border-accent/20 bg-accent/10 text-accent"
            }`}
          >
            <div className="flex-1 text-sm font-medium">{n.message}</div>
            <button
              onClick={() => removeNotification(n.id)}
              className="rounded-full p-1 hover:bg-surface-overlay transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
