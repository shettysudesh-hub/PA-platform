import { useState, useCallback } from 'react';
import { PageHeader, Badge, Button, Text, Icon } from '@innovaccer/design-system';
import type { CollapsedSummary } from './CollapsedSection';
import EligibilityPanel from '../Steps/EligibilityPanel';
import QuestionnairePanel from '../Steps/QuestionnairePanel';
import MedicalNecessityPanel from '../Steps/MedicalNecessityPanel';
import DecisionPanel from '../Steps/DecisionPanel';
import SubmissionRoutingPanel from '../Steps/SubmissionRoutingPanel';
import MultiCptDecisionPanel from '../Steps/MultiCptDecisionPanel';
import PacketPanel from '../Panel/PacketPanel';
import SimulatorFloater from '../shared/SimulatorFloater';
import type { CptStatus } from '../shared/SimulatorFloater';
import { PBM_QUESTIONS, RX_DOCS, MED_DOCS, AMIT_DOCS } from '../../data/mockData';
import { MED_NECESSITY } from '../../data/medicalNecessity';
import type { Criterion } from '../../data/medicalNecessity';
import type { Order, Question, MultiCptOrder } from '../../data/mockData';

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
  order: Order;
  onBack: () => void;
}

// ── Section labels ───────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  eligibility: 'Eligibility Investigation',
  pa_initiation: 'Payer Questionnaire',
  medical_necessity: 'Medical Necessity Review',
  routing: 'Submission Routing',
  decision: 'Decision',
};

// ── FeedView ─────────────────────────────────────────────────────────────────

