import { useState, useEffect, useRef } from 'react';
import { Text, Card, Message, MetaList } from '@innovaccer/design-system';
import type { Order } from '../../data/mockData';

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  order: Order;
  onComplete: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PaRequiredCheckPanel({ order, onComplete }: Props) {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const [loadStage, setLoadStage] = useState<'checking' | 'verifying'>('checking');
  const calledRef = useRef(false);

  const payerName = order.patient.insurance.payer;

  // Staged loading → auto-advance
  useEffect(() => {
    const t1 = setTimeout(() => setLoadStage('verifying'), 1200);
    const t2 = setTimeout(() => setPhase('done'), 2500);
    const t3 = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onComplete();
      }
    }, 4000); // 2.5s loading + 1.5s to read result
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading state ─────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="center-panel">
        <Card shadow="none" className="p-5">
          <Text appearance="subtle">
            {loadStage === 'checking'
              ? `Checking prior authorization requirements with ${payerName}…`
              : 'Verifying procedure codes against payer rules…'}
          </Text>
        </Card>
      </div>
    );
  }

  // ── Result view — minimal, just the outcome ──────────────────────────────
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="center-panel">
      <Message
        appearance="success"
        description="Prior authorization is required for the requested procedure(s)"
        className="mb-4"
      />
      <MetaList
        list={[{ label: 'Checked via Availity' }, { label: payerName }, { label: today }]}
        size="regular"
        seperator
      />
    </div>
  );
}
