Look up MDS design system information for building UI.

What to look up: $ARGUMENTS

## Steps

Use the masala-design-system MCP tools to find what's needed:

### Finding components
- `ds_list_components` — see all 103 components grouped by category (atoms, molecules, organisms)
- `ds_search_components "keyword"` — search by name
- `ds_get_component "name"` — full props, variants, sub-components, import path

### Finding examples
- `ds_search_examples "keyword"` — search usage examples
- `ds_search_examples "keyword" component:"table"` — filter by component
- `ds_get_example "example-id"` — full code with imports

### Finding patterns
- `ds_list_patterns` — all UI patterns (forms, layouts, tables, date pickers)
- `ds_get_pattern "Pattern Name"` — full pattern code

### Finding helpers & tokens
- `ds_search_helpers "flex"` — CSS helper classes
- `ds_search_tokens "primary"` — design tokens
- `ds_list_tokens` — all tokens

### Validating code
- `ds_validate_code` — validate code against MDS best practices

Present the results clearly with import paths, prop tables, and code examples.
