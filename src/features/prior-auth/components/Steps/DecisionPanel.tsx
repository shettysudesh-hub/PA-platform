import { useState } from 'react';
import {
  Button,
  Text,
  Card,
  StatusHint,
  LinkButton,
  Icon,
  Message,
  Chip,
  MetaList,
} from '@innovaccer/design-system';
import QuestionnairePanel from './QuestionnairePanel';
import { PBM_FOLLOWUP_QUESTIONS } from '../../data/mockData';
import type { Question } from '../../data/mockData';

interface RoundRecord {
  round: number;
  label: string;
  questions: Question[];
  answers: Record<string, string>;
  submittedAt: string;
}

type DecisionStatus =
  | 'pended'
  | 'approved'
  | 'denied'
  | 'additional_docs'
  | 'additional_questions'
  | 'contact_payer'
  | 'submission_error';

interface Props {
  type: 'prescription' | 'medical';
  status: DecisionStatus;
  onSimulate: (outcome: string) => void;
  submissionHistory: RoundRecord[];
  onRecordFollowUp?: (round: RoundRecord) => void;
  onViewPacket?: () => void;
  onResubmitDocs?: (docs: string[]) => void;
}

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  DecisionStatus,
  {
    appearance: 'default' | 'success' | 'warning' | 'alert' | 'info';
    label: string;
  }
> = {
  pended: { appearance: 'warning', label: 'Submitted' },
  approved: { appearance: 'success', label: 'Authorization Approved' },
  denied: { appearance: 'alert', label: 'Authorization Denied' },
  additional_docs: { appearance: 'warning', label: 'Payer action required' },
  additional_questions: { appearance: 'warning', label: 'Payer action required' },
  contact_payer: { appearance: 'warning', label: 'Payer Contact Required' },
  submission_error: { appearance: 'alert', label: 'Submission Error' },
};

const REF_NUMBER = 'PA-2025-836491';
const AUTH_NUMBER = 'AUTH-2025-174832';
const TOTAL_DOCS = 7;

