# Repository Guidelines

## Project Structure & Module Organization

- `backend/` – Express API (source in `src/`, integrations in `integrations/`, build output in `dist/`).
- `frontend/` – Vite + React app; entry `src/main.tsx`, UI components live under `src/`.
- Root `package.json` holds shared scripts; `.codex/` stores Codex CLI config. Keep backend/frontend changes scoped unless a feature spans both.
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
