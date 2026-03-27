# CLAUDE.md — MDS Prototyping Studio

> **Claude Code**: this file is auto-enforced via a `SessionStart` hook — rules are active from the first message.
> **Claude Desktop**: use `docs/claude-desktop-prompt.md` as the project system prompt — it contains the same rules and is interchangeable with this file.
> **New project**: use the `mds-new-app` skill (`.claude/skills/mds-new-app/`) to scaffold a fresh app from this template.

This is a **rapid UI prototyping environment** using the Innovaccer Masala Design System (MDS). Think of it like Lovable/v0/Figma Make — but outputting production-grade React code with real design system components, tokens, and helper classes for consistent UX.

## Purpose

Quickly prototype UI features, pages, and flows using MDS components. Every page should look like it belongs in the Innovaccer product suite.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — TypeScript check + production build
- `npm run lint` — ESLint 9 flat config
- `npm run preview` — Preview production build

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 + TypeScript 5.9 + Vite 8 |
| UI Components | `@innovaccer/design-system@next` (v5) |
| Routing | `react-router` v7 (client-side) |
| Server State | `@tanstack/react-query` |
| Client State | `zustand` |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` |
| Mocking | `msw` v2 (always on in dev, browser service worker) |
| Charts | `echarts` + `echarts-for-react` |
| Font | Nunito Sans (Google Fonts, loaded in index.html) |

## MCP Tools Available

- **masala-design-system** — Search components, get props/examples, search tokens, validate code against MDS
- **Figma Dev Mode** — Read designs from Figma, get screenshots, extract design context for implementation

### How to use MDS MCP

Always check MDS before building UI:
- `ds_search_components "date"` — find components by keyword
- `ds_get_component "datePicker"` — get full props, variants, sub-components
- `ds_search_examples "async" component:"table"` — find usage examples
- `ds_get_pattern "Async Table With Filters"` — get full pattern code
- `ds_search_helpers "flex"` — find CSS helper classes
- `ds_search_tokens "primary"` — find design tokens
- `ds_list_components` — see all 103 components by category

### How to use Figma MCP

When user shares a Figma URL:
1. Extract `fileKey` and `nodeId` from URL
2. Call `get_design_context` — returns reference code + screenshot
3. Adapt to MDS components (never use raw Tailwind output directly)

## Architecture

```
src/
  app/
    providers/AppProviders.tsx   # QueryClient + Router + MDS CSS
    router/index.tsx             # Route definitions
    router/routes.ts             # Route path constants
    layouts/AppLayout.tsx        # Header nav + content area
    layouts/AppLayout.css        # Minimal custom CSS
  components/
    app/                         # Shared app components
      Page.tsx                   # Page wrapper with scroll
      PageHeader.tsx             # MDS PageHeader with breadcrumbs
      AppTable.tsx               # MDS Table wrapper
      EmptyState.tsx             # MDS EmptyState wrapper
      LoadingState.tsx           # Centered spinner
      SidebarLayout.tsx          # Optional per-page sidebar
      ToastContainer.tsx         # Toast notification renderer
    patterns/                    # Reusable composed patterns
      FilterBar.tsx
      ConfirmDialog.tsx
  features/
    [feature-name]/              # Feature modules (copy this pattern)
      components/                # Feature-specific UI
      hooks/                     # TanStack Query hooks
      services/                  # API functions
      pages/                     # Route page components
      types/                     # Types + Zod schemas
  pages/                         # Standalone pages
  services/apiClient.ts          # Shared fetch wrapper
  store/                         # Zustand stores
  mocks/                         # MSW handlers + mock data
    browser.ts                   # Worker setup
    handlers/                    # API handlers per feature
    data/                        # Mock fixtures
  types/                         # Global shared types
  main.tsx                       # Entry — MSW bootstrap + render
