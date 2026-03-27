import { Table, type TableProps } from '@innovaccer/design-system';

interface AppTableProps extends Omit<TableProps, 'data' | 'schema'> {
  data: TableProps['data'];
  schema: TableProps['schema'];
  loading?: boolean;
  withPagination?: boolean;
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
}

export function AppTable({
  data,
  schema,
  loading,
  withPagination,
  page,
  pageSize,
  totalRecords,
  onPageChange,
  headerOptions,
  ...props
}: AppTableProps) {
  return (
    <Table
      data={data}
      schema={schema}
      showMenu={false}
      loading={loading}
      withPagination={withPagination}
      page={page}
      pageSize={pageSize}
      totalRecords={totalRecords}
      onPageChange={onPageChange}
      paginationType="jump"
      headerOptions={headerOptions}
      {...props}
    />
  );
}
