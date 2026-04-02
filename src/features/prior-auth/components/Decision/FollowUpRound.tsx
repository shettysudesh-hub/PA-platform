import { useState, useEffect } from 'react';
import {
  Button,
  Badge,
  Text,
  Heading,
  Textarea,
  Message,
  Card,
  CardBody,
} from '@innovaccer/design-system';
import AIProcessingPanel from '../shared/AIProcessingPanel';
import PreviousRoundsCollapsible from './PreviousRoundsCollapsible';
import { PBM_FOLLOWUP_QUESTIONS } from '../../data/mockData';
import type { Question } from '../../data/mockData';

interface RoundRecord {
  round: number;
  label: string;
  questions: Question[];
  answers: Record<string, string>;
  submittedAt: string;
}

interface Props {
  round: number;
  previousHistory: RoundRecord[];
  onResubmit: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export default function FollowUpRound({ round, previousHistory, onResubmit, onBack }: Props) {
  const [phase, setPhase] = useState('loading');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('filling'), 2000);
    const t2 = setTimeout(() => {
      const pre: Record<string, string> = {};
      PBM_FOLLOWUP_QUESTIONS.forEach((q) => {
        if (q.ai) pre[q.id] = q.a;
      });
      setAnswers(pre);
      setPhase('done');
    }, 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === 'loading') {
    return (
      <AIProcessingPanel
        message={`PBM returned follow-up questions (Round ${round}) — retrieving...`}
      />
    );
  }
  if (phase === 'filling') {
    return <AIProcessingPanel message="AI auto-filling follow-up answers from EHR data..." />;
  }

  const allFilled = PBM_FOLLOWUP_QUESTIONS.every((q) => answers[q.id]?.trim());
  const answeredCount = PBM_FOLLOWUP_QUESTIONS.filter((q) => answers[q.id]?.trim()).length;

  return (
    <div className="center-panel">
      {/* Round header */}
      <div className="d-flex align-items-center mb-5" style={{ gap: 'var(--spacing-30)' }}>
        <Badge appearance="accent2">{`Round ${round}`}</Badge>
        <Heading size="s">Follow-Up Questions from PBM</Heading>
      </div>

      {/* Status banner — MDS Message */}
      <Message
        appearance={allFilled ? 'success' : 'warning'}
        title={
          allFilled
            ? 'Ready to Resubmit'
            : `${answeredCount} of ${PBM_FOLLOWUP_QUESTIONS.length} Answered`
        }
        description={
          allFilled
            ? 'All follow-up questions answered.'
            : 'Complete the remaining questions to resubmit.'
        }
        className="mb-5"
      />

      <PreviousRoundsCollapsible history={previousHistory} />

      {/* Questions — MDS Card + Textarea */}
      <div className="d-flex flex-column mb-5" style={{ gap: 'var(--spacing-30)' }}>
        {PBM_FOLLOWUP_QUESTIONS.map((q, i) => {
          const isAiFilled = q.ai && !!answers[q.id];
          const isEmpty = !answers[q.id]?.trim();
          return (
            <Card shadow="none" key={q.id}>
              <CardBody>
                <div
                  className="d-flex align-items-flex-start mb-3"
                  style={{ gap: 'var(--spacing-30)' }}
                >
                  <Badge appearance="accent2" subtle>{`FQ${i + 1}`}</Badge>
                  <Text weight="medium" style={{ flex: 1, lineHeight: 1.5 }}>
                    {q.q}
                  </Text>
                  {isAiFilled && (
                    <Badge appearance="accent2" subtle>
                      AI auto-filled
                    </Badge>
                  )}
                </div>
                {/* MDS Textarea */}
                <Textarea
                  value={answers[q.id] || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setAnswers({ ...answers, [q.id]: e.target.value })
                  }
                  placeholder="Enter response..."
                  rows={2}
                  error={isEmpty}
                  style={isEmpty ? { borderColor: 'var(--warning)' } : {}}
                />
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="d-flex">
        <Button
          size="tiny"
          appearance="primary"
          className="mr-5"
          disabled={!allFilled}
          onClick={() => onResubmit({ ...answers })}
        >
          Submit Follow-Up Answers
        </Button>
        <Button size="tiny" onClick={onBack}>
          Back to Status
        </Button>
      </div>
    </div>
  );
}
