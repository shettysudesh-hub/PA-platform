---
name: design-mind
description: >
  Gate all UI development through the design-mind MCP server.
  Before generating any UI component, block, or screen, you MUST
  consult the design-mind MCP for token resolution, block patterns,
  and design validation. No UI generation without MCP consultation.
  This is a hard block — if the MCP is unreachable, refuse and ask the user to retry.
---

# Design Mind

> The tool description is the contract. Read it before generating any input for a design-mind MCP tool. Memory is wrong. The schema is right.

## The designer's protocol

Three jobs. No exceptions.

---

### Understand the space before touching the canvas

*Tool: `consult_before_build`*

Read the tool description first, then supply:
- `intent_description` — one sentence: what are you designing and for whom?
- `scope` — exactly one of `"block"` | `"surface"` | `"token"`
- `domain`, `user_type`, `project_root` — include when known

The response is the genome. Everything you build must come from it.

---

### Make only what the genome authorizes

*Source: the `consult_before_build` response*

- Tokens → `genome.tokens`
- Layout → `genome.layout_blueprint`
- Blocks → `genome.recommended_blocks`

Do not use memorized token names, hex values, or block structures from prior context. The genome is the only truth.

---

### Validate before it leaves your hands

*Tool: `review_output`*

Read the tool description. Supply the generated code as `generated_output` and the original intent as `original_intent`. Fix every violation before the output is shown to the user.

If you find a UI pattern that has no match in the genome — call `report_pattern`. Use `closest_match_block_id` from the consult response as your anchor.

---

**If Design Mind is unreachable — stop.** Do not generate UI. Tell the user the design server is unavailable and ask them to retry.

## UI asset package

All UI components come from `@innovaccer/ui-assets` ([GitHub Packages](https://github.com/orgs/innovaccer/packages/npm/package/ui-assets)). The package has three tiers — use the most specific import path available:

```ts
// Block primitives — base interactive components
import { Button } from '@innovaccer/ui-assets/block-primitives/Button'

// Block composites — assembled domain components
import { DataTable } from '@innovaccer/ui-assets/block-composites/DataTable'

// Surfaces — full pre-built screens
import { PatientDetail } from '@innovaccer/ui-assets/surfaces/PatientDetail'
```

Never reach for raw shadcn/ui or other component libraries directly — always go through `@innovaccer/ui-assets`.

## Icons

All icons must use **Lucide** (`lucide-react`). No other icon library, inline SVG, or emoji substitutes.

```ts
import { ChevronRight, Search, X } from 'lucide-react'
```

- Choose the closest semantic Lucide icon for the intent
- Size with Tailwind utilities (`size-4`, `size-5`) — do not set `width`/`height` props
- Never hardcode SVG paths

## Companion skill

Always load the `interface-guidelines` skill alongside this one for behavioral rules that all generated content must follow.
