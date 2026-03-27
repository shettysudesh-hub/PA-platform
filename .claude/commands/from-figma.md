Implement a UI from a Figma design URL using MDS components.

Figma URL or description: $ARGUMENTS

## Steps

1. Extract `fileKey` and `nodeId` from the Figma URL
   - URL format: `figma.com/design/:fileKey/:fileName?node-id=:nodeId`
   - Convert `-` to `:` in nodeId
2. Call `get_design_context` from the Figma MCP with the fileKey and nodeId
3. Analyze the returned screenshot and reference code
4. **Do NOT use the Tailwind output directly** — translate it to MDS components:
   - Map Figma elements to MDS components using `ds_search_components` and `ds_get_component`
   - Use MDS helper classes (`d-flex`, `p-4`, `mt-6`, etc.) instead of Tailwind classes
   - Use MDS tokens (CSS variables like `var(--primary)`, `var(--spacing-40)`) instead of hex colors
   - Use `Row`/`Column` for grid layouts
5. Create the component/page following the project's existing patterns
6. Add routing if it's a new page
7. Verify with `npx tsc -b --noEmit`

Priority: Match the Figma design precisely while using MDS components for consistency.
