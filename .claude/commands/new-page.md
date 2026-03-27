Create a new page in this MDS prototyping app.

Page name/description: $ARGUMENTS

## Steps

1. Use `ds_search_components` and `ds_get_component` from the masala-design-system MCP to find the right MDS components for this page
2. Create the page component in `src/pages/` (or `src/features/[name]/pages/` if it's part of a feature)
3. Wrap content in `<Page>` component for proper scroll containment
4. Use `PageHeader` for title and breadcrumbs
5. Use MDS `Row`, `Column` for layout grid (Column size must be string "6" not number)
6. Use MDS helper classes for spacing: `p-6`, `mt-4`, `d-flex`, `align-items-center`, etc.
7. Add the route constant to `src/app/router/routes.ts`
8. Add the route to `src/app/router/index.tsx`
9. Add a nav item to `headerNavItems` in `src/app/layouts/AppLayout.tsx`
10. Verify with `npx tsc -b --noEmit`

Use only MDS components — never raw HTML/CSS when a component exists. Check the MDS MCP tools first.
