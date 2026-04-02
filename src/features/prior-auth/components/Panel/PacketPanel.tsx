import { useState, useEffect } from 'react';
import { Button, Text, Chip, Icon, Divider, Spinner, Badge } from '@innovaccer/design-system';
import type { Order, Doc, MultiCptOrder, MedOrder, RxOrder } from '../../data/mockData';

interface Props {
  open: boolean;
  order: Order;
  docs: Doc[];
  loading?: boolean;
  readOnly?: boolean;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
}

// ── Staged loading inside the panel ──────────────────────────────────────────
type LoadStage = 'collating' | 'creating';

const STAGE_MESSAGES: Record<LoadStage, string> = {
  collating: 'Collating patient data and documents…',
  creating: 'Creating prior authorization packet…',
};

function PacketLoader() {
  const [stage, setStage] = useState<LoadStage>('collating');

  useEffect(() => {
    const t = setTimeout(() => setStage('creating'), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ flex: 1, gap: 'var(--spacing-40)', padding: '48px 24px' }}
    >
      <Spinner size="medium" appearance="primary" />
      <div style={{ textAlign: 'center' }}>
        <Text weight="medium" className="d-block mb-2">
          {STAGE_MESSAGES[stage]}
        </Text>
        <Text size="small" appearance="subtle">
          Preparing your prior auth packet
        </Text>
      </div>
    </div>
  );
}

// ── PacketPanel ───────────────────────────────────────────────────────────────
export default function PacketPanel({
  open,
  order,
  docs,
  loading = false,
  readOnly = false,
  submitLabel,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  const p = order.patient;
  const ins = p.insurance;
  const isMulti = order.type === 'medical_multi';

  const memberFields = [
    { label: 'Member', value: p.name, sub: `${p.dob}${p.gender ? `, ${p.gender}` : ''}` },
    { label: 'Member ID', value: ins.memberId, verified: true },
    { label: 'Plan', value: ins.payer, sub: ins.planId },
    { label: 'Plan type', value: ins.planType },
    { label: 'Effective date', value: 'Jan 1, 2019' },
  ];

  // Single-CPT service fields (Rx or single Medical)
  const serviceFields = [
    {
      label: order.type === 'medical' ? 'Procedure code' : 'Medication',
      value: order.type === 'medical' ? `${(order as MedOrder).cpt} (${order.title})` : order.title,
    },
    {
      label: 'Priority',
      value: order.urgency === 'Urgent' ? 'Urgent' : 'Routine',
      urgent: order.urgency === 'Urgent',
    },
    { label: 'Provider', value: order.provider || '—' },
    {
      label: 'Primary diagnosis',
      value: `${(order as MedOrder | RxOrder).icd10} · ${(order as MedOrder | RxOrder).icd10Desc}`,
    },
    {
      label: 'Order date',
      value: new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
    },
  ];

  return (
    <div className="packet-panel">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="panel-header">
        <Text weight="strong">Prior Auth Packet</Text>
        <Button
          appearance="transparent"
          icon="close"
          onClick={onClose}
          aria-label="Close packet panel"
        />
      </div>

      {/* ── Body: loading or content ─────────────────────────────────────── */}
      {loading ? (
        <PacketLoader />
      ) : (
        <div className="panel-body">
          {/* Supporting Documents */}
          <div className="packet-section">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Text weight="strong">Supporting Documents</Text>
              <Button appearance="transparent" size="tiny" icon="file_download" />
            </div>
            <div className="d-flex flex-wrap" style={{ gap: 'var(--spacing-20)' }}>
              {docs.map((d, i) => (
                <Chip
                  key={i}
                  label={`${d.name}${d.ext}`}
                  icon="description"
                  name={`pdoc-${i}`}
                  type="selection"
                  clearButton
                  onClose={() => {}}
                />
              ))}
            </div>
          </div>

          <Divider className="my-5" />

          {/* Member and Health Plan */}
          <div className="packet-section">
            <Text weight="strong" className="d-block mb-4">
              Member and Health Plan
            </Text>
            <div className="packet-fields">
              {memberFields.map((f) => (
                <div className="packet-field" key={f.label}>
                  <Text size="small" appearance="subtle" className="packet-field-key">
                    {f.label}
                  </Text>
                  <div className="packet-field-val">
                    <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-10)' }}>
                      <Text size="small">{f.value}</Text>
                      {f.verified && <Icon name="check_circle" size={14} appearance="success" />}
                    </div>
                    {f.sub && (
                      <Text size="small" appearance="subtle" className="d-block">
                        {f.sub}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider className="my-5" />

          {/* Service Details */}
          <div className="packet-section">
            <Text weight="strong" className="d-block mb-4">
              Service Details
            </Text>

            {isMulti ? (
              /* Multi-CPT: one block per CPT */
              (order as MultiCptOrder).cpts.map((cpt, idx) => (
                <div key={cpt.cpt}>
                  {idx > 0 && <Divider className="my-4" />}
                  <div
                    className="d-flex align-items-center mb-3"
                    style={{ gap: 'var(--spacing-20)' }}
                  >
                    <Badge appearance="primary" subtle>{`CPT ${cpt.cpt}`}</Badge>
                    <Text size="small" weight="medium">
                      {cpt.title}
                    </Text>
                  </div>
                  <div className="packet-fields">
                    {[
                      { label: 'Diagnosis', value: `${cpt.icd10} · ${cpt.icd10Desc}` },
                      { label: 'Facility', value: cpt.facility },
                      { label: 'Provider', value: order.provider || '—' },
                      {
                        label: 'Priority',
                        value: order.urgency === 'Urgent' ? 'Urgent' : 'Routine',
                        urgent: order.urgency === 'Urgent',
                      },
                    ].map((f) => (
                      <div className="packet-field" key={f.label}>
                        <Text size="small" appearance="subtle" className="packet-field-key">
                          {f.label}
                        </Text>
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: 'var(--spacing-10)' }}
                        >
                          {(f as { urgent?: boolean }).urgent && (
                            <Icon name="north" size={14} appearance="destructive" />
                          )}
                          <Text
                            size="small"
                            appearance={
                              (f as { urgent?: boolean }).urgent ? 'destructive' : 'default'
                            }
                            className="packet-field-val"
                          >
                            {f.value}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              /* Single CPT / Rx */
              <div className="packet-fields">
                {serviceFields.map((f) => (
                  <div className="packet-field" key={f.label}>
                    <Text size="small" appearance="subtle" className="packet-field-key">
                      {f.label}
                    </Text>
                    <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-10)' }}>
                      {(f as { urgent?: boolean }).urgent && (
                        <Icon name="north" size={14} appearance="destructive" />
                      )}
                      <Text
                        size="small"
                        appearance={(f as { urgent?: boolean }).urgent ? 'destructive' : 'default'}
                        className="packet-field-val"
                      >
                        {f.value}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="panel-footer">
        <Button size="tiny" onClick={onClose}>
          Close
        </Button>
        {!readOnly && (
          <Button size="tiny" appearance="primary" disabled={loading} onClick={onSubmit}>
            {submitLabel ?? 'Submit to Payer'}
          </Button>
        )}
      </div>
    </div>
  );
}