export default function FeedView({ order, onBack }: Props) {
  const isRx = order.type === 'prescription';
  const isMulti = order.type === 'medical_multi';
  const sectionIds = isRx
    ? ['eligibility', 'pa_initiation', 'decision']
    : isMulti
      ? ['eligibility', 'medical_necessity', 'routing', 'decision']
      : ['eligibility', 'medical_necessity', 'decision'];

  const [phase, setPhase] = useState('eligibility');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [stepOutcomes, setStepOutcomes] = useState<Record<string, CollapsedSummary>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [packetLoading, setPacketLoading] = useState(false);
  const [packetSubmitted, setPacketSubmitted] = useState(false);
  const [insActive, setInsActive] = useState(true);
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>('pended');
  const [submissionHistory, setSubmissionHistory] = useState<RoundRecord[]>([]);
  // Multi-CPT decision statuses — lifted here so SimulatorFloater can drive them
  const [multiStatuses, setMultiStatuses] = useState<CptStatus[]>(
    isMulti ? (order as MultiCptOrder).cpts.map(() => 'pended' as CptStatus) : [],
  );
  // Pending section summaries — applied when packet is actually submitted
  const [pendingMedAllMet, setPendingMedAllMet] = useState(false);
  // Extra docs added via "Resubmit with Documents" in decision phase
  const [extraDocs, setExtraDocs] = useState<{ name: string; ext: string; auto: boolean }[]>([]);
  // Whether the packet panel is in read-only mode (viewing after submission)
  const [packetReadOnly, setPacketReadOnly] = useState(false);

  const updateCptStatus = useCallback((index: number, status: CptStatus) => {
    setMultiStatuses((prev) => prev.map((s, i) => (i === index ? status : s)));
  }, []);

  const phaseIdx = sectionIds.indexOf(phase);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const completeSection = useCallback(
    (sectionId: string, summary: CollapsedSummary, nextPhase?: string) => {
      setCompleted((p) => ({ ...p, [sectionId]: true }));
      setCollapsed((p) => ({ ...p, [sectionId]: true }));
      setStepOutcomes((p) => ({ ...p, [sectionId]: summary }));
      if (nextPhase) setPhase(nextPhase);
    },
    [],
  );

  const collapseSection = useCallback((sectionId: string) => {
    setCollapsed((p) => ({ ...p, [sectionId]: true }));
  }, []);

  const expandSection = useCallback((sectionId: string) => {
    setCollapsed((p) => ({ ...p, [sectionId]: false }));
  }, []);

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleAlternativeSelect = useCallback(
    (selIndex: number) => {
      const ins = order.patient.insurance;
      const summary: CollapsedSummary = {
        line1: insActive ? 'Active · Alternates found' : 'Inactive',
        line2: `${ins.payer} · Member ${ins.memberId} · ${ins.planType}`,
        status: insActive ? 'success' : 'error',
      };
      void selIndex;
      if (isRx) {
        completeSection('eligibility', summary, 'pa_initiation');
      } else {
        completeSection('eligibility', summary, 'medical_necessity');
      }
    },
    [isRx, insActive, order, completeSection],
  );

  const handleMedContinue = useCallback(() => {
    const ins = order.patient.insurance;
    const cptCount = isMulti ? (order as MultiCptOrder).cpts.length : undefined;
    const summary: CollapsedSummary = {
      line1: cptCount ? `Active · ${cptCount} CPTs` : 'Active',
      line2: `${ins.payer} · Member ${ins.memberId} · ${ins.planType}`,
      status: 'success',
    };
    completeSection('eligibility', summary, 'medical_necessity');
  }, [order, isMulti, completeSection]);

  // ── Open packet panel in loading state, then reveal after 3.5s ───────────
  const openPacketWithLoading = useCallback(() => {
    setPacketLoading(true);
    setPanelOpen(true);
    setTimeout(() => setPacketLoading(false), 3500);
  }, []);

  const handleQuestionnaireSubmit = useCallback(
    (answers: Record<string, string>) => {
      void answers;
      // Open packet for review — section stays editable until packet is submitted
      openPacketWithLoading();
    },
    [openPacketWithLoading],
  );

  const handleMedNecessityContinue = useCallback(
    (allMet?: boolean) => {
      // Save allMet for use when packet is actually submitted
      setPendingMedAllMet(!!allMet);
      // Open packet for review — section stays editable until packet is submitted
      openPacketWithLoading();
    },
    [openPacketWithLoading],
  );

  const handlePacketSubmit = useCallback(() => {
    setPanelOpen(false);
    setPacketSubmitted(true);

    // Now mark the step that was pending review as complete
    if (isRx) {
      const aiCount = PBM_QUESTIONS.filter((q) => q.ai).length;
      const manualCount = PBM_QUESTIONS.length - aiCount;
      const summary: CollapsedSummary = {
        line1: `${PBM_QUESTIONS.length}/${PBM_QUESTIONS.length} answered`,
        line2: `${aiCount} AI-filled · ${manualCount} manual · Submitted to PBM`,
        status: 'success',
      };
      setCompleted((p) => ({ ...p, pa_initiation: true }));
      setStepOutcomes((p) => ({ ...p, pa_initiation: summary }));
    } else {
      // medical or multi — complete medical_necessity
      const flatLeaves = (items: Criterion[]): Criterion[] =>
        items.flatMap((c) => (c.children?.length ? flatLeaves(c.children) : [c]));
      const leaves = flatLeaves(MED_NECESSITY.criteria);
      const total = leaves.length;
      const met = pendingMedAllMet ? total : leaves.filter((c) => c.status === 'pass').length;
      const docCount = pendingMedAllMet ? MED_DOCS.length + 1 : MED_DOCS.length;
      const summary: CollapsedSummary = {
        line1: `${met}/${total} criteria met`,
        line2: `${docCount} supporting docs · ${MED_NECESSITY.guideline}`,
        status: pendingMedAllMet ? 'success' : 'warning',
      };
      setCompleted((p) => ({ ...p, medical_necessity: true }));
      setStepOutcomes((p) => ({ ...p, medical_necessity: summary }));
    }

    setPhase(isMulti ? 'routing' : 'decision');
  }, [isMulti, isRx, pendingMedAllMet]);

  const handleRoutingSubmit = useCallback(() => {
    const multiOrder = order as MultiCptOrder;
    const summary: CollapsedSummary = {
      line1: `${multiOrder.cpts.length} CPTs routed`,
      line2: `${multiOrder.cpts.filter((c) => c.suggestedChannel === 'electronic').length} electronic · ${multiOrder.cpts.filter((c) => c.suggestedChannel === 'fax').length} fax`,
      status: 'success',
    };
    completeSection('routing', summary, 'decision');
  }, [order, completeSection]);

  const handleSimulate = useCallback((outcome: string) => {
    if (outcome === 'approved') {
      setDecisionStatus('approved');
      setStepOutcomes((p) => ({
        ...p,
        decision: { line1: 'Approved', line2: 'Authorization granted by payer', status: 'success' },
      }));
      setCompleted((p) => ({ ...p, decision: true }));
    } else if (outcome === 'denied') {
      setDecisionStatus('denied');
      setStepOutcomes((p) => ({
        ...p,
        decision: { line1: 'Denied', line2: 'Peer-to-peer or appeal available', status: 'error' },
      }));
      setCompleted((p) => ({ ...p, decision: true }));
    } else if (outcome === 'additional_docs') {
      setDecisionStatus('additional_docs');
    } else if (outcome === 'additional_questions') {
      setDecisionStatus('additional_questions');
    } else if (outcome === 'pended_resubmit') {
      setDecisionStatus('pended');
    } else if (outcome === 'contact_payer') {
      setDecisionStatus('contact_payer');
    } else if (outcome === 'submission_error') {
      setDecisionStatus('submission_error');
    }
  }, []);

  // ── View packet (read-only) from decision phase ────────────────────────
  const handleViewPacket = useCallback(() => {
    setPacketReadOnly(true);
    setPanelOpen(true);
  }, []);

  // ── Resubmit with new docs — updates packet and returns to pended ─────
  const handleResubmitDocs = useCallback((docNames: string[]) => {
    const newDocs = docNames.map((name) => ({ name, ext: '.pdf', auto: false }));
    setExtraDocs((prev) => [...prev, ...newDocs]);
  }, []);

  // ── Section content — no thinking, renders directly ──────────────────────

  const renderContent = (sectionId: string) => {
    const reviewing = !!completed[sectionId];

    switch (sectionId) {
      case 'eligibility':
        return (
          <EligibilityPanel
            order={order}
            insActive={insActive}
            isCompleted={!!completed['eligibility']}
            locked={packetSubmitted}
            onContinue={
              reviewing
                ? () => collapseSection('eligibility')
                : isRx
                  ? handleAlternativeSelect
                  : handleMedContinue
            }
          />
        );

      case 'pa_initiation':
        return (
          <QuestionnairePanel
            questions={PBM_QUESTIONS}
            submitted={!!completed['pa_initiation']}
            onSubmit={handleQuestionnaireSubmit}
            onRecordRound={(r) => setSubmissionHistory((p) => [...p, r])}
          />
        );

      case 'medical_necessity':
        return (
          <MedicalNecessityPanel
            skipLoading
            packetSubmitted={packetSubmitted}
            onContinue={
              reviewing ? () => collapseSection('medical_necessity') : handleMedNecessityContinue
            }
          />
        );

      case 'routing':
        return (
          <SubmissionRoutingPanel order={order as MultiCptOrder} onSubmit={handleRoutingSubmit} />
        );

      case 'decision':
        if (isMulti) {
          return <MultiCptDecisionPanel order={order as MultiCptOrder} statuses={multiStatuses} />;
        }
        return (
          <DecisionPanel
            type={order.type}
            status={decisionStatus}
            onSimulate={handleSimulate}
            submissionHistory={submissionHistory}
            onRecordFollowUp={(r) => setSubmissionHistory((p) => [...p, r])}
            onViewPacket={handleViewPacket}
            onResubmitDocs={handleResubmitDocs}
          />
        );

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const [caseCreatedDate] = useState(() =>
    new Date(Date.now() - (order.daysOpen ?? 0) * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  );

  return (
    <div className="feed-page">
      {/* Page header */}
      <PageHeader
        title={`${order.patient.name} · ${order.title}`}
        separator
        navigationPosition="center"
        meta={
          <div className="d-flex align-items-center" style={{ gap: 4 }}>
            <Icon name="calendar_today" size={12} appearance="subtle" />
            <Text size="small" appearance="subtle">
              {`Case created on ${caseCreatedDate}`}
            </Text>
          </div>
        }
        button={
          <Button
            appearance="transparent"
            icon="arrow_back"
            onClick={onBack}
            aria-label="Back to worklist"
          />
        }
        badge={
          <Badge appearance={isRx ? 'accent2' : 'primary'}>
            {isRx ? 'Rx PA' : isMulti ? 'Multi-CPT PA' : 'Medical PA'}
          </Badge>
        }
        actions={
          <div className="ins-toggle">
            <span className="ins-toggle-label">Insurance:</span>
            <button
              className={`ins-toggle-btn ${insActive ? 'on' : ''}`}
              onClick={() => setInsActive(true)}
            >
              Active
            </button>
            <button
              className={`ins-toggle-btn ${!insActive ? 'on red' : ''}`}
              onClick={() => setInsActive(false)}
            >
              Inactive
            </button>
          </div>
        }
      />

      {/* Feed layout — feed-scroll + inline packet panel side by side */}
      <div className="feed-layout">
        <div className="feed-scroll">
          <div className="feed-col">
            {/* ── Step wizard — all steps always visible ───────────────── */}
            <div className="step-wizard">
              {sectionIds.map((sectionId, idx) => {
                const isFuture = idx > phaseIdx;
                const isCompleted = !!completed[sectionId];
                const isCollapsed = !!collapsed[sectionId];
                const isActive = !isCompleted && !isFuture;
                const outcome = stepOutcomes[sectionId];
                const isLast = idx === sectionIds.length - 1;

                const stepIcon = isCompleted ? (
                  <Icon name="check_circle" size={16} appearance="success" />
                ) : isActive ? (
                  <Icon name="radio_button_checked" size={16} appearance="primary" />
                ) : (
                  <Icon name="radio_button_unchecked" size={16} appearance="disabled" />
                );

                return (
                  <div key={sectionId} className={`step-row${isFuture ? ' step-row--future' : ''}`}>
                    {/* Left column: indicator icon + connecting line */}
                    <div className="step-left">
                      <div className="step-icon">{stepIcon}</div>
                      {!isLast && <div className="step-line" />}
                    </div>

                    {/* Right column: header + optional content */}
                    <div className="step-right">
                      {/* Section header — always visible */}
                      <div
                        className={`step-header-row${!isFuture ? ' step-header-row--clickable' : ''}`}
                        onClick={() => {
                          if (isFuture) return;
                          if (isCollapsed) expandSection(sectionId);
                          else collapseSection(sectionId);
                        }}
                      >
                        <Text weight={isActive ? 'strong' : 'medium'}>
                          {SECTION_LABELS[sectionId]}
                        </Text>
                        <Icon
                          name={
                            isCollapsed || isFuture ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
                          }
                          size={16}
                          appearance="subtle"
                        />
                      </div>

                      {/* Outcome summary — completed + collapsed */}
                      {isCompleted && isCollapsed && outcome && (
                        <Text size="small" appearance="subtle" className="d-block mb-5">
                          {outcome.line1}
                          {outcome.line2 ? ` · ${outcome.line2}` : ''}
                        </Text>
                      )}

                      {/* Full content — keep mounted to preserve state, hide when collapsed */}
                      {!isFuture && (
                        <div
                          className="step-content"
                          style={{ display: isCollapsed ? 'none' : 'block' }}
                        >
                          {renderContent(sectionId)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pb-9" />
          </div>
        </div>

        {/* Packet panel — inline flex sibling, no backdrop */}
        <PacketPanel
          open={panelOpen}
          order={order}
          docs={[...(isRx ? RX_DOCS : isMulti ? AMIT_DOCS : MED_DOCS), ...extraDocs]}
          loading={packetLoading}
          readOnly={packetReadOnly}
          submitLabel={isMulti ? 'Continue to Routing' : undefined}
          onClose={() => {
            setPanelOpen(false);
            setPacketReadOnly(false);
          }}
          onSubmit={handlePacketSubmit}
        />
      </div>

      {/* Simulator floater — only visible once decision step is active */}
      {sectionIds.includes('decision') &&
        phaseIdx >= sectionIds.indexOf('decision') &&
        (isMulti ? (
          <SimulatorFloater
            orderType="medical_multi"
            cpts={(order as MultiCptOrder).cpts.map((c) => ({ cpt: c.cpt, title: c.title }))}
            onSimulateCpt={updateCptStatus}
          />
        ) : (
          <SimulatorFloater
            orderType={order.type as 'prescription' | 'medical'}
            onSimulate={handleSimulate}
          />
        ))}
    </div>
  );
}
