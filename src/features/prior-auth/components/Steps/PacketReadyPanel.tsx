import { useState, useEffect } from 'react';
import { Button, Text, Card, Message } from '@innovaccer/design-system';

type LoadState = 'collating' | 'creating' | 'ready';

interface Props {
  onReviewPacket: () => void;
}

export default function PacketReadyPanel({ onReviewPacket }: Props) {
  const [loadState, setLoadState] = useState<LoadState>('collating');

  useEffect(() => {
    // Step 1 — collating details from eligibility, questionnaire, docs (2 s)
    const t1 = setTimeout(() => {
      setLoadState('creating');

      // Step 2 — assembling the final packet (1.5 s)
      const t2 = setTimeout(() => {
        setLoadState('ready');
      }, 1500);

      return () => clearTimeout(t2);
    }, 2000);

    return () => clearTimeout(t1);
  }, []);

  if (loadState !== 'ready') {
    return (
      <Card shadow="none" className="p-5">
        <Text appearance="subtle">
          {loadState === 'collating'
            ? 'Collating details from patient records…'
            : 'Creating authorization packet…'}
        </Text>
      </Card>
    );
  }

  return (
    <div>
      <Message
        appearance="success"
        title="Authorization packet ready"
        description="All documents have been compiled and attached. Review before submitting to payer."
        className="mb-5"
      />
      <Button size="tiny" appearance="primary" onClick={onReviewPacket}>
        Review Packet →
      </Button>
    </div>
  );
}
