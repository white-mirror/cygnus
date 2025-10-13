# Repository Guidelines

## Project Structure & Module Organization

- `backend/` – Express API (source in `src/`, integrations in `integrations/`, build output in `dist/`).
- `frontend/` – Vite + React app; entry `src/main.tsx`, UI components live under `src/`.
- Root `package.json` holds shared scripts; Codex CLI defaults live in this guide and should be copied into each contributor's `~/.codex/config.toml`. Keep backend/frontend changes scoped unless a feature spans both.
- Put static assets in `frontend/public` and internal utilities beside their consumers.

## Build, Test, and Development Commands

- `npm run dev` – runs both servers via `concurrently`.
- `npm run dev --prefix backend` – starts the API with `ts-node-dev` reloads.
- `npm run dev --prefix frontend` – launches the Vite dev server.
- `npm run build --prefix backend` – emits compiled JS to `backend/dist`.
- `npm run build --prefix frontend` – type-checks and produces production assets.
- `npm run format` – runs Prettier across the workspace.

## Coding Style & Naming Conventions

- TypeScript-first; use `import type` for type-only references.
- Prettier 3 drives formatting (two-space indent, double quotes, trailing commas). Avoid manual tweaks.
- PascalCase for React components/classes, camelCase for functions and variables, SCREAMING_SNAKE_CASE for shared constants.
- Save files as UTF-8 without BOM to avoid noisy diffs.

## Testing Guidelines

- No automated suite yet; add colocated tests (`backend/src/__tests__`, `frontend/src/**/*.test.tsx`) when introducing coverage.
- Until then, run both build commands before opening a PR and note any manual QA steps in the description.

## Commit & Pull Request Guidelines

- Follow the conventional prefixes already in history (`chore:`, `style:`, `feat:`) with imperative summaries.
- Use bullet points in commit bodies for noteworthy migrations, tooling bumps, or follow-up tasks.
- PRs should link issues, list verification commands, and attach UI screenshots or GIFs for visible changes.

## Security & Configuration Tips

- Backend reads `PORT` and future secrets from the environment; document defaults in README or `.env.example`.
- Update TypeScript + ESLint stacks together to keep types, lint rules, and configs in sync.
- Never commit credentials; store integration notes under `backend/integrations/<vendor>/README.md` when needed.

## Working Agreement for Codex

- Purpose: Make agent sessions portable and consistent across local, WSL, and CI by codifying expectations inside the repo.
- Communication:
  - Keep messages concise and action-oriented; prefer bullets over prose.
  - Before running multiple or long-running commands, post a one-line preamble of what you’re about to do.
  - Ask before taking destructive actions (removing files, resetting branches) or installing dependencies.
- Planning:
  - Use a short plan for multi-step or ambiguous work (3–7 terse steps). Keep exactly one step in progress.
  - Update the plan as scope changes; don’t pad trivial work with plans.
- Execution:
  - Default to inspecting and proposing changes; only run commands when helpful for validation.
  - Keep changes minimal and localized; avoid unrelated refactors.
  - Co-locate utilities with consumers; keep backend/frontend scoped unless a feature spans both.
- Commands & Scripts:
  - Dev servers: `npm run dev` (both), or `npm run dev --prefix backend`, `npm run dev --prefix frontend`.
  - Builds: `npm run build --prefix backend`, `npm run build --prefix frontend`.
  - Formatting: `npm run format` (Prettier 3 configured; two-space, double quotes, trailing commas).
- Validation:
  - When code changes are made, run both build commands to catch type/build issues when permitted.
  - If tests are added, colocate them (`backend/src/__tests__`, `frontend/src/**/*.test.tsx`) and run just-affected portions first.
  - Document any manual QA steps in PR descriptions.
- Safety & Approvals:
  - Always ask before: package installs, starting servers, network calls, or editing >5 files at once.
  - Never store secrets in the repo. Use env vars; backend reads `PORT` by default.
- Code Style:
  - TypeScript-first; use `import type` for type-only imports.
  - PascalCase components/classes; camelCase for variables/functions; SCREAMING_SNAKE_CASE for shared constants.
  - Save files as UTF-8 without BOM.
- Git & PRs:
  - Conventional commit prefixes (`chore:`, `style:`, `feat:`). Keep commits focused.
  - PRs should link issues, list verification commands, and include screenshots/GIFs for UI changes.
- Documentation:
  - Update README or feature docs when behavior or setup changes.
  - Use `docs/CODEX_START.md` to bootstrap new agent sessions to these rules.
- Environment Notes:
  - Windows/WSL paths differ; prefer repo-relative paths and the provided npm scripts.
  - Codex CLI config: apply the `repo_no_prompts` profile (documented below) in `~/.codex/config.toml`; the former `.codex/` files are kept only as historical reference.

## Codex CLI Configuration

- Use the `repo_no_prompts` profile to run without approval prompts while keeping the default sandbox. Copy this snippet into your `~/.codex/config.toml` (extend existing tables if needed):

```toml
[profiles.repo_no_prompts]
approval_policy = "never"
sandbox_mode = "workspace-write"

[projects."/mnt/g/Projects/ioga"]
profile = "repo_no_prompts"

[projects.'\\?\G:\Projects\ioga']
profile = "repo_no_prompts"
```

- If you already have project entries, just add the `profile = "repo_no_prompts"` line rather than duplicating the table.
