"use client";

import { useState } from "react";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // handle user signin
  const signInWithProvider = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);

    try {
      const selectedProvider =
        provider === "google" ? googleProvider : githubProvider;
      const result = await signInWithPopup(auth, selectedProvider);

      // get a token and create an session cookie
      const idToken = await result.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      await fetch("/api/users", {
        method: "POST",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError((error as Error).message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // handle user signout
  const signOut = async () => {
    await firebaseSignOut(auth);
    await fetch("/api/auth/session", {
      method: "DELETE",
    });
    router.push("/login");
    router.refresh();
  };

  return { signInWithProvider, signOut, loading, error };
}
