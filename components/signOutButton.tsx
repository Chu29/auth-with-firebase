"use client";
import { useAuth } from "@/hooks/useAuth";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <button
      onClick={signOut}
      className="rounded-xl border border-white/25 bg-black/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/10"
    >
      Sign out
    </button>
  );
}