// ── Copy to clipboard helper ───────────────────────────────────────────────────
function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <span
      className="d-inline-flex align-items-center"
      style={{ gap: 'var(--spacing-10)', cursor: 'pointer' }}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Click to copy'}
    >
      <Text weight="strong">{value}</Text>
      <Icon
        name={copied ? 'check' : 'content_copy'}
        size={14}
        appearance={copied ? 'success' : 'subtle'}
      />
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function DecisionPanel({
  type,
  status,
  onSimulate,
  submissionHistory,
  onRecordFollowUp,
  onViewPacket,
  onResubmitDocs,
}: Props) {
  const [resubmitCount, setResubmitCount] = useState(0);
  const [attachedDocs, setAttachedDocs] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  );

  // ── Follow-up questionnaire state ─────────────────────────────────────────
  type FollowUpState = 'idle' | 'answering' | 'submitted';
  const [followUpState, setFollowUpState] = useState<FollowUpState>('idle');
  const [followUpMounted, setFollowUpMounted] = useState(false);
  const [followUpSubmittedAt, setFollowUpSubmittedAt] = useState('');
  const [showFollowUpAnswers, setShowFollowUpAnswers] = useState(false);

  const handleCheckStatus = () => {
    setIsChecking(true);
    setTimeout(() => {
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsChecking(false);
    }, 1500);
  };

  const cfg = STATUS_CONFIG[status];
  const statusLabel =
    status === 'pended' && resubmitCount > 0
      ? `Submitted · Resubmitted (Round ${resubmitCount})`
      : cfg.label;

  // Doc receipt logic per state
  const isSubmissionError = status === 'submission_error';
  const docsReceived = isSubmissionError ? 0 : TOTAL_DOCS;
  const allDocsReceived = docsReceived === TOTAL_DOCS && !isSubmissionError;

  // Sub-text for doc row
  const docSubText = isSubmissionError
    ? 'A transmission error occurred. Your packet is intact — retry to send.'
    : 'All documents have been received by payer';

  return (
    <div className="center-panel">
      {/* ═══════════════════════════════════════════════════════════════════
          1. AUTHORISATION DETAILS
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <Text weight="strong" className="d-block mb-2">
          Authorisation Details
        </Text>
        <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-30)' }}>
          <MetaList list={[{ label: 'Reference #' }]} size="regular" />
          <CopyableValue value={REF_NUMBER} />
        </div>
        {status === 'approved' && (
          <div className="d-flex align-items-center mt-2" style={{ gap: 'var(--spacing-30)' }}>
            <MetaList list={[{ label: 'Auth #' }]} size="regular" />
            <CopyableValue value={AUTH_NUMBER} />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2. DOCUMENT RECEIPT ROW
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="d-flex align-items-start justify-content-between mb-6">
        <div style={{ flex: 1 }}>
          <div className="d-flex align-items-center mb-1" style={{ gap: 'var(--spacing-20)' }}>
            <Icon
              name={isSubmissionError ? 'error' : allDocsReceived ? 'check_circle' : 'warning'}
              size={16}
              appearance={isSubmissionError ? 'alert' : allDocsReceived ? 'success' : 'warning'}
            />
            <Text weight="strong">
              {isSubmissionError
                ? 'Submission failed — documents not delivered'
                : `${TOTAL_DOCS} documents received by payer`}
            </Text>
          </div>
          <Text size="small" appearance="subtle">
            {docSubText}
          </Text>
        </div>
        {onViewPacket && (
          <LinkButton size="tiny" icon="description" iconAlign="left" onClick={onViewPacket}>
            View packet
          </LinkButton>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          3. STATUS SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <Text weight="strong" className="d-block mb-2">
          Status
        </Text>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-30)' }}>
            <StatusHint appearance={cfg.appearance}>{statusLabel}</StatusHint>
            <MetaList list={[{ label: `Last updated ${lastChecked}` }]} size="regular" seperator />
          </div>
          <LinkButton
            size="tiny"
            disabled={isChecking}
            onClick={handleCheckStatus}
            icon="sync"
            iconAlign="left"
          >
            {isChecking ? 'Checking…' : 'Check latest status'}
          </LinkButton>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          4. STATE-SPECIFIC CONTENT
          ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Denied ─────────────────────────────────────────────────────── */}
      {status === 'denied' && (
        <>
          <Card shadow="none" className="mb-5 p-5">
            <Message
              appearance="alert"
              title="Authorization denied"
              description="Step therapy requirements not met. Patient must try and fail at least two formulary alternatives before this medication is covered."
              className="mb-4"
            />
            <div className="d-flex" style={{ gap: 'var(--spacing-30)' }}>
              <Button size="tiny" appearance="primary">
                Request Peer-to-Peer
              </Button>
              <Button size="tiny">File Appeal</Button>
            </div>
          </Card>
        </>
      )}

      {/* ── Additional docs (payer requests more) ─────────────────────── */}
      {status === 'additional_docs' && (
        <>
          <Card shadow="none" className="p-5 mb-5">
            <Message
              appearance="warning"
              title="More information needed"
              description={
                type === 'prescription'
                  ? "The request was submitted, but supporting documents couldn't be sent. Please submit again."
                  : "The request was submitted, but supporting documents couldn't be sent. Please submit again."
              }
              className="mb-4"
            />
            <div
              className="d-flex align-items-center flex-wrap"
              style={{ gap: 'var(--spacing-20)' }}
            >
              {attachedDocs.map((doc, i) => (
                <Chip
                  key={i}
                  label={doc}
                  name={`attached-${i}`}
                  type="selection"
                  icon="description"
                  clearButton
                  onClose={() => setAttachedDocs((p) => p.filter((_, idx) => idx !== i))}
                  selected
                />
              ))}
              <LinkButton
                size="tiny"
                icon="add"
                iconAlign="left"
                onClick={() => setAttachedDocs((p) => [...p, `Document_${p.length + 1}.pdf`])}
              >
                Add
              </LinkButton>
            </div>
          </Card>
          {attachedDocs.length > 0 && (
            <Button
              size="tiny"
              appearance="primary"
              className="mb-5"
              onClick={() => {
                onResubmitDocs?.([...attachedDocs]);
                setResubmitCount((c) => c + 1);
                onSimulate('pended_resubmit');
                setAttachedDocs([]);
              }}
            >
              Submit to payer
            </Button>
          )}
        </>
      )}

      {/* ── Additional questions (Rx flow) ────────────────────────────── */}
      {(status === 'additional_questions' || followUpState !== 'idle') && (
        <>
          <Card shadow="none" className="mb-5 p-5">
            {followUpState === 'idle' && (
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <Text weight="medium" className="d-block mb-2">
                    Follow-up questions required
                  </Text>
                  <Text size="small" appearance="subtle">
                    {PBM_FOLLOWUP_QUESTIONS.length} questions · AI will pre-fill from EHR
                  </Text>
                </div>
                <Button
                  size="tiny"
                  appearance="primary"
                  onClick={() => {
                    setFollowUpMounted(true);
                    setFollowUpState('answering');
                  }}
                >
                  Answer Questions
                </Button>
              </div>
            )}

            {followUpState === 'answering' && (
              <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-30)' }}>
                <Text weight="medium">Answering follow-up questions</Text>
                <Text size="small" appearance="subtle">
                  · {PBM_FOLLOWUP_QUESTIONS.length} questions
                </Text>
              </div>
            )}

            {followUpState === 'submitted' && (
              <div className="d-flex align-items-center" style={{ gap: 'var(--spacing-30)' }}>
                <Icon name="check_circle" size={16} appearance="success" />
                <Text weight="medium">Follow-up answers submitted</Text>
                <Text size="small" appearance="subtle" style={{ flex: 1 }}>
                  · {followUpSubmittedAt}
                </Text>
                <LinkButton size="tiny" subtle onClick={() => setShowFollowUpAnswers((p) => !p)}>
                  {showFollowUpAnswers ? 'Hide answers' : 'View answers'}
                </LinkButton>
              </div>
            )}
          </Card>

          {followUpMounted && (
            <div
              style={{
                display:
                  followUpState === 'idle' ||
                  (followUpState === 'submitted' && !showFollowUpAnswers)
                    ? 'none'
                    : 'block',
              }}
            >
              <QuestionnairePanel
                questions={PBM_FOLLOWUP_QUESTIONS}
                submitted={followUpState === 'submitted'}
                submitLabel="Submit"
                onSubmit={(answers) => {
                  const time = new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  onRecordFollowUp?.({
                    round: (submissionHistory?.length || 0) + 1,
                    label: `Follow-Up Round ${resubmitCount + 1}`,
                    questions: PBM_FOLLOWUP_QUESTIONS,
                    answers,
                    submittedAt: time,
                  });
                  setFollowUpSubmittedAt(time);
                  setResubmitCount((c) => c + 1);
                  setFollowUpState('submitted');
                  onSimulate('pended_resubmit');
                }}
              />
            </div>
          )}
        </>
      )}

      {/* ── Contact payer ─────────────────────────────────────────────── */}
      {status === 'contact_payer' && (
        <Card shadow="none" className="mb-5 p-5">
          <div className="mb-4" style={{ textAlign: 'center' }}>
            <Text size="small" appearance="subtle" className="d-block mb-2">
              Utilization Management
            </Text>
            <div className="ct-phone-number">1-800-008-900</div>
            <Text size="small" appearance="subtle">
              Case ID: #636497Y7
            </Text>
          </div>
          <Text size="small" appearance="subtle" className="d-block mb-4">
            Call the number above and reference the case ID. After speaking with the payer, resubmit
            to continue.
          </Text>
          <div className="d-flex" style={{ gap: 'var(--spacing-40)' }}>
            <Button
              size="tiny"
              appearance="primary"
              onClick={() => {
                setResubmitCount((c) => c + 1);
                onSimulate('pended_resubmit');
              }}
            >
              Mark Contacted &amp; Resubmit
            </Button>
            <Button size="tiny" onClick={() => onSimulate('pended_resubmit')}>
              Mark as Contacted
            </Button>
          </div>
        </Card>
      )}

      {/* ── Submission error — simple retry ──────────────────────────── */}
      {status === 'submission_error' && (
        <Button
          size="tiny"
          appearance="primary"
          icon="sync"
          iconAlign="left"
          onClick={() => onSimulate('pended_resubmit')}
        >
          Retry Submission
        </Button>
      )}
    </div>
  );
}