```

## Prototyping Rules

### Always use MDS components
Never reach for raw HTML/CSS when an MDS component exists. Check `ds_search_components` first.

### Use MDS helper classes for layout
Spacing scale: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 7=32px, 8=40px

```
d-flex, flex-column, flex-row, flex-grow-1, flex-shrink-0
align-items-center, justify-content-between, justify-content-end
p-{0-14}, px-{n}, py-{n}, m-{0-14}, mx-{n}, my-{n}, mt-{n}, mb-{n}, ml-{n}, mr-{n}
h-100, vh-100, w-100, overflow-hidden, overflow-auto
bg-light, bg-secondary-lightest, bg-primary, bg-transparent
```

### Use MDS Row/Column for grid layout
```tsx
<Row>
  <Column size="6" className="mb-6">...</Column>
  <Column size="6" className="mb-6">...</Column>
</Row>
```
Column `size` must be a string ("6" not 6).

### Toast notifications
```tsx
import { toast } from '../store/useToastStore';
toast.add({ title: 'Done', appearance: 'success', message: 'It worked.' });
```

### Async Table pattern
Use `fetchData` prop for data-driven tables:
```tsx
<Table
  type="data"
  fetchData={fetchData}  // (options) => Promise<{ count, data, schema }>
  loaderSchema={loaderSchema}
  withHeader={true}
  headerOptions={{ withSearch: true, dynamicColumn: true }}
  withPagination={true}
  pageSize={10}
  paginationType="jump"
/>
```

### Forms pattern
```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Use MDS Input, Dropdown, DatePicker, Radio, Checkbox, Switch
// Show errors with MDS HelpText component
```

### Charts with ECharts
Use `echarts-for-react` for all visualizations. Wrap in MDS `Card` for consistent styling.
```tsx
import ReactECharts from 'echarts-for-react';

const option = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150], type: 'bar' }],
};

<Card className="p-6">
  <Heading size="s" className="mb-4">Chart Title</Heading>
  <ReactECharts option={option} style={{ height: 300 }} />
</Card>
```

Use MDS design tokens for chart colors:
- Primary: `#0070dd` (var(--primary))
- Success: `#2ea843` (var(--success))
- Warning: `#f8a723` (var(--warning))
- Alert: `#d93737` (var(--alert))
- Accent: `#7c5ce3` (var(--accent1))

### MSW mocking
Mock data lives in `src/mocks/data/`, handlers in `src/mocks/handlers/`. MSW starts automatically in dev mode. Add new handlers to `src/mocks/handlers/index.ts`.

### Adding a new page
1. Create page component in `src/pages/` or `src/features/[name]/pages/`
2. Add route to `src/app/router/routes.ts` and `src/app/router/index.tsx`
3. Add nav item to `headerNavItems` in `src/app/layouts/AppLayout.tsx`

### Adding a new feature
Copy the `src/features/patients/` structure:
```
src/features/[name]/
  types/[name].ts        # Zod schema + types
  services/[name]Api.ts  # API functions using apiClient
  hooks/use[Name].ts     # TanStack Query hooks
  components/            # Feature UI components
  pages/                 # Route pages
```
Add MSW handlers in `src/mocks/handlers/` and register in `index.ts`.

## Workflow — How to Build

1. **Clarify first** — Always ask clarifying questions before coding. Understand what's being built, what data it needs, and if there's a Figma reference. Do not assume.
2. **Plan and confirm** — Propose a short plan (pages, components, data model, MDS components to use). Wait for user confirmation before proceeding.
3. **Build in small working parts** — Types + mocks first, then hooks, then UI components one at a time, then routing. Each step should leave the app in a working state.
4. **Use parallel agents when possible** — For independent tasks (mock data, types, CSS), dispatch them in parallel. Only serialize when tasks depend on each other.
5. **Keep the preview working** — After every change, run `npx tsc -b --noEmit`. Fix errors immediately. Never move on with broken state.
6. **Iterate until it works** — Don't declare done until TypeScript compiles, the page renders, interactions work, and data loads correctly. If the user reports an issue, fix it immediately.

## Design Guidelines

- **MDS-first** — Always use design system components, tokens, helpers
- **Flat over abstract** — Readable code, minimal indirection, copy-paste friendly
- **Figma-accurate** — When Figma designs are provided, match them precisely
- **Healthcare context** — Data should feel realistic (patient names, conditions, ICD codes)
- **Progressive complexity** — Simple pages first, complex features build on patterns
