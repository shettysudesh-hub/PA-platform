import { Button, Text, Heading, Card, CardHeader, CardBody, Icon } from '@innovaccer/design-system';
import { SaraSparkle } from '@innovaccer/design-system';
import type { Order, Doc, MedOrder, RxOrder } from '../../data/mockData';

interface Props {
  order: Order;
  docs: Doc[];
  onSubmit: () => void;
}

export default function PacketReviewPanel({ order, docs, onSubmit }: Props) {
  const p = order.patient;
  const ins = p.insurance;

  const memberFields = [
    { label: 'Member', value: `${p.name}`, sub: `${p.dob}, ${p.gender}` },
    { label: 'Member ID', value: `${ins.memberId} ✓` },
    { label: 'Plan', value: ins.payer, sub: ins.planId },
    { label: 'Plan ID', value: ins.planId },
    { label: 'Effective date', value: 'Jan 1, 2019' },
  ];

  const serviceFields = [
    {
      label: order.type === 'medical' ? 'Procedure code' : 'Medication',
      value: order.type === 'medical' ? `${(order as MedOrder).cpt} (${order.title})` : order.title,
    },
    {
      label: 'Priority',
      value: order.urgency === 'Urgent' ? '↑ Urgent' : 'Routine',
      urgent: order.urgency === 'Urgent',
    },
    { label: 'Provider', value: order.provider || '—' },
    {
      label: 'Primary diagnosis',
      value: `${(order as MedOrder | RxOrder).icd10 ?? '—'}, ${(order as MedOrder | RxOrder).icd10Desc ?? '—'}`,
    },
    {
      label: 'Order date',
      value: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    },
  ];

  return (
    <div className="center-panel">
      {/* Header */}
      <div className="d-flex align-items-center mb-5" style={{ gap: 'var(--spacing-30)' }}>
        <SaraSparkle size={16} />
        <Heading size="s">Prior Auth Packet</Heading>
      </div>

      {/* Supporting documents */}
      <Card shadow="none" className="mb-5">
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <Text weight="strong">Supporting documents</Text>
            <span className="doc-add">+ Add new</span>
          </div>
        </CardHeader>
        <CardBody>
          <div className="q-chips">
            {docs.map((d, i) => (
              <span key={i} className="doc-chip">
                <Icon name="description" size={12} appearance="subtle" /> {d.name}
                {d.ext} ×
              </span>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Member & Plan */}
      <Card shadow="none" className="mb-5">
        <CardHeader>
          <Text weight="strong">Member and Health Plan</Text>
        </CardHeader>
        <CardBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              rowGap: 'var(--spacing-30)',
              columnGap: 'var(--spacing-80)',
            }}
          >
            {memberFields.map((f) => (
              <div key={f.label}>
                <Text size="small" appearance="subtle">
                  {f.label}
                </Text>
                <br />
                <Text weight="medium">{f.value}</Text>
                {f.sub && (
                  <>
                    <br />
                    <Text size="small" appearance="subtle">
                      {f.sub}
                    </Text>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Service details */}
      <Card shadow="none" className="mb-5">
        <CardHeader>
          <Text weight="strong">Service details</Text>
        </CardHeader>
        <CardBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              rowGap: 'var(--spacing-30)',
              columnGap: 'var(--spacing-80)',
            }}
          >
            {serviceFields.map((f) => (
              <div key={f.label}>
                <Text size="small" appearance="subtle">
                  {f.label}
                </Text>
                <br />
                <Text weight="medium" appearance={f.urgent ? 'destructive' : 'default'}>
                  {f.value}
                </Text>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="d-flex justify-content-end">
        <Button size="tiny" appearance="basic" className="mr-5">
          + Update
        </Button>
        <Button size="tiny" appearance="primary" onClick={onSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
}
