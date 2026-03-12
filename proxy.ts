import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
