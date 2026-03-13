import Header from "@/components/Header";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    <>
      <Header session={session} />
    </>
  );
}
