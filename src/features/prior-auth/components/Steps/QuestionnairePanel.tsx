import { useState, useEffect } from 'react';
import {
  Button,
  Text,
  Textarea,
  Card,
  Divider,
  Label,
  Radio,
  Checkbox,
  Input,
  Dropdown,
  FileUploader,
  Chip,
  Icon,
} from '@innovaccer/design-system';
import AIProcessingPanel from '../shared/AIProcessingPanel';

// ── Single sparkle — the 16×16 one-star SVG from MDS ─────────────────────────
function SingleSparkle({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient
          id="sg1"
          x1="3.4375"
          y1="2.4375"
          x2="12.4063"
          y2="13"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E81F76" stopOpacity="0.8" />
          <stop offset="1" stopColor="#EB5324" />
        </linearGradient>
        <linearGradient
          id="sg2"
          x1="9.3125"
          y1="10.8438"
          x2="12.5937"
          y2="15.6563"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC208" stopOpacity="0" />
          <stop offset="1" stopColor="#FFC208" />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 8C4.86599 8 8 4.86599 8 1C8 4.86599 11.134 8 15 8C11.134 8 8 11.134 8 15C8 11.134 4.86599 8 1 8Z"
        fill="url(#sg1)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 8C4.86599 8 8 4.86599 8 1C8 4.86599 11.134 8 15 8C11.134 8 8 11.134 8 15C8 11.134 4.86599 8 1 8Z"
        fill="url(#sg2)"
        fillOpacity="0.24"
      />
    </svg>
  );
}

// ── AI pre-filled badge — gradient border, no fill, single sparkle ────────────
function AIFilledBadge() {
  return (
    <div
      className="d-flex align-items-center"
      style={{
        gap: 4,
        background:
          'linear-gradient(var(--white), var(--white)) padding-box, linear-gradient(274deg, #E81F76, #EB5324) border-box',
        border: '1.5px solid transparent',
        borderRadius: 'var(--border-radius-30)',
        padding: 'var(--spacing-05) var(--spacing-20)',
        width: 'fit-content',
        flexShrink: 0,
      }}
    >
      <SingleSparkle size={12} />
      <Text
        size="small"
        style={{
          fontWeight: 600,
          fontSize: 'var(--font-size-s)',
          lineHeight: 'var(--font-height-s)',
        }}
      >
        Pre-filled with AI
      </Text>
    </div>
  );
}
import { RX_DOCS } from '../../data/mockData';
import type { Question } from '../../data/mockData';

interface RoundRecord {
  round: number;
  label: string;
  questions: Question[];
  answers: Record<string, string>;
  submittedAt: string;
}

interface Props {
  questions: Question[];
  submitted?: boolean;
  submitLabel?: string;
  onSubmit: (answers: Record<string, string>) => void;
  onRecordRound?: (round: RoundRecord) => void;
}

// ── Loading state type ────────────────────────────────────────────────────────
type LoadState = 'fetching' | 'filling' | 'ready';

// ── Read-only answer display ──────────────────────────────────────────────────
function ReadOnlyAnswer({ q, answer }: { q: Question; answer: string }) {
  if (!answer) {
    return (
      <Text appearance="subtle" size="small">
        —
      </Text>
    );
  }

  if (q.type === 'dropdown' && q.subFields) {
    const parts = answer.split('|');
    return (
      <div className="d-flex flex-column" style={{ gap: 'var(--spacing-20)' }}>
        {q.subFields.map((sf, i) => (
          <div key={i} className="d-flex align-items-center" style={{ gap: 'var(--spacing-30)' }}>
            <Text size="small" appearance="subtle" style={{ minWidth: 80 }}>
              {sf.label}
            </Text>
            <Text size="small" weight="medium">
              {parts[i]?.trim() || '—'}
            </Text>
          </div>
        ))}
      </div>
    );
  }

  if (q.type === 'checkbox') {
    const items = answer
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <div className="d-flex flex-wrap" style={{ gap: 'var(--spacing-20)' }}>
        {items.map((item) => (
          <Chip key={item} label={item} name={item} type="selection" selected />
        ))}
      </div>
    );
  }

  return (
    <Text size="small" weight="medium">
      {answer}
    </Text>
  );
}

