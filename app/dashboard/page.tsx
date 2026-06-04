import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/signOutButton";
import TasksPanel from "@/components/tasksPanel";
import ActivityTimeline from "@/components/activityTimeline";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

async function getSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;

  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="relative min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-400 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
              T
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-text-primary">
                Tasky Dashboard
              </h1>
              <p className="text-xs text-text-muted">
                Welcome back, {session.name || session.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full bg-surface-raised px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle transition hover:border-indigo-500/30 hover:text-text-primary"
            >
              <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center overflow-hidden border border-indigo-500/20">
                {session.picture ? (
                  <img
                    src={session.picture}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-3.5 w-3.5 text-indigo-300"
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
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <SignOutButton />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Area */}
          <section className="lg:col-span-9 space-y-6">
            <TasksPanel />
          </section>
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <ActivityTimeline />
          </aside>
        </div>
      </div>
    </main>
  );
}
