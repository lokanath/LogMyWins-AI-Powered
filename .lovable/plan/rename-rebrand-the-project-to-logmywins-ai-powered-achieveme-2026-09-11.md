# Rename & rebrand the project to "LogMyWins — AI-Powered Achievement Journal"

## Decision
Project name: **LogMyWins — AI-Powered Achievement Journal**
Short repo description (paste into GitHub repo *About*): *"A private, AI-powered wins journal for business professionals. Log achievements and their impact, then generate polished, executive-grade summaries with AI."*

## Why this name
- `logmywins.lovable.app` is already the published URL, so **LogMyWins** is the established brand — keeping it avoids breaking the live link.
- The **"AI-Powered"** qualifier is the keyword that signals the standout feature (AI achievement summaries) to recruiters, peers, and visitors scanning the repo.

## Changes (code, all frontend/docs only)

### 1. Rewrite `README.md`
Replace the generic Lovable boilerplate with a concise, impressive landing-style README:
- Title: **LogMyWins — AI-Powered Achievement Journal**
- One-line tagline + 2–3 sentence description emphasizing: private per-user journal, three-field wins (date / description / business impact), chronological feed, and **AI-generated achievement summaries** (month / quarter / year) in 3–5 business-language bullets.
- Feature bullets: AI summaries, private & secure (per-user data isolation), clean Frosted Executive design, email + Google auth, edit & delete entries, future-date guard, copy-to-clipboard.
- Tech stack line: TanStack Start, React 19, TypeScript, Tailwind CSS v4, Lovable Cloud (auth + database), Lovable AI Gateway.
- Local dev steps (kept from current README).

### 2. Update head metadata (`src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/auth.tsx`)
- `__root.tsx`: title → `LogMyWins — AI-Powered Achievement Journal`; description → repo description above; matching `og:title` / `og:description`.
- `index.tsx`: title → `LogMyWins — AI Wins Journal`; description → short AI-forward description; matching og tags.
- `auth.tsx`: title → `Sign In — LogMyWins`; description → "Access your private AI-powered wins journal."; matching og tags.

### 3. Auth page brand label (`src/routes/auth.tsx`)
- Change the uppercase brand chip text from `Wins Journal` to `LogMyWins` so the visible product name matches the repo.

## Out of scope
- The GitHub repository *name* and *About* description are set in the GitHub UI — I'll provide the exact text to paste, but can't edit GitHub directly.
- No backend, schema, or behavior changes.
