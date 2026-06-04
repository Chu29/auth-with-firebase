"use client";
import { useAuth } from "@/hooks/useAuth";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <button
      onClick={signOut}
      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-overlay px-4 py-2 text-sm font-semibold text-text-secondary transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200"
    >
      <span className="h-2 w-2 rounded-full bg-red-400" />
      Sign Out
    </button>
  );
}
