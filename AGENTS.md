# AGENTS.md

Guidance for coding agents working in `/home/mathew/dotfiles`.

## Repository overview

- This repo is a GNU Stow-managed dotfiles repository.
- Top-level folders are stow packages (for example `bash`, `git`, `hypr`, `nvim`, `cursor`).
- There is also a Bun/TypeScript CLI in `skl/` for managing skills.
- Main repo usage is documented in `CLAUDE.md`.

## Rules files discovered

- No `.cursorrules` file found.
- No `.cursor/rules/` directory found.
- No `.github/copilot-instructions.md` found.
- If these files are added later, treat them as high-priority constraints and update this file.

## Tooling and environment

- Primary package manager/runtime for `skl/`: Bun.
- TypeScript is configured via `skl/tsconfig.json` (`strict: true`, `noEmit: true`).
- Lua formatting preferences are defined in `nvim/.config/nvim/stylua.toml`.
- Stow is the primary install/symlink mechanism for dotfile packages.

## Build, lint, and test commands

Use these from repo root unless noted.

### Dotfiles (Stow)

- Dry run a package install: `stow -n <package>`
- Install a package: `stow <package>`
- Install all packages: `stow */`
- Remove a package: `stow -D <package>`

### `skl` CLI (Bun + TypeScript)

- Install deps: `bun install` (run in `skl/`)
- Run CLI: `bun run index.ts` (run in `skl/`)
- Run add subcommand: `bun run index.ts add <owner/repo-or-github-url>`
- Typecheck project: `bunx tsc --noEmit` (run in `skl/`)
- Typecheck single file: `bunx tsc --noEmit index.ts` (run in `skl/`)

### Tests

- There is no first-party test suite currently in this repo.
- For Bun tests if/when added (in `skl/`): `bun test`
- Run a single test file (Bun): `bun test path/to/file.test.ts`
- Run a single test by name (Bun): `bun test -t "test name substring"`

### Lint/format

- No repo-wide linter config (ESLint/Biome) is currently checked in.
- Lua format (Neovim config): `stylua nvim/.config/nvim`
- Optional shell lint: `shellcheck bash/.bashrc bash/.bashrc.d/*.bash`

### Fast verification by change type

- Changed only `skl/*.ts`: run `bunx tsc --noEmit` in `skl/`.
- Changed one TS file and want narrow feedback: `bunx tsc --noEmit <file>.ts`.
- Added Bun tests: run one file first with `bun test path/to/file.test.ts`.
- Debugging one test case: `bun test -t "<name substring>"`.
- Changed Bash files: run `shellcheck` on only touched scripts.
- Changed Neovim Lua: run `stylua nvim/.config/nvim`.

## Expected code style

Follow existing local style per language. Prefer matching surrounding code over introducing new conventions.

### General

- Keep edits minimal and focused; avoid broad refactors in dotfiles repos.
- Preserve existing behavior unless task explicitly requests behavior changes.
- Do not touch secrets in `.env`; use `.env.example` for shape/reference only.
- Avoid changing lockfiles unless dependency updates are part of the task.

### TypeScript (`skl/`)

- Use ESM imports.
- Prefer grouping imports as:
  1) external packages,
  2) Node built-ins,
  3) local modules.
- Use `type` imports for type-only symbols where applicable.
- Use 2-space indentation.
- Use semicolons.
- Use double quotes for strings.
- Keep helper functions small and named with `camelCase`.
- Use `UPPER_SNAKE_CASE` for top-level constants (for example paths/config).
- Prefer explicit return types on exported functions and non-trivial helpers.
- Respect strict TypeScript settings; avoid `any` unless unavoidable.
- Prefer union/narrowing and guards over type assertions.

### Error handling and process behavior (`skl/`)

- Handle filesystem/network operations defensively with `try/catch`.
- For fatal CLI errors, print a clear message and exit non-zero.
- For recoverable states, surface status to user and continue where safe.
- Keep safety checks around symlinks and destructive operations.
- Do not silently ignore failures unless explicitly intended and documented by code.

### Naming and structure (`skl/`)

- Use descriptive names (`searchQuery`, `filteredIndices`, `pendingDelete`).
- Keep UI state variables near each other.
- Keep view update helpers separate from input handlers when possible.
- Keep command parsing near the entrypoint.

### Lua (`nvim/`)

- Respect `stylua.toml` settings:
  - spaces indentation,
  - indent width 2,
  - column width 120.
- Prefer concise module-style config and `require(...)` patterns already in use.

### Bash (`bash/`)

- Keep functions simple and composable.
- Quote variables unless word-splitting is explicitly desired.
- Prefer early validation with clear usage/error messages.
- Preserve existing alias/function naming patterns.

## Agent workflow recommendations

- Before editing, scan nearby files for style and conventions.
- After editing `skl/`, run at least `bunx tsc --noEmit` in `skl/`.
- After editing Lua, run `stylua nvim/.config/nvim` when available.
- For stow-related changes, run `stow -n <package>` to validate symlink plan.
- Include verification notes in your final response.

## Paths of interest

- Stow usage and repo notes: `CLAUDE.md`
- TypeScript CLI entrypoint: `skl/index.ts`
- TypeScript CLI add flow: `skl/add.ts`
- TS config: `skl/tsconfig.json`
- Bun package manifest: `skl/package.json`
- Bash config root: `bash/.bashrc`
- Bash functions: `bash/.bashrc.d/20-functions.bash`
- Neovim init: `nvim/.config/nvim/init.lua`
- Stylua config: `nvim/.config/nvim/stylua.toml`

## When unsure

- Prefer the smallest safe change.
- Prefer consistency with existing code over idealized patterns.
- If a command or rule is missing, document the gap in your response.
