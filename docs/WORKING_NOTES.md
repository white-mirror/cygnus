# Working Notes Template

Use this template to capture continuity for Codex sessions (Windows, WSL, CI). Keep entries concise and action‑oriented. See `AGENTS.md` for rules and `docs/CODEX_START.md` for the bootstrap prompt.

---

## Session

- Date/Time:
- Environment (Windows/WSL/CI):
- Branch:
- Related Issue/PR:

## Task Summary

- One‑sentence goal:
- Scope boundaries (in/out):

## Context

- Current state of feature/code:
- Assumptions and constraints:
- Open questions:

## Plan

- [ ] Step 1:
- [ ] Step 2:
- [ ] Step 3:

Keep exactly one step “in progress” at a time when executing.

## Decisions

Record important choices and rationale.

- Decision:
  - Why:
  - Alternatives considered:

## Commands Run

List notable commands for reproducibility.

- `cmd` — purpose/result

## Changes Made

High‑level summary of modified files and intent.

- File/path — brief rationale

## Validation

- Build backend: `npm run build:backend` — result:
- Build frontend web: `npm run build:web` — result:
- Build Android: `npm run build:android` — result:
- Pack Windows: `npm run pack:windows` — result:
- Manual checks/UI screenshots:
- Tests added/updated (if any):

## Follow‑Ups

- Bugs or tech debt to ticket:
- Docs to update:
- Next logical enhancements:

## Risks/Notes

- Potential regressions:
- External dependencies:

## Links/References

- Spec/Design doc:
- API references:
- Past discussions:

---

Tips

- Keep notes short; prefer bullets over prose.
- Update the plan as scope changes; do not pad trivial work.
- For new sessions, paste `docs/CODEX_START.md` to restore the working agreement quickly.
