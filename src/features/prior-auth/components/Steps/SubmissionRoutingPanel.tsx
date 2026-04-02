import { useState, useEffect } from 'react';
import { Button, Text, Card, Input, Select, Divider, Icon } from '@innovaccer/design-system';
import AIProcessingPanel from '../shared/AIProcessingPanel';
import type { MultiCptOrder } from '../../data/mockData';

// ── AI thinking messages ──────────────────────────────────────────────────────
const THINKING_STEPS = [
  'Analyzing payer routing for 3 CPT codes...',
  'CPT 74178 CT Abdomen → UHC accepts electronic (Availity)',
  'CPT 71260 CT Chest → UHC accepts electronic (Availity)',
  'CPT 70553 MRI Brain → Carved out to NeuroCarve Inc.',
  'NeuroCarve does not support electronic — fax required',
  'Routing suggestions ready',
];

// ── Payer and channel options ─────────────────────────────────────────────────
const PAYER_OPTIONS = [
  { label: 'UHC', value: 'UHC' },
  { label: 'NeuroCarve Inc.', value: 'NeuroCarve Inc.' },
  { label: 'Aetna', value: 'Aetna' },
  { label: 'Cigna', value: 'Cigna' },
];

const CHANNEL_OPTIONS = [
  { label: 'Electronic (Availity)', value: 'electronic' },
  { label: 'Fax', value: 'fax' },
];

// ── Row state type ────────────────────────────────────────────────────────────
interface RoutingRow {
  cpt: string;
  title: string;
  payer: string;
  channel: 'electronic' | 'fax';
  faxNumber: string;
}

function isRowReady(row: RoutingRow) {
  if (!row.payer || !row.channel) return false;
  if (row.channel === 'fax' && !row.faxNumber.trim()) return false;
  return true;
}

// ── Single routing row ────────────────────────────────────────────────────────
function RoutingRowContent({
  row,
  onChange,
}: {
  row: RoutingRow;
  onChange: (updated: RoutingRow) => void;
}) {
  return (
    <div className="d-flex flex-column" style={{ gap: 'var(--spacing-20)' }}>
      {/* CPT label + title */}
      <div>
        <Text size="small" weight="strong" className="d-block">
          {`CPT ${row.cpt}`}
        </Text>
        <Text size="small" appearance="subtle">
          {row.title}
        </Text>
      </div>

      {/* Dropdowns row */}
      <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-40)' }}>
        <Select
          value={{ label: row.payer, value: row.payer }}
          onSelect={(opt: { label: string; value: string }) =>
            onChange({ ...row, payer: opt.value })
          }
          width={186}
          styleType="outlined"
          triggerOptions={{
            triggerSize: 'small',
            inlineLabel: 'Select payer',
            placeholder: row.payer || 'Select',
          }}
        >
          <Select.List>
            {PAYER_OPTIONS.map((opt) => (
              <Select.Option key={opt.value} option={opt}>
                {opt.label}
              </Select.Option>
            ))}
          </Select.List>
        </Select>

        <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-20)' }}>
          <Select
            value={{
              label: row.channel === 'electronic' ? 'Electronic (Availity)' : 'Fax',
              value: row.channel,
            }}
            onSelect={(opt: { label: string; value: string }) =>
              onChange({ ...row, channel: opt.value as 'electronic' | 'fax' })
            }
            width={186}
            styleType="outlined"
            triggerOptions={{
              triggerSize: 'small',
              inlineLabel: 'Select Channel',
              placeholder: row.channel === 'electronic' ? 'Electronic' : 'Fax',
            }}
          >
            <Select.List>
              {CHANNEL_OPTIONS.map((opt) => (
                <Select.Option key={opt.value} option={opt}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select.List>
          </Select>

          {row.channel === 'fax' && (
            <Input
              size="tiny"
              placeholder="Add Fax number"
              value={row.faxNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...row, faxNumber: e.target.value })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  order: MultiCptOrder;
  onSubmit: () => void;
}

// ── SubmissionRoutingPanel ────────────────────────────────────────────────────
export default function SubmissionRoutingPanel({ order, onSubmit }: Props) {
  const [thinkStep, setThinkStep] = useState(0);
  const [thinkDone, setThinkDone] = useState(false);
  const [rows, setRows] = useState<RoutingRow[]>(
    order.cpts.map((c) => ({
      cpt: c.cpt,
      title: c.title,
      payer: c.suggestedPayer,
      channel: c.suggestedChannel,
      faxNumber: c.faxNumber ?? '',
    })),
  );

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    THINKING_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setThinkStep(i), i * 700));
    });
    timers.push(setTimeout(() => setThinkDone(true), THINKING_STEPS.length * 700));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!thinkDone) {
    return <AIProcessingPanel message={THINKING_STEPS[thinkStep]} />;
  }

  const allReady = rows.every(isRowReady);
  const electronicCount = rows.filter((r) => r.channel === 'electronic').length;
  const faxCount = rows.filter((r) => r.channel === 'fax').length;
  const uniquePayers = [...new Set(rows.map((r) => r.payer))];

  const updateRow = (index: number, updated: RoutingRow) => {
    setRows((prev) => prev.map((r, i) => (i === index ? updated : r)));
  };

  return (
    <div className="center-panel">
      {/* Header */}
      <div className="d-flex align-items-center mb-5" style={{ gap: 8 }}>
        <Icon name="route" size={16} appearance="primary" />
        <Text weight="medium">AI-suggested routing — review and confirm</Text>
      </div>

      {/* Single card — all CPTs separated by dividers */}
      <Card shadow="none" className="mb-6 p-5">
        {rows.map((row, i) => (
          <div key={row.cpt}>
            {i > 0 && <Divider className="my-5" />}
            <RoutingRowContent row={row} onChange={(updated) => updateRow(i, updated)} />
          </div>
        ))}
      </Card>

      {/* Submit + Summary */}
      <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-40)' }}>
        <Button size="tiny" appearance="primary" disabled={!allReady} onClick={onSubmit}>
          {`Submit All (${order.cpts.length} CPTs)`}
        </Button>
        <Text size="small" appearance="subtle">
          {`${electronicCount} electronic · ${faxCount} fax · ${uniquePayers.join(', ')}`}
        </Text>
      </div>
    </div>
  );
}
