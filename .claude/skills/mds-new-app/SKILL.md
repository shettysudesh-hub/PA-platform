---
name: mds-new-app
description: Use when the user wants to create, scaffold, or start a new Innovaccer MDS prototyping app from scratch
---

# MDS New App

## Overview

Scaffold a new MDS prototyping app from the `mds-app` template. Run this **outside any project directory** — it creates the project folder, installs deps, and gets the dev server running.

After scaffolding, all in-project building is guided by `CLAUDE.md` (Claude Code) or `docs/claude-desktop-prompt.md` (Claude Desktop) — both ship inside the new project and cover the same rules.

## Steps

### 1. Get the project name

Ask if not provided. Use kebab-case (e.g., `patient-tracker`, `care-dashboard`).

### 2. Clone and reinitialize

```bash
git clone --depth 1 https://github.com/satyamyadav/mds-app.git <project-name>
cd <project-name>
rm -rf .git
git init
git add -A
git commit -m "init: scaffold from mds-app template"
```

### 3. Install dependencies

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required — `@innovaccer/rich-text-editor` has a peer dep conflict with `@innovaccer/design-system@next`.

### 4. Update project name

Edit `package.json`: change `"name": "mds-app"` → `"name": "<project-name>"`

### 5. Start dev server

```bash
cd <project-name>
npm run dev
```

### 6. Tell the user what's ready

- App is running at http://localhost:5173 — MSW mock API is active automatically
- **Claude Code**: run `claude` inside the project — CLAUDE.md rules are enforced automatically via a SessionStart hook
- **Claude Desktop**: follow `docs/claude-desktop-prompt.md` for MCP setup and the project system prompt
- Slash commands: `/new-page`, `/new-feature`, `/new-component`, `/from-figma`, `/mds-lookup`

## MCP Setup

The masala-design-system MCP is required for design system lookups. Add to Claude Desktop config (`claude_desktop_config.json`) or the project `.mcp.json` is already configured for Claude Code:

```json
{
  "mcpServers": {
    "masala-design-system": {
      "command": "/path/to/npx",
      "args": ["-y", "@innovaccer/mds-mcp"]
    }
  }
}
```

Use `which npx` to find the full path — required on macOS with nvm since Claude Desktop doesn't inherit shell PATH.

## What's Included

| Layer | Tool |
|-------|------|
| Framework | React 19 + TypeScript 5.9 + Vite 8 |
| UI | @innovaccer/design-system@next (v5) |
| Routing | react-router v7 |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| Forms | react-hook-form + zod |
| Mocking | MSW v2 (always on in dev) |
| Charts | echarts + echarts-for-react |
| Lint/format | ESLint 9 + Prettier + Husky |
| Claude commands | new-page, new-feature, new-component, from-figma, mds-lookup |

Example `patients` CRUD feature included — copy `src/features/patients/` for new features.
