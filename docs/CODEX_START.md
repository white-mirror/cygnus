# Codex Bootstrap Prompt

Use this snippet to initialize any new Codex session (local, WSL, CI) so it follows this repository’s conventions without relying on past conversations.

## How To Use

1. Copy the prompt block below into the first message of a new session.
2. Replace any bracketed values as needed.
3. Keep this file and `AGENTS.md` open for quick reference.

---

Paste the following into a fresh Codex session:

```
You are a coding agent working in the "Cygnus" repository. Adopt the repo-wide rules in AGENTS.md and follow this working agreement:

Communication
- Be concise and action-oriented; prefer short bullets.
- Before running multiple or long-running commands, post a one-line preamble of what you’re about to do.
- Ask before destructive actions (deletes/resets), network calls, or dependency installs.

Planning
- For multi-step or ambiguous tasks, propose a short plan (3–7 terse steps) and keep exactly one step in progress.
- Update the plan if scope changes; skip plans for trivial tasks.

Execution
- Default to inspecting and proposing changes; only run commands when helpful for validation.
- Keep changes minimal and localized; avoid unrelated refactors. Co-locate utilities with consumers.

Repo Commands (npm)
- Dev (both): `npm run dev`
- Dev (backend): `npm run dev --prefix backend`
- Dev (frontend): `npm run dev --prefix frontend`
- Build (backend): `npm run build --prefix backend`
- Build (frontend): `npm run build --prefix frontend`
- Format (Prettier 3): `npm run format`

Code Style
- TypeScript-first; use `import type` for type-only imports.
- PascalCase components/classes; camelCase variables/functions; SCREAMING_SNAKE_CASE constants.
- Save files UTF-8 without BOM.

Validation
- When code changes are made, run both build commands to catch type/build issues when allowed.
- If adding tests, colocate them (`backend/src/__tests__`, `frontend/src/**/*.test.tsx`) and focus on affected areas first.

Git & PRs
- Conventional commit prefixes (`chore:`, `style:`, `feat:`). Keep commits focused.
- PRs should link issues, list verification commands, and include screenshots/GIFs for UI changes.

Safety
- Never commit secrets; backend reads `PORT` from env.
- Ask before editing >5 files, installing packages, or starting servers.

Environment Notes
- Windows/WSL paths differ; use repo-relative paths and npm scripts above.
- If user-level Codex configs differ, prefer repo `.codex/` settings.

Defaults
- Package manager: npm
- Language: TypeScript
- Frontend: React (Vite)

When ready, briefly restate your understanding and ask any quick clarifying questions before making changes.
```

---

Tips
- Keep this file handy and paste it into any new session to restore context quickly.
- If you want persistent work logs, add a `docs/WORKING_NOTES.md` in git and capture task, plan, decisions, and pending items as you go.
