import { useState } from 'react';
import { Text, Badge, Card, CardBody } from '@innovaccer/design-system';
import { SaraSparkle } from '@innovaccer/design-system';
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

export default function SubmissionHistoryView({ history }: Props) {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  if (!history || history.length === 0) return null;

  return (
    <Card shadow="none" className="mb-5">
      <CardBody>
        <Text
          weight="strong"
          size="small"
          appearance="subtle"
          style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
          className="mb-4 d-block"
        >
          Submission History — {history.length} Round{history.length > 1 ? 's' : ''}
        </Text>
        {history.map((round, ri) => (
          <div key={ri} className="sh-round">
            <div
              className="sh-round-header"
              onClick={() => setExpandedRound(expandedRound === ri ? null : ri)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="sh-round-left d-flex align-items-center"
                style={{ gap: 'var(--spacing-30)' }}
              >
                <Badge appearance="primary">{round.label}</Badge>
                <Text size="small" appearance="subtle">
                  {round.questions.length} questions · {round.submittedAt}
                </Text>
              </div>
              <span className={`prev-chevron ${expandedRound === ri ? 'open' : ''}`}>▾</span>
            </div>
            {expandedRound === ri && (
              <div className="sh-round-body">
                {round.questions.map((q, qi) => (
                  <div key={q.id} className="prev-qa">
                    <div
                      className="prev-q d-flex align-items-center"
                      style={{ gap: 'var(--spacing-20)' }}
                    >
                      <Badge appearance="secondary" subtle>
                        {round.round > 1 ? 'FQ' : 'Q'}
                        {qi + 1}
                      </Badge>
                      <Text size="small" style={{ flex: 1 }}>
                        {q.q}
                      </Text>
                      {q.ai && (
                        <span
                          className="d-flex align-items-center"
                          style={{ gap: 'var(--spacing-10)' }}
                        >
                          <SaraSparkle size={12} />
                          <Text size="small" appearance="subtle">
                            AI
                          </Text>
                        </span>
                      )}
                    </div>
                    <div className="prev-a">
                      <Text size="small" appearance="subtle">
                        {round.answers[q.id] || '—'}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
