import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/signOutButton";

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
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Manage your account and settings
            </p>
          </div>
          <SignOutButton />
        </div>

        {/* Divider */}
        <div className="mt-6 h-px bg-border-subtle" />

        {/* Session card */}
        <div className="mt-8 rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-lg shadow-black/20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-400">
                Authenticated
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Profile name{" "}
                <span className="font-medium text-text-primary">
                  {session.name}
                </span>
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Signed in as{" "}
                <span className="font-medium text-text-primary">
                  {session.email}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
