"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

type UserPreferences = {
  emailNotifications: boolean;
  overdueReminders: boolean;
};

type UserProfile = {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: UserPreferences;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: false,
    overdueReminders: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setProviders(data.providers || []);
        setDisplayName(data.user.displayName || "");
        setPhotoURL(data.user.photoURL || "");
        if (data.user.preferences) {
          setPreferences(data.user.preferences);
        }
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, photoURL, preferences }),
      });

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        const data = await response.json();
        setProfile(data.user);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const togglePreference = (key: keyof UserPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOutAll = async () => {
    if (!confirm("Are you sure you want to sign out of all devices?")) return;

    try {
      const response = await fetch("/api/auth/sign-out-all", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to sign out all:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary">
              Profile Settings
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid gap-8">
          {/* Profile Section */}
          <section className="rounded-2xl border border-border-subtle bg-surface-raised p-8 shadow-lg shadow-black/20">
            <div className="flex items-center gap-6 mb-8">
              <div className="h-20 w-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
                {photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-10 w-10 text-indigo-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {profile?.displayName}
                </h2>
                <p className="text-sm text-text-muted">{profile?.email}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-text-muted">
                    Display Name
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2 text-sm text-text-primary focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-text-muted">
                    Avatar URL
                  </span>
                  <input
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border-subtle bg-surface-overlay px-4 py-2 text-sm text-text-primary focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wide text-text-muted block">
                  Preferences
                </span>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-overlay border border-border-subtle">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Email Notifications
                    </p>
                    <p className="text-xs text-text-muted">
                      Receive alerts for overdue tasks via email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreference("emailNotifications")}
                    className={`h-6 w-11 rounded-full transition-colors relative ${preferences.emailNotifications ? "bg-indigo-600" : "bg-surface-overlay"}`}
                  >
                    <div
                      className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${preferences.emailNotifications ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-overlay border border-border-subtle">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Overdue Reminders
                    </p>
                    <p className="text-xs text-text-muted">
                      Show in-app alerts for overdue tasks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreference("overdueReminders")}
                    className={`h-6 w-11 rounded-full transition-colors relative ${preferences.overdueReminders ? "bg-indigo-600" : "bg-surface-overlay"}`}
                  >
                    <div
                      className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${preferences.overdueReminders ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-emerald-400">{success}</p>}

              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>

          {/* Connected Providers */}
          <section className="rounded-2xl border border-border-subtle bg-surface-raised p-8 shadow-lg shadow-black/20">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
              Connected Providers
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-overlay border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-surface-overlay flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-text-primary"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      GitHub
                    </p>
                    <p className="text-xs text-text-muted">
                      {providers.includes("github.com")
                        ? "Connected"
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                {providers.includes("github.com") ? (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                    Active
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Link Account
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-overlay border border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-surface-overlay flex items-center justify-center">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Google
                    </p>
                    <p className="text-xs text-text-muted">
                      {providers.includes("google.com")
                        ? "Connected"
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                {providers.includes("google.com") ? (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                    Active
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Link Account
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="rounded-2xl border border-border-subtle bg-surface-raised p-8 shadow-lg shadow-black/20">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Security
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Manage your account security and active sessions.
            </p>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <h4 className="text-sm font-semibold text-red-400 mb-1">
                Sign out of all devices
              </h4>
              <p className="text-xs text-text-muted mb-4">
                This will revoke all active sessions and refresh tokens. You
                will be signed out on this device as well.
              </p>
              <button
                onClick={handleSignOutAll}
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Sign out all sessions
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
