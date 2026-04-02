import { useState, useCallback } from 'react';
import { PageHeader, Tabs, Avatar, Table } from '@innovaccer/design-system';
import { WORKLIST } from '../../data/mockData';
import type { Order } from '../../data/mockData';

// ── Status appearance map ─────────────────────────────────────────────────────
const STATUS_MAP: Record<
  string,
  {
    appearance: 'default' | 'success' | 'warning' | 'alert' | 'info';
    label: string;
  }
> = {
  New: { appearance: 'info', label: 'Ready for review' },
  Pended: { appearance: 'warning', label: 'Requires attention' },
  Approved: { appearance: 'success', label: 'Approved' },
  Denied: { appearance: 'alert', label: 'Denied' },
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { label: 'In progress', statuses: ['New', 'Pended'] },
  { label: 'Approved', statuses: ['Approved'] },
  { label: 'Denied', statuses: ['Denied'] },
  { label: 'All', statuses: [] as string[] },
];

// ── Column schema (stable reference — defined outside component) ──────────────
const SCHEMA = [
  {
    name: 'patient',
    displayName: 'Patient',
    width: 220,
    cellType: 'AVATAR_WITH_META_LIST',
    sorting: true,
  },
  {
    name: 'order',
    displayName: 'Order',
    width: 240,
    cellType: 'WITH_META_LIST',
  },
  {
    name: 'priority',
    displayName: 'Priority',
    width: 120,
    cellType: 'STATUS_HINT',
    sorting: true,
  },
  {
    name: 'provider',
    displayName: 'Provider',
    width: 170,
    sorting: true,
  },
  {
    name: 'plan',
    displayName: 'Plan & Member ID',
    width: 190,
    cellType: 'WITH_META_LIST',
  },
  {
    name: 'status',
    displayName: 'Status',
    width: 190,
    cellType: 'STATUS_HINT',
    sorting: true,
  },
  {
    name: 'updatedOn',
    displayName: 'Updated on',
    width: 150,
    sorting: true,
  },
];

// ── Date formatter ────────────────────────────────────────────────────────────
const formatDate = (daysOpen: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysOpen);
  const base = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return daysOpen === 0 ? `${base} · Today` : base;
};

// ── Row transformer ───────────────────────────────────────────────────────────
const toRow = (o: Order) => {
  const nameParts = o.patient.name.split(' ');
  return {
    _original: o,
    patient: {
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      title: o.patient.name,
      metaList: [o.patient.mrn || '—'],
    },
    order: {
      title: o.title,
      metaList: [o.type === 'prescription' ? 'Rx PA' : 'Medical PA'],
    },
    priority: {
      title: o.urgency === 'Urgent' ? 'Urgent' : 'Normal',
      statusAppearance: o.urgency === 'Urgent' ? 'alert' : 'default',
    },
    provider: {
      title: o.provider || '—',
    },
    plan: {
      title: o.patient.insurance?.payer || '—',
      metaList: [o.patient.insurance?.memberId || '—'],
    },
    status: {
      title: STATUS_MAP[o.status ?? '']?.label || o.status || '—',
      statusAppearance: STATUS_MAP[o.status ?? '']?.appearance || 'default',
    },
    updatedOn: {
      title: formatDate(o.daysOpen ?? 0),
    },
  };
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  onSelect: (order: Order) => void;
}

// ── WorklistView ──────────────────────────────────────────────────────────────
export default function WorklistView({ onSelect }: Props) {
  const [tabIndex, setTabIndex] = useState(3); // default: All

  // Tab counts
  const tabDefs = TABS.map((t) => ({
    label: t.label,
    count:
      t.statuses.length === 0
        ? WORKLIST.length
        : WORKLIST.filter((o) => t.statuses.includes(o.status ?? '')).length,
  }));

  // fetchData — called by Table on mount, search, sort, page change
  const fetchData = useCallback(
    async (options: {
      page?: number;
      pageSize?: number;
      searchTerm?: string;
      sortingList?: Array<{ name: string; type: 'asc' | 'desc' | 'unsort' }>;
    }) => {
      const { searchTerm = '', sortingList = [], page = 1, pageSize = 10 } = options;

      // 1. Filter by active tab
      const tabStatuses = TABS[tabIndex].statuses;
      let filtered = WORKLIST.filter(
        (o) => tabStatuses.length === 0 || tabStatuses.includes(o.status ?? ''),
      );

      // 2. Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.patient.name.toLowerCase().includes(q) ||
            o.title.toLowerCase().includes(q) ||
            (o.provider || '').toLowerCase().includes(q),
        );
      }

      // 3. Sort
      if (sortingList.length > 0) {
        const { name, type } = sortingList[0];
        if (type !== 'unsort') {
          filtered = [...filtered].sort((a, b) => {
            let aVal = '',
              bVal = '';
            if (name === 'patient') {
              aVal = a.patient.name;
              bVal = b.patient.name;
            }
            if (name === 'provider') {
              aVal = a.provider || '';
              bVal = b.provider || '';
            }
            if (name === 'priority') {
              aVal = a.urgency || '';
              bVal = b.urgency || '';
            }
            if (name === 'status') {
              aVal = a.status || '';
              bVal = b.status || '';
            }
            if (name === 'updatedOn') {
              aVal = String(a.daysOpen ?? 0);
              bVal = String(b.daysOpen ?? 0);
            }
            const cmp = aVal.localeCompare(bVal);
            return type === 'desc' ? -cmp : cmp;
          });
        }
      }

      // 4. Paginate
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const pageData = filtered.slice(start, start + pageSize).map(toRow);

      return {
        count: total,
        data: pageData,
        schema: SCHEMA,
      };
    },
    [tabIndex],
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--secondary-lightest)' }}>
      {/* Page header with tabs */}
      <PageHeader
        title="Prior Authorization Worklist"
        separator
        navigationPosition="center"
        actions={<Avatar firstName="M" lastName="D" size="regular" />}
        tabs={<Tabs activeIndex={tabIndex} tabs={tabDefs} onTabChange={setTabIndex} />}
      />

      {/* Table — remounts on tab change via key to trigger fresh fetchData */}
      <div className="wl-content">
        <Table
          key={`worklist-tab-${tabIndex}`}
          type="resource"
          fetchData={fetchData}
          loaderSchema={SCHEMA}
          withHeader
          headerOptions={{
            withSearch: true,
            searchPlaceholder: 'Search by patient, order, or provider',
            dynamicColumn: true,
          }}
          withPagination
          pageSize={10}
          paginationType="jump"
          onRowClick={(rowData: Record<string, unknown>) => {
            const order = rowData._original as Order;
            if (order?.status === 'New' || order?.status === 'Pended') {
              onSelect(order);
            }
          }}
        />
      </div>
    </div>
  );
}
