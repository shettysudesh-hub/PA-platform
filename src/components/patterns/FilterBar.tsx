import { Input, Dropdown, Row, Column } from '@innovaccer/design-system';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filterOptions,
  onFilterChange,
  filterPlaceholder = 'Filter',
}: FilterBarProps) {
  return (
    <Row className="mb-6">
      <Column size="4">
        <Input
          name="search"
          icon="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
        />
      </Column>
      {filterOptions && onFilterChange && (
        <Column size="3">
          <Dropdown
            options={filterOptions}
            placeholder={filterPlaceholder}
            onChange={(selected: FilterOption[] | FilterOption) => {
              const value = Array.isArray(selected) ? selected[0]?.value : selected?.value;
              onFilterChange(value ?? '');
            }}
          />
        </Column>
      )}
    </Row>
  );
}
