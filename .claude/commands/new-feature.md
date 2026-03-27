Create a new feature module in this MDS prototyping app.

Feature name/description: $ARGUMENTS

## Steps

1. Use `ds_search_components`, `ds_get_component`, `ds_get_pattern` from masala-design-system MCP to find relevant MDS components and patterns
2. Create the feature folder structure:
   ```
   src/features/[name]/
     types/[name].ts          # Zod schema + TypeScript types
     services/[name]Api.ts    # API functions using apiClient
     hooks/use[Name].ts       # TanStack Query hooks (list, single, mutations)
     components/              # Feature-specific UI components
     pages/                   # Route page components
   ```
3. Create mock data in `src/mocks/data/[name].ts`
4. Create MSW handlers in `src/mocks/handlers/[name]Handlers.ts` (CRUD: GET list with pagination/search, GET single, POST create, PUT update, DELETE)
5. Register handlers in `src/mocks/handlers/index.ts`
6. Create page components wrapped in `<Page>` (or `<SidebarLayout>` if sidebar needed)
7. Add routes to `src/app/router/routes.ts` and `src/app/router/index.tsx`
8. Add nav item to `headerNavItems` in `src/app/layouts/AppLayout.tsx`
9. Use async Table pattern with `fetchData` for list pages
10. Use `react-hook-form` + `zod` + MDS form components for create/edit
11. Use `toast.add()` from `src/store/useToastStore` for notifications
12. Verify with `npx tsc -b --noEmit`

Follow the `src/features/patients/` structure as reference. Use only MDS components.
