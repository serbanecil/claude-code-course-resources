# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`SPEC.MD` at the repo root is the design for the app (a note-taking app). Treat it as the intended architecture, not a description of current code.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

## Commands

Bun is the package manager and runtime (`bun.lock` is the lockfile). npm/pnpm work too, per the README, but prefer Bun.

- `bun install` — install dependencies
- `bun dev` — `next dev` at http://localhost:3000
- `bun run build` — `next build`
- `bun start` — serve the production build
- `bun run lint` — ESLint flat config (`eslint.config.mjs`: `next/core-web-vitals` + `next/typescript`)
- Type check: there is no script; run `bunx tsc --noEmit`

There is no test runner (no test script, no test dependencies). There is no single-test command either; a test framework has to be chosen and added first.

## Current state

The repo is still the create-next-app scaffold. `app/page.tsx` is the default template and `app/layout.tsx` still has the "Create Next App" metadata. TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`), `better-auth`, and `zod` are installed but unused. None of the spec's pieces exist yet: no `lib/`, no `app/api/`, no `components/`, no database file, no auth config.

## Planned architecture (from SPEC.MD)

- One Next.js App Router app (Next 16, React 19) running on Bun. Server components fetch data; client components host the TipTap editor and other interactive UI.
- Persistence: a single SQLite file (`app.db`) accessed through Bun's built-in SQLite client with raw SQL, no ORM. Planned layering: `lib/db.ts` (singleton connection and `query`/`get`/`run` helpers) → `lib/notes.ts` (repository functions) → route handlers under `app/api/notes/` and `app/api/public-notes/[slug]`.
- Auth: better-auth owns the `user`, `session`, `account`, and `verification` tables, and `notes.user_id` references `user(id)`. Every note query filters by `user_id`. Unauthenticated API calls get 401; a note the caller doesn't own gets 404, not 403.
- Note content is TipTap JSON, stored as a string in `notes.content_json` (`JSON.stringify` on write, `JSON.parse` on read). Render it only through TipTap, never with `dangerouslySetInnerHTML`.
- Sharing: enabling `is_public` generates a random `public_slug` (16+ chars); disabling it clears both `is_public` and `public_slug`. `/p/[slug]` is read-only and must not expose owner information.
- Routes: `/` (landing), `/dashboard` and `/notes/[id]` (authenticated, checked on the server), `/p/[slug]` (public).

## Spec vs. project config

- The spec lists `tailwind.config.ts`, but this project uses Tailwind v4 with CSS-first config: `@import "tailwindcss"` in `app/globals.css` and `@tailwindcss/postcss` in `postcss.config.mjs`. Don't add a `tailwind.config.ts` unless there's a concrete need.
- The spec uses `nanoid()` for slugs, but `nanoid` is not in `package.json`.
- `@/*` maps to the project root (`tsconfig.json` paths).
