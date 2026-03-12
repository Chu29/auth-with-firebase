"use client";
import { useAuth } from "@/hooks/useAuth";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <button
      onClick={signOut}
      className="rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-red-500/30 hover:text-red-400"
    >
      Sign Out
    </button>
  );
}
