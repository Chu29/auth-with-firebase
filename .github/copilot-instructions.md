# Copilot instructions

## Build, test, lint
- Build: `npm run build`
- Lint: `npm run lint`
- Tests: no test script configured in `package.json`.

## Architecture (big picture)
- Next.js App Router under `app/` with pages for `/login`, `/dashboard`, and a root redirect (`/` → `/login`).
- Auth flow: client uses Firebase web SDK in `lib/firebase.ts` + `hooks/useAuth` (Google/GitHub popup), then POSTs to `/api/auth/session` to mint the httpOnly `session` cookie and POSTs to `/api/users` to upsert the user before routing to `/dashboard`.
- Server-side auth: `lib/firebase-admin.ts` verifies the `session` cookie in server components (`app/dashboard/page.tsx`) and API route handlers.
- Data layer: MongoDB via Mongoose; `lib/config/mongodb.ts` manages a global cached connection; schemas live in `lib/models/*` and API routes use them.

## Conventions
- Use the `@/` path alias for imports (configured in `tsconfig.json`).
- Keep Firebase client and admin usage separate: browser code imports from `lib/firebase.ts`, server code from `lib/firebase-admin.ts`.
- Protected API routes read the `session` cookie (`cookies()`), verify it with `adminAuth.verifySessionCookie`, then call `dbConnect()` before using models.
- Session cookie name is `session`; creation/deletion is centralized in `/api/auth/session`.
- Styling uses Tailwind v4 with `@theme` tokens in `app/global.css` (classes rely on `--color-*` tokens).
- Auth redirects are centralized in `proxy.ts` (middleware-style logic with `config.matcher`).
- Env vars follow the convention: `NEXT_PUBLIC_FIREBASE_*` for client config, `FIREBASE_*` and `MONGODB_URI` for server config (see `.env.example`).