export default function QuestionnairePanel({
  questions,
  submitted = false,
  submitLabel = 'Review Packet',
  onSubmit,
  onRecordRound,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadState, setLoadState] = useState<LoadState>('fetching');
  const [notes, setNotes] = useState('');

  const aiCount = questions.filter((q) => q.ai).length;
  const totalCount = questions.length;

  useEffect(() => {
    // Step 1 — simulate PBM round-trip to fetch questions (2.5 s)
    const t1 = setTimeout(() => {
      setLoadState('filling');

      // Step 2 — simulate AI scanning EHR and pre-filling answers (2 s)
      const t2 = setTimeout(() => {
        const pre: Record<string, string> = {};
        questions.forEach((q) => {
          if (q.ai) pre[q.id] = q.a;
        });
        setAnswers(pre);
        setLoadState('ready');
      }, 2000);

      return () => clearTimeout(t2);
    }, 2500);

    return () => clearTimeout(t1);
  }, []);

  // ── Interim loading states ────────────────────────────────────────────────
  if (loadState === 'fetching') {
    return (
      <div className="center-panel">
        <Card shadow="none" className="p-5">
          <Text appearance="subtle">Fetching questionnaire from payer…</Text>
        </Card>
      </div>
    );
  }
  if (loadState === 'filling') {
    return <AIProcessingPanel message="Auto-filling questionnaire from EHR data…" />;
  }

  // ── Submitted / read-only state ───────────────────────────────────────────
  if (submitted) {
    return (
      <div className="center-panel">
        {/* Submitted banner */}
        <div className="d-flex align-items-center mb-5" style={{ gap: 'var(--spacing-30)' }}>
          <Icon name="check_circle" size={16} appearance="success" />
          <Text size="small" appearance="subtle">
            Submitted to PBM · {totalCount} questions · {aiCount} AI-filled
          </Text>
        </div>

        {/* Read-only questions */}
        <Card shadow="none" className="mb-5 p-5">
          {questions.map((q, i) => {
            const isAiFilled = q.ai && !!answers[q.id];
            return (
              <div key={q.id}>
                {i > 0 && <Divider className="my-6" />}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <Text size="small" appearance="subtle">{`Question ${i + 1}`}</Text>
                  {isAiFilled && <AIFilledBadge />}
                </div>
                <Text weight="medium" className="mb-3 d-block">
                  {q.q}
                </Text>
                <ReadOnlyAnswer q={q} answer={answers[q.id] || ''} />
              </div>
            );
          })}
        </Card>

        {/* Read-only Additional Information */}
        {notes && (
          <Card shadow="none" className="mb-5 p-5">
            <Text weight="medium" className="mb-4 d-block">
              Additional Information
            </Text>
            <Text size="small" appearance="subtle" className="d-block mb-2">
              Notes
            </Text>
            <Text size="small">{notes}</Text>
          </Card>
        )}

        {RX_DOCS.length > 0 && (
          <Card shadow="none" className="mb-5 p-5">
            {!notes && (
              <Text weight="medium" className="mb-4 d-block">
                Additional Information
              </Text>
            )}
            <Text size="small" appearance="subtle" className="d-block mb-3">
              Attachments
            </Text>
            <div className="d-flex flex-wrap" style={{ gap: 'var(--spacing-30)' }}>
              {RX_DOCS.map((d, i) => (
                <Chip
                  key={i}
                  label={`${d.name}${d.ext}`}
                  icon="description"
                  name={`doc-${i}`}
                  type="selection"
                />
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ── Editable state ────────────────────────────────────────────────────────

  const updateAnswer = (qId: string, val: string) =>
    setAnswers((prev) => ({ ...prev, [qId]: val }));

  const isFilledForQ = (q: Question) => {
    if (q.type === 'dropdown' && q.subFields) {
      const parts = (answers[q.id] || '').split('|');
      return q.subFields.every((_, i) => parts[i]?.trim());
    }
    return !!answers[q.id]?.trim();
  };

  const allFilled = questions.every(isFilledForQ);

  const renderInput = (q: Question) => {
    switch (q.type) {
      case 'radio':
        return (
          <div className="d-flex flex-column" style={{ gap: 'var(--spacing-30)' }}>
            {q.options?.map((opt) => (
              <Radio
                key={opt}
                name={q.id}
                value={opt}
                label={opt}
                checked={answers[q.id] === opt}
                onChange={() => updateAnswer(q.id, opt)}
              />
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="d-flex flex-column" style={{ gap: 'var(--spacing-30)' }}>
            {q.options?.map((opt) => {
              const selected = (answers[q.id] || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              return (
                <Checkbox
                  key={opt}
                  name={`${q.id}-${opt}`}
                  value={opt}
                  label={opt}
                  checked={selected.includes(opt)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const current = (answers[q.id] || '')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    const updated = e.target.checked
                      ? [...current, opt]
                      : current.filter((s) => s !== opt);
                    updateAnswer(q.id, updated.join(','));
                  }}
                />
              );
            })}
          </div>
        );

      case 'input':
        return (
          <Input
            value={answers[q.id] || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateAnswer(q.id, e.target.value)
            }
            placeholder="Enter value..."
            error={!answers[q.id]?.trim()}
          />
        );

      case 'dropdown':
        return (
          <div className="d-flex flex-column" style={{ gap: 'var(--spacing-30)' }}>
            {q.subFields?.map((sf, idx) => {
              const parts = (answers[q.id] || '').split('|');
              const currentVal = parts[idx]?.trim() || '';
              const opts = sf.options.map((o) => ({ label: o, value: o }));
              const selectedOpt = currentVal ? [{ label: currentVal, value: currentVal }] : [];
              return (
                <div key={idx}>
                  <Label withInput>{sf.label}</Label>
                  <Dropdown
                    options={opts}
                    selected={selectedOpt as { label: string; value: string }[]}
                    onUpdate={(
                      type: string,
                      option: { label: string; value: string } | undefined,
                    ) => {
                      if (type === 'select-option' && option) {
                        const newParts = (answers[q.id] || '').split('|');
                        while (newParts.length <= idx) newParts.push('');
                        newParts[idx] = option.value;
                        updateAnswer(q.id, newParts.join('|'));
                      }
                    }}
                    placeholder="Select..."
                  />
                </div>
              );
            })}
          </div>
        );

      default: // textarea
        return (
          <Textarea
            value={answers[q.id] || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateAnswer(q.id, e.target.value)
            }
            placeholder="Enter response…"
            rows={2}
            error={!answers[q.id]?.trim()}
          />
        );
    }
  };

  return (
    <div className="center-panel">
      {/* Subtext — question count + AI pre-fill summary */}
      <Text size="small" appearance="subtle" className="d-block mb-5">
        {totalCount} questions required by payer
        {aiCount > 0 ? ` · ${aiCount} of ${totalCount} pre-filled by AI from patient records` : ''}
      </Text>

      {/* Questions — all in one card, divided by Divider */}
      <Card shadow="none" className="mb-5 p-5">
        {questions.map((q, i) => {
          const isAiFilled = q.ai && !!answers[q.id];
          return (
            <div key={q.id}>
              {i > 0 && <Divider className="my-6" />}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <Text size="small" appearance="subtle">{`Question ${i + 1}`}</Text>
                {isAiFilled && <AIFilledBadge />}
              </div>
              <Text weight="medium" className="mb-4 d-block">
                {q.q}
              </Text>
              {renderInput(q)}
            </div>
          );
        })}
      </Card>

      {/* Additional Information */}
      <Card shadow="none" className="mb-5 p-5">
        <Text weight="medium" className="mb-5 d-block">
          Additional Information
        </Text>

        <div className="mb-5">
          <Label withInput>
            Notes{' '}
            <Text size="small" appearance="subtle" style={{ display: 'inline' }}>
              (optional)
            </Text>
          </Label>
          <Textarea
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            placeholder="Placeholder"
            rows={3}
          />
        </div>

        <div>
          <Label withInput>Attachments</Label>
          <FileUploader
            title="Drag your files here or browse files"
            sizeLabel="Accepted formats: png, jpeg · Maximum size: 2 MB"
            className="mb-4"
          />
          <div className="d-flex flex-wrap" style={{ gap: 'var(--spacing-30)' }}>
            {RX_DOCS.map((d, i) => (
              <Chip
                key={i}
                label={`${d.name}${d.ext}`}
                icon="description"
                name={`doc-${i}`}
                type="selection"
                clearButton
                onClose={() => {}}
              />
            ))}
          </div>
        </div>
      </Card>

      <Button
        size="tiny"
        appearance="primary"
        disabled={!allFilled}
        onClick={() => {
          onRecordRound?.({
            round: 1,
            label: 'Initial PBM Questionnaire',
            questions,
            answers: { ...answers },
            submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
          onSubmit(answers);
        }}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
