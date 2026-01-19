# Agent Guidelines for yamlresume

This document provides instructions for agentic coding agents (like GitHub
Copilot, Cursor, or OpenCode) to maintain consistency and quality across the
`yamlresume` repository.

## 🛠 Commands

Use `pnpm` for all operations.

- **Build all:** `pnpm build`
- **Build specific package:** `pnpm core build` (or `json2yamlresume`, `cli`,
  `create-yamlresume`)
- **Lint & Format (Biome):** `pnpm check` (runs `biome check --write` and
  `tsc --noEmit`)
- **Test all:** `pnpm test`
- **Test with coverage for a package:** `pnpm core test:cov` (or
  `json2yamlresume`, `cli`, `create-yamlresume`)
- **Run a single test file for a package:**
  `pnpm core test path/to/file.test.ts` (or `json2yamlresume`, `cli`,
  `create-yamlresume`)
- **Watch mode for a package:** `pnpm core test:watch` (or `json2yamlresume`,
  `cli`, `create-yamlresume`)

## 🎨 Code Style

### Formatting & Linting

- We use **Biome** for formatting and linting. Configuration is in `biome.json`.
- **Indentation:** 2 spaces.
- **Quotes:** Single quotes for strings, double quotes for JSX.
- **Semicolons:** Omitted unless necessary (as per Biome config).
- **Imports:** Use `@/` alias for internal package imports (e.g.,
  `import { ... } from '@/models'`).

### Naming Conventions

- **Files:** `kebab-case.ts`. Test files should be `name.test.ts`.
- **Classes/Interfaces/Types:** `PascalCase`.
- **Functions/Variables:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.

### TypeScript Usage

- **Strict Typing:** Avoid `any` whenever possible. Use `unknown` if the type is
  truly unknown.
- **Named Exports:** Prefer named exports over default exports for better
  tree-shaking and IDE support.
- **Interfaces vs Types:** Use `interface` for object shapes that might be
  extended, and `type` for unions, intersections, or primitives.
- **Explicit Returns:** Annotate return types for public functions to improve
  readability and catch errors early.

### Error Handling

- Use `try...catch` blocks for operations that can fail (e.g., date parsing,
  file I/O).
- Prefer returning `null` or a specific error object instead of throwing
  exceptions for expected failure cases.
- Use the custom error classes in `packages/core/src/errors` if throwing is
  necessary.

### Licensing

- **Every** source file (`.ts`) must start with the MIT license header:
  ```typescript
  /**
   * MIT License
   *
   * Copyright (c) 2023–Present PPResume (https://ppresume.com)
   * ...
   */
  ```
- Use `pnpm license:add` to automatically prepend the header to new files.

## 🧪 Testing Guidelines

- Use **Vitest** for testing.
- Test files must be colocated with the source code (e.g., `src/utils/date.ts`
  -> `src/utils/date.test.ts`).
- Aim for 100% coverage for all packages.
- Use descriptive `describe` and `it`/`test` blocks.

## 🚀 Deployment

- Do not commit to `main` directly without testing.
- Ensure `pnpm check` passes before proposing changes.
