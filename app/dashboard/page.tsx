import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/signOutButton";
import TasksPanel from "@/components/tasksPanel";

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
    <main className="relative min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl space-y-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
              Welcome back
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Signed in as{" "}
              <span className="font-medium text-text-primary">
                {session.email}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Authenticated
            </span>
            <SignOutButton />
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10">
                <svg
                  className="h-6 w-6 text-indigo-300"
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
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  Profile
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Name{" "}
                  <span className="font-medium text-text-primary">
                    {session.name}
                  </span>
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Email{" "}
                  <span className="font-medium text-text-primary">
                    {session.email}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
                <svg
                  className="h-6 w-6 text-emerald-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 10.5h10.5a2.25 2.25 0 0 0 2.25-2.25v-6a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6A2.25 2.25 0 0 0 6.75 21Z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  Session status
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Secure session cookie is active.
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  User ID{" "}
                  <span className="font-medium text-text-primary">
                    {session.uid}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <TasksPanel />
      </div>
    </main>
  );
}
