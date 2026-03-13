import SignOutButton from "@/components/SignoutButton";
import Image from "next/image";
import dbConnect from "@/lib/config/mongodb";
import User from "@/lib/models/userSchema";

interface Session {
  uid?: string;
  name?: string;
  email?: string;
  picture?: string;
}

export default async function Header({ session }: { session: Session }) {
  await dbConnect();
  const user = await User.findOne({ firebaseUid: session.uid });

  const displayName = user?.displayName || session.name || "User";
  const email = user?.email || session.email || "";
  const photoURL = user?.photoURL || session.picture || "";
  const firstName = displayName.split(" ")[0] || displayName;
  const initials = displayName
    .split(" ")
    .filter((part: string) => part !== "")
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="px-4 pt-5 sm:px-6 lg:px-10">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-2xl border border-white/10 bg-linear-to-r from-[#2b2f35] via-[#2f3339] to-[#2a2d33] px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Taskify
          </h1>
          <p className="mt-1 text-base text-slate-200/90">
            {greeting}, {firstName}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <div className="text-right">
            <p className="text-base font-semibold text-white">{displayName}</p>
            <p className="text-sm text-slate-200/80">{email}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-200 text-sm font-semibold text-indigo-900">
            {photoURL ? (
              <Image
                src={photoURL}
                alt="Profile"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
            ) : (
              <span>{initials || "U"}</span>
            )}
          </div>

          <SignOutButton />
        </div>
      </header>
    </main>
  );
}
