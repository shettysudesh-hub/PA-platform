import { useState, useEffect } from 'react';
import {
  Button,
  Text,
  Card,
  Message,
  Chip,
  Icon,
  Divider,
  LinkButton,
} from '@innovaccer/design-system';
import AIProcessingPanel from '../shared/AIProcessingPanel';
import { MED_DOCS } from '../../data/mockData';
import { MED_NECESSITY, MED_NECESSITY_REVIEWED } from '../../data/medicalNecessity';
import type { Criterion } from '../../data/medicalNecessity';

// ── Criteria tree item ────────────────────────────────────────────────────────
function CriteriaItem({ item, depth = 0 }: { item: Criterion; depth?: number }) {
  const statusIcon =
    item.status === 'pass' ? (
      <Icon name="check" size={14} appearance="success" />
    ) : item.status === 'fail' ? (
      <Icon name="close" size={14} appearance="alert" />
    ) : item.status === 'pending' ? (
      <Icon name="hourglass_empty" size={14} appearance="subtle" />
    ) : (
      <Icon name="remove" size={14} appearance="subtle" />
    );

  return (
    <div className="mn-criteria-item" style={{ paddingLeft: depth * 16 }}>
      <div className="mn-criteria-row">
        <span style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}>{statusIcon}</span>
        <span className="mn-criteria-text">{item.text}</span>
        {item.doc && (
          <Chip label={item.doc} icon="description" name={`doc-${item.id}`} type="selection" />
        )}
        {item.status === 'fail' && !item.doc && (
          <Text size="small" appearance="alert" className="flex-shrink-0">
            Document missing
          </Text>
        )}
      </div>
      {item.children?.map((child) => (
        <CriteriaItem key={child.id} item={child} depth={depth + 1} />
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  onContinue: (allMet?: boolean) => void;
  skipLoading?: boolean;
  packetSubmitted?: boolean;
}

// ── The new doc added during re-review ───────────────────────────────────────
const NEW_DOC = { name: 'Neurology Consult Note', ext: '.pdf', auto: true };

// ── MedicalNecessityPanel ─────────────────────────────────────────────────────
export default function MedicalNecessityPanel({
  onContinue,
  skipLoading,
  packetSubmitted = false,
}: Props) {
  const [phase, setPhase] = useState(skipLoading ? 'done' : 'loading');
  const [rereviewing, setRereviewing] = useState(false); // true while re-review loading
  const [rereviewed, setRereviewed] = useState(false); // true after re-review completes

  useEffect(() => {
    if (skipLoading) return;
    const t = setTimeout(() => setPhase('done'), 2500);
    return () => clearTimeout(t);
  }, [skipLoading]);

  // ── Re-review trigger ─────────────────────────────────────────────────────
  const handleAddNew = () => {
    setRereviewing(true);
    setPhase('loading');
    setTimeout(() => {
      setPhase('done');
      setRereviewed(true);
      setRereviewing(false);
    }, 2500);
  };

  if (phase === 'loading') {
    return (
      <AIProcessingPanel
        message={
          rereviewing
            ? 'Re-evaluating medical necessity with new documents…'
            : 'Reviewing medical necessity against clinical guidelines…'
        }
      />
    );
  }

  // Active data — switches after re-review
  const mn = rereviewed ? MED_NECESSITY_REVIEWED : MED_NECESSITY;
  const docs = rereviewed ? [...MED_DOCS, NEW_DOC] : MED_DOCS;
  const hasIssues = mn.criteria.some(
    (c) => c.status === 'fail' || c.children?.some((ch) => ch.status === 'fail'),
  );

  return (
    <div className="center-panel">
      {/* ── Status banner ────────────────────────────────────────────────── */}
      <Message
        appearance={hasIssues ? 'warning' : 'success'}
        description={
          hasIssues
            ? 'Review Required — Some criteria not met'
            : 'All medical necessity criteria met'
        }
        className="mb-4"
      />

      {/* ── Combined card ────────────────────────────────────────────────── */}
      <Card shadow="none" className="mb-5 p-5">
        {/* Guideline row */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Text size="small" appearance="subtle">
            Guideline used
          </Text>
          <Button
            appearance="transparent"
            size="tiny"
            icon="edit"
            onClick={() => {}}
            aria-label="Change guideline"
          />
        </div>
        <div className="d-flex align-items-center mb-4" style={{ gap: 'var(--spacing-20)' }}>
          <LinkButton
            icon="open_in_new"
            iconAlign="right"
            onClick={() => window.open('https://www.cms.gov', '_blank')}
          >
            {mn.guideline}
          </LinkButton>
        </div>

        <Divider className="mb-4" />

        {/* Criteria tree */}
        <div className="mn-criteria-tree mb-5">
          {mn.criteria.map((c) => (
            <CriteriaItem key={c.id} item={c} />
          ))}
        </div>

        <Divider className="mb-4" />

        {/* Supporting documents */}
        <Text weight="medium" className="d-block mb-4">
          Supporting Documents
        </Text>

        <div className="d-flex flex-wrap mb-4" style={{ gap: 'var(--spacing-30)' }}>
          {docs.map((d, i) => (
            <Chip
              key={i}
              label={`${d.name}${d.ext}`}
              icon="description"
              name={`meddoc-${i}`}
              type="selection"
              clearButton
              onClose={() => {}}
            />
          ))}
          {!rereviewed && (
            <Button appearance="transparent" size="tiny" onClick={handleAddNew}>
              + Add new
            </Button>
          )}
        </div>
      </Card>

      {!packetSubmitted && (
        <Button
          size="tiny"
          appearance="primary"
          onClick={() => onContinue(rereviewed || !hasIssues)}
        >
          Review Packet
        </Button>
      )}
    </div>
  );
}
