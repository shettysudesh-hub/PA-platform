# MDS Prototyping Studio

Rapidly prototype UI features using the **Innovaccer Masala Design System (MDS)** — like Lovable, v0, or Figma Make, but outputting production-grade React code with real design system components, tokens, and helper classes.

## Prerequisites

```bash
node --version   # v18+ required
npm --version    # v9+ required
git --version    # any recent version
```

## Quick Start

```bash
git clone --depth 1 https://github.com/satyamyadav/mds-app.git
cd mds-app
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:5173`. MSW mock API is active automatically.

## Use with Claude Code

This repo is optimized for AI-assisted prototyping with Claude Code:

```bash
cd mds-app
claude
```

### Slash Commands

| Command | Description |
|---------|-------------|
| `/new-page [description]` | Create a new page with routing and nav |
| `/new-feature [description]` | Scaffold a full feature module (types, API, hooks, pages, mocks) |
| `/new-component [description]` | Create a reusable component using MDS |
| `/from-figma [url]` | Implement UI from a Figma design URL |
| `/mds-lookup [query]` | Look up MDS components, patterns, helpers, tokens |

### MCP Tools

- **masala-design-system** — Search 103+ MDS components, get props/examples, find patterns, validate code
- **Figma Dev Mode** — Read designs from Figma, get screenshots, extract design context

## Use with Claude Desktop

See [`docs/claude-desktop-prompt.md`](docs/claude-desktop-prompt.md) for setup instructions and the system prompt to use in a Claude Desktop project.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 + TypeScript 5.9 + Vite 8 |
| UI Components | `@innovaccer/design-system@next` (v5) |
| Routing | react-router v7 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | react-hook-form + zod |
| Mocking | MSW v2 (browser, always on in dev) |
| Lint/Format | ESLint 9 + Prettier + Husky pre-commit |

## Project Structure

```
src/
  app/
    layouts/        # Header nav + layout shell
    providers/      # QueryClient + Router + MDS CSS
    router/         # Route definitions
  components/
    app/            # Shared: Page, PageHeader, AppTable, SidebarLayout, Toast
    patterns/       # Reusable: FilterBar, ConfirmDialog
  features/
    patients/       # Example CRUD feature (copy this for new features)
  pages/            # Standalone pages (Home, FormExample, NotFound)
  services/         # Shared API client
  store/            # Zustand stores (sidebar, toast)
  mocks/            # MSW handlers + mock data
  types/            # Global shared types
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## Adding a Page

1. Create component in `src/pages/` — wrap in `<Page>` for scroll
2. Add route to `src/app/router/routes.ts` + `index.tsx`
3. Add nav item in `src/app/layouts/AppLayout.tsx`

## Adding a Feature

Copy `src/features/patients/`:
1. `types/` — Zod schema + TypeScript types
2. `services/` — API functions using `apiClient`
3. `hooks/` — TanStack Query hooks
4. `components/` — UI components
5. `pages/` — Route pages
6. Add MSW handlers in `src/mocks/handlers/`
7. Wire up routing + nav

## License

MIT
