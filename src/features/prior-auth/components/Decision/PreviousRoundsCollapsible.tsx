import { useState } from 'react';
import { Button, Badge, Text } from '@innovaccer/design-system';
import type { Question } from '../../data/mockData';

interface RoundRecord {
  round: number;
  label: string;
  questions: Question[];
  answers: Record<string, string>;
  submittedAt: string;
}

interface Props {
  history: RoundRecord[];
}

export default function PreviousRoundsCollapsible({ history }: Props) {
  const [open, setOpen] = useState(false);
  if (!history || history.length === 0) return null;
  const totalQ = history.reduce((sum, r) => sum + r.questions.length, 0);

  return (
    <div className="prev-rounds mb-5">
      <div className="d-flex align-items-center justify-content-between">
        <Button appearance="transparent" size="tiny" onClick={() => setOpen(!open)}>
          {`Previously Submitted: ${history.length} round${history.length > 1 ? 's' : ''}, ${totalQ} questions ${open ? '▴' : '▾'}`}
        </Button>
      </div>
      {open && (
        <div className="prev-rounds-body">
          {history.map((round, ri) => (
            <div key={ri} className="prev-round-block">
              <div
                className="prev-round-head d-flex align-items-center mb-3"
                style={{ gap: 'var(--spacing-30)' }}
              >
                <Badge appearance="secondary">{round.label}</Badge>
                <Text size="small" appearance="subtle">
                  Submitted {round.submittedAt}
                </Text>
              </div>
              {round.questions.map((q, qi) => (
                <div key={q.id} className="prev-qa">
                  <div
                    className="prev-q d-flex align-items-center"
                    style={{ gap: 'var(--spacing-20)' }}
                  >
                    <Badge appearance="secondary" subtle>
                      Q{qi + 1}
                    </Badge>
                    <Text size="small" style={{ flex: 1 }}>
                      {q.q}
                    </Text>
                  </div>
                  <div className="prev-a">
                    <Text size="small" appearance="subtle">
                      {round.answers[q.id] || '—'}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
