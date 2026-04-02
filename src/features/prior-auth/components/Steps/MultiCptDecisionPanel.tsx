import { useState, useEffect } from 'react';
import { Button, Text, Card, Badge, StatusHint, Icon } from '@innovaccer/design-system';
import AIProcessingPanel from '../shared/AIProcessingPanel';
import type { CptStatus as DecisionStatus } from '../shared/SimulatorFloater';
import type { MultiCptOrder } from '../../data/mockData';

// ── AI thinking messages ──────────────────────────────────────────────────────
const THINKING_STEPS = [
  'Submitting 2 CPTs to UHC via Availity...',
  'Electronic submissions transmitted',
  'Faxing CPT 70553 to NeuroCarve Inc...',
  'Fax queued — confirmation pending',
  'Auto-polling initiated for all submissions',
];

// ── Status display config ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  DecisionStatus,
  {
    appearance: 'default' | 'success' | 'warning' | 'alert' | 'info';
    label: string;
  }
> = {
  pended: { appearance: 'warning', label: 'Authorization Pended' },
  approved: { appearance: 'success', label: 'Authorization Approved' },
  denied: { appearance: 'alert', label: 'Authorization Denied' },
  additional_docs: { appearance: 'warning', label: 'Additional Documentation Requested' },
  contact_payer: { appearance: 'warning', label: 'Payer Contact Required' },
  submission_error: { appearance: 'alert', label: 'Submission Error' },
};

const REF_PREFIXES = ['PA-2025-836491', 'PA-2025-836492', 'PA-2025-836493'];

// ── Channel label helper ──────────────────────────────────────────────────────
function channelLabel(channel: 'electronic' | 'fax') {
  return channel === 'electronic' ? 'Electronic (Availity)' : 'Fax';
}

// ── Per-CPT decision card ─────────────────────────────────────────────────────
interface CptCardProps {
  cptCode: string;
  title: string;
  payer: string;
  channel: 'electronic' | 'fax';
  refNum: string;
  status: DecisionStatus;
}

function CptDecisionCard({ cptCode, title, payer, channel, refNum, status }: CptCardProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <Card shadow="none" className="mb-4 p-5">
      {/* Card header */}
      <div
        className="d-flex align-items-center mb-4"
        style={{ gap: 'var(--spacing-20)', flexWrap: 'wrap' }}
      >
        <Badge appearance="primary" subtle>{`CPT ${cptCode}`}</Badge>
        <Text weight="medium">{title}</Text>
        <div style={{ flex: 1 }} />
        <Text size="small" appearance="subtle">
          {payer}
        </Text>
        <Text size="small" appearance="subtle">
          ·
        </Text>
        <Text size="small" appearance="subtle">
          {channelLabel(channel)}
        </Text>
      </div>

      {/* Status */}
      <StatusHint appearance={cfg.appearance} className="mb-3">
        {cfg.label}
      </StatusHint>

      <Text size="small" appearance="subtle" className="d-block mb-4">
        {`Ref # ${refNum}`}
      </Text>

      {/* Approved auth number */}
      {status === 'approved' && (
        <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-30)' }}>
          <Icon name="check_circle" size={14} appearance="success" />
          <Text size="small" weight="medium">{`AUTH-2025-${refNum.slice(-6)}`}</Text>
          <Text size="small" appearance="subtle">
            Authorization number
          </Text>
        </div>
      )}

      {/* Denied reason */}
      {status === 'denied' && (
        <div>
          <Text size="small" appearance="subtle" className="d-block mb-2">
            Denial Reason
          </Text>
          <Text size="small">
            Medical necessity criteria not sufficiently documented for this procedure code.
          </Text>
          <div className="d-flex mt-3" style={{ gap: 'var(--spacing-30)' }}>
            <Button size="tiny" appearance="primary">
              Request Peer-to-Peer
            </Button>
            <Button size="tiny">File Appeal</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  order: MultiCptOrder;
  statuses: DecisionStatus[];
}

// ── MultiCptDecisionPanel ─────────────────────────────────────────────────────
export default function MultiCptDecisionPanel({ order, statuses }: Props) {
  const [thinkStep, setThinkStep] = useState(0);
  const [thinkDone, setThinkDone] = useState(false);

  // Cycle through thinking steps
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    THINKING_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setThinkStep(i), i * 800));
    });
    timers.push(setTimeout(() => setThinkDone(true), THINKING_STEPS.length * 800));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!thinkDone) {
    return <AIProcessingPanel message={THINKING_STEPS[thinkStep]} />;
  }

  // ── Overall summary counts ────────────────────────────────────────────────
  const approvedCount = statuses.filter((s) => s === 'approved').length;
  const deniedCount = statuses.filter((s) => s === 'denied').length;
  const pendedCount = statuses.filter(
    (s) =>
      s === 'pended' ||
      s === 'additional_docs' ||
      s === 'contact_payer' ||
      s === 'submission_error',
  ).length;

  const summaryAppearance =
    approvedCount === order.cpts.length ? 'success' : deniedCount > 0 ? 'alert' : 'warning';

  return (
    <div className="center-panel">
      {/* Per-CPT cards */}
      {order.cpts.map((cpt, i) => (
        <CptDecisionCard
          key={cpt.cpt}
          cptCode={cpt.cpt}
          title={cpt.title}
          payer={cpt.suggestedPayer}
          channel={cpt.suggestedChannel}
          refNum={REF_PREFIXES[i] ?? `PA-2025-83649${i}`}
          status={statuses[i]}
        />
      ))}

      {/* Overall summary */}
      <Card shadow="none" className="p-5">
        <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-30)' }}>
          <StatusHint appearance={summaryAppearance}>
            {`${order.cpts.length} CPTs submitted`}
          </StatusHint>
          <Text size="small" appearance="subtle" style={{ flex: 1 }}>
            {[
              approvedCount > 0 && `${approvedCount} approved`,
              pendedCount > 0 && `${pendedCount} pending`,
              deniedCount > 0 && `${deniedCount} denied`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </div>
      </Card>
    </div>
  );
}
