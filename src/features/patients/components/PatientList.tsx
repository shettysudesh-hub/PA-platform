import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Table, Badge, Button, Text, Link } from '@innovaccer/design-system';
import type { GridCellProps } from '@innovaccer/design-system';
import { EmptyState } from '../../../components/app/EmptyState';
import type { Patient } from '../types/patient';

interface PatientListProps {
  onAdd: () => void;
}

function getAge(dob: string): number {
  const parts = dob.split('/');
  const birthDate = new Date(+parts[2], +parts[0] - 1, +parts[1]);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

const riskLevelAppearance: Record<string, 'success' | 'warning' | 'alert'> = {
  L: 'success',
  M: 'warning',
  H: 'alert',
};

const PAGE_SIZE = 10;

const schema = [
  {
    name: 'patientName',
    displayName: 'Patient name',
    width: '18%',
    sorting: true,
    cellRenderer: (props: GridCellProps) => {
      const row = props.data as Patient;
      const age = getAge(row.dateOfBirth);
      const displayName = row.preferredName
        ? `${row.lastName}, ${row.firstName} (${row.preferredName})`
        : `${row.lastName}, ${row.firstName}`;
      return (
        <div>
          <Link href={`/patients/${row.id}`}>{displayName}</Link>
          <div>
            <Text size="small" appearance="subtle">
              {row.dateOfBirth} ({age}y), {row.gender}
            </Text>
          </div>
        </div>
      );
    },
  },
  {
    name: 'empi',
    displayName: 'EMPI',
    width: '10%',
    sorting: true,
  },
  {
    name: 'assignedDate',
    displayName: 'Assigned date',
    width: '12%',
    sorting: true,
  },
  {
    name: 'ongoingActivity',
    displayName: 'My ongoing activity',
    width: '20%',
    cellRenderer: (props: GridCellProps) => {
      const row = props.data as Patient;
      if (!row.ongoingActivity) return <></>;
      return (
        <span>
          <Link>{row.ongoingActivity.name}</Link>
          {row.ongoingActivity.count != null && row.ongoingActivity.count > 0 && (
            <Link className="ml-2">+{row.ongoingActivity.count}</Link>
          )}
        </span>
      );
    },
  },
  {
    name: 'keyDiagnosis',
    displayName: 'Key diagnosis',
    width: '20%',
    cellRenderer: (props: GridCellProps) => {
      const row = props.data as Patient;
      if (!row.keyDiagnosis) return <></>;
      return (
        <div>
          <Text>
            {row.keyDiagnosis.name}
            {row.keyDiagnosis.count != null && row.keyDiagnosis.count > 0 && (
              <Link className="ml-2">+{row.keyDiagnosis.count}</Link>
            )}
          </Text>
          <div>
            <Text size="small" appearance="subtle">
              {row.keyDiagnosis.icdCode}
            </Text>
          </div>
        </div>
      );
    },
  },
  {
    name: 'risk',
    displayName: 'Risk',
    width: '15%',
    cellRenderer: (props: GridCellProps) => {
      const row = props.data as Patient;
      if (!row.riskInfo) return <></>;
      return (
        <span className="d-flex align-items-center">
          <Text>
            {row.riskInfo.model} - {row.riskInfo.score}
          </Text>
          <Badge appearance={riskLevelAppearance[row.riskInfo.level]} subtle>
            {row.riskInfo.level}
          </Badge>
          {row.riskInfo.additionalCount != null && row.riskInfo.additionalCount > 0 && (
            <Link>+{row.riskInfo.additionalCount}</Link>
          )}
        </span>
      );
    },
  },
];

const loaderSchema = schema.map((s) => ({
  name: s.name,
  displayName: s.displayName,
  width: s.width,
}));

export function PatientList({ onAdd }: PatientListProps) {
  const navigate = useNavigate();

  const fetchData = useCallback(
    (options: { page?: number; pageSize?: number; searchTerm?: string }) => {
      const page = options.page ?? 1;
      const limit = options.pageSize ?? PAGE_SIZE;
      const search = options.searchTerm ?? '';

      const query = new URLSearchParams();
      if (search) query.set('search', search);
      query.set('page', String(page));
      query.set('limit', String(limit));

      return fetch(`/api/patients?${query}`)
        .then((res) => res.json())
        .then((res: { data: Patient[]; total: number }) => ({
          count: res.total,
          data: res.data,
          schema,
        }));
    },
    [],
  );

  return (
    <div className="h-100 overflow-hidden">
      <Table
        type="data"
        size="comfortable"
        fetchData={fetchData}
        loaderSchema={loaderSchema}
        withHeader={true}
        headerOptions={{
          withSearch: true,
          allowColumnReordering: true,
          dynamicColumn: true,
        }}
        withPagination={true}
        pageSize={PAGE_SIZE}
        paginationType="jump"
        onRowClick={(rowData: Record<string, unknown>) => {
          const row = rowData as unknown as Patient;
          navigate(`/patients/${row.id}`);
        }}
        showMenu={false}
        errorTemplate={() => (
          <EmptyState title="No patients found" description="Try adjusting your search or filters.">
            <Button appearance="primary" onClick={onAdd}>
              Add Patient
            </Button>
          </EmptyState>
        )}
      />
    </div>
  );
}
