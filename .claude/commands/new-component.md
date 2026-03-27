Create a new reusable component using MDS design system.

Component name/description: $ARGUMENTS

## Steps

1. Search MDS for existing components that match: `ds_search_components`, `ds_get_component`
2. Check if a pattern already exists: `ds_list_patterns`, `ds_get_pattern`
3. If MDS has the component, create a thin wrapper in `src/components/app/` or `src/components/patterns/`
4. If MDS doesn't have it, compose from MDS primitives (Card, Row, Column, Text, Icon, etc.)
5. Use MDS helper classes for all spacing and layout
6. Use MDS design tokens (CSS variables) for colors — never hardcode hex values
7. Keep the component flat and readable — designers should understand it by reading top to bottom
8. Export with a clear interface (typed props)
9. Verify with `npx tsc -b --noEmit`

Place in:
- `src/components/app/` — general app-level components
- `src/components/patterns/` — composed multi-component patterns
- `src/features/[name]/components/` — feature-specific components
