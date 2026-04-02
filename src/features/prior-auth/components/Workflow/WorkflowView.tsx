import { useState, useCallback, useEffect, useRef } from 'react';
import { PageHeader, Badge, Button } from '@innovaccer/design-system';
import LeftStepper from './LeftStepper';
import AIProcessingPanel from '../shared/AIProcessingPanel';
import EligibilityPanel from '../Steps/EligibilityPanel';
import QuestionnairePanel from '../Steps/QuestionnairePanel';
import MedicalNecessityPanel from '../Steps/MedicalNecessityPanel';
import PacketReviewPanel from '../Steps/PacketReviewPanel';
import DecisionPanel from '../Steps/DecisionPanel';
import { STEPS_RX, STEPS_MED, PBM_QUESTIONS, RX_DOCS, MED_DOCS } from '../../data/mockData';
import type { Order, Question } from '../../data/mockData';
import { MED_NECESSITY } from '../../data/medicalNecessity';
import { computeMedNecessityOutcome } from '../../utils/computeMedNecessityOutcome';
import { delay } from '../../utils/delay';

interface RoundRecord {
  round: number;
  label: string;
  questions: Question[];
  answers: Record<string, string>;
  submittedAt: string;
}

interface StreamItem {
  text: string;
  status: 'done' | 'loading' | 'waiting' | 'error';
  indent?: boolean;
}

interface Props {
  order: Order;
  onBack: () => void;
}

export default function WorkflowView({ order, onBack }: Props) {
  const isRx = order.type === 'prescription';
  const steps = isRx ? STEPS_RX : STEPS_MED;

  const [activeStep, setActiveStep] = useState(steps[0].id);
  const [stepStates, setStepStates] = useState<Record<string, string>>({});
  const [streamData, setStreamData] = useState<Record<string, StreamItem[]>>({});
  const [centerView, setCenterView] = useState('ai_processing');
  const [centerMsg, setCenterMsg] = useState('Running RTPB Check...');
  const [decisionStatus, setDecisionStatus] = useState<
    | 'pended'
    | 'approved'
    | 'denied'
    | 'additional_docs'
    | 'additional_questions'
    | 'contact_payer'
    | 'submission_error'
  >('pended');
  const [submissionHistory, setSubmissionHistory] = useState<RoundRecord[]>([]);
  const [viewingStep, setViewingStep] = useState<string | null>(null);
  const [insActive, setInsActive] = useState(true);
  const [stepOutcomes, setStepOutcomes] = useState<Record<string, string>>({});
  const phaseRef = useRef(0);

  const addStream = useCallback((stepId: string, item: StreamItem) => {
    setStreamData((prev) => ({ ...prev, [stepId]: [...(prev[stepId] || []), item] }));
  }, []);

  const updateLastStream = useCallback((stepId: string, updates: Partial<StreamItem>) => {
    setStreamData((prev) => {
      const items = [...(prev[stepId] || [])];
      if (items.length > 0) items[items.length - 1] = { ...items[items.length - 1], ...updates };
      return { ...prev, [stepId]: items };
    });
  }, []);

  // AI auto-progression engine
  useEffect(() => {
    if (phaseRef.current > 0) return;
    phaseRef.current = 1;

    const run = async () => {
      setActiveStep('eligibility');
      setStepStates((p) => ({ ...p, eligibility: 'active' }));
      setCenterView('ai_processing');
      setCenterMsg('Running RTPB Check...');
      addStream('eligibility', { text: 'Running RTPB Check...', status: 'loading' });

      await delay(1200);
      addStream('eligibility', { text: 'Verifying coverage', status: 'loading', indent: true });
      await delay(1000);
      updateLastStream('eligibility', { status: 'done', text: 'Verifying coverage' });

      const ins = order.patient.insurance;
      addStream('eligibility', {
        text: `Insurance: ${ins.payer} — ${ins.planId}`,
        status: 'done',
        indent: true,
      });
      addStream('eligibility', {
        text: `Member ID: ${ins.memberId}`,
        status: 'done',
        indent: true,
      });

      if (!insActive) {
        addStream('eligibility', {
          text: 'Coverage status: INACTIVE',
          status: 'error',
          indent: true,
        });
        setStreamData((prev) => {
          const items = [...(prev['eligibility'] || [])];
          if (items[0])
            items[0] = { ...items[0], status: 'error', text: 'RTPB Check — Insurance Inactive' };
          return { ...prev, eligibility: items };
        });
        setStepStates((p) => ({ ...p, eligibility: 'blocked' }));
        setStepOutcomes((p) => ({ ...p, eligibility: 'Inactive' }));
        setCenterView('eligibility');
        return;
      }

      addStream('eligibility', { text: 'Coverage status: Active ✓', status: 'done', indent: true });
      await delay(600);
      addStream('eligibility', { text: 'Fetching alternatives', status: 'loading', indent: true });
      await delay(800);
      updateLastStream('eligibility', { status: 'done', text: 'Fetching alternatives' });
      addStream('eligibility', {
        text: 'Confirming if pharmacy is covered',
        status: 'loading',
        indent: true,
      });
      await delay(600);
      updateLastStream('eligibility', {
        status: 'done',
        text: 'Confirming if pharmacy is covered',
      });
      addStream('eligibility', {
        text: 'Checking estimated patient pay',
        status: 'loading',
        indent: true,
      });
      await delay(600);
      updateLastStream('eligibility', { status: 'done', text: 'Checking estimated patient pay' });

      setStreamData((prev) => {
        const items = [...(prev['eligibility'] || [])];
        if (items[0]) items[0] = { ...items[0], status: 'done' };
        return { ...prev, eligibility: items };
      });

      if (isRx) {
        addStream('eligibility', { text: 'Payer recommended alternates found', status: 'done' });
        setStepOutcomes((p) => ({ ...p, eligibility: 'Active · Alternates found' }));
        setCenterView('eligibility');
        setCenterMsg('');
      } else {
        addStream('eligibility', { text: 'Eligibility confirmed — Active', status: 'done' });
        setStepStates((p) => ({ ...p, eligibility: 'done' }));
        setStepOutcomes((p) => ({ ...p, eligibility: 'Active' }));
        setCenterView('eligibility');
      }
    };
    run();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAlternativeSelect = useCallback(
    (_selIndex: number) => {
      setStepStates((p) => ({ ...p, eligibility: 'done' }));
      setStepOutcomes((p) => ({ ...p, eligibility: 'Active · Alternates found' }));

      if (isRx) {
        setActiveStep('pa_initiation');
        setStepStates((p) => ({ ...p, pa_initiation: 'active' }));
        setCenterView('ai_processing');
        setCenterMsg('Sending request to PBM...');
        addStream('pa_initiation', {
          text: 'Sending medication details to PBM...',
          status: 'loading',
        });

        setTimeout(() => {
          updateLastStream('pa_initiation', { status: 'done', text: 'Request sent to PBM' });
          addStream('pa_initiation', {
            text: 'Waiting for questionnaire from PBM...',
            status: 'loading',
          });
          setCenterMsg('Waiting for PBM to return questionnaire...');
        }, 1500);

        setTimeout(() => {
          updateLastStream('pa_initiation', {
            status: 'done',
            text: 'Questionnaire received from PBM',
          });
          addStream('pa_initiation', {
            text: 'AI auto-filling from EHR data...',
            status: 'loading',
          });
          setCenterView('questionnaire');
        }, 4000);
      } else {
        setActiveStep('medical_necessity');
        setStepStates((p) => ({ ...p, medical_necessity: 'active' }));
        setCenterView('ai_processing');
        setCenterMsg('Reviewing medical necessity against clinical guidelines...');
        addStream('medical_necessity', {
          text: 'Loading clinical guidelines...',
          status: 'loading',
        });

        setTimeout(() => {
          updateLastStream('medical_necessity', {
            status: 'done',
            text: 'Guidelines loaded: Hemifacial Spasm / Chronic Migraine',
          });
          addStream('medical_necessity', {
            text: 'Checking criteria against patient records...',
            status: 'loading',
          });
        }, 1200);

        setTimeout(() => {
          updateLastStream('medical_necessity', {
            status: 'done',
            text: 'Criteria review complete',
          });
          addStream('medical_necessity', {
            text: 'Gathering supporting documents...',
            status: 'loading',
          });
        }, 2400);

        setTimeout(() => {
          updateLastStream('medical_necessity', {
            status: 'done',
            text: `${MED_DOCS.filter((d) => d.auto).length} of ${MED_DOCS.length} documents auto-fetched`,
          });
          const mnResult = computeMedNecessityOutcome(MED_NECESSITY.criteria);
          setStepOutcomes((p) => ({ ...p, medical_necessity: mnResult.text }));
          setCenterView('medical_necessity');
        }, 3600);
      }
    },
    [isRx, order],
  );

  const handleMedicalNecessityContinue = useCallback(() => {
    setStepStates((p) => ({ ...p, medical_necessity: 'done' }));
    addStream('medical_necessity', { text: 'Medical necessity review confirmed', status: 'done' });
    setActiveStep('packet_review');
    setStepStates((p) => ({ ...p, packet_review: 'active' }));
    setCenterView('packet');
    addStream('packet_review', { text: 'Compiling authorization packet...', status: 'loading' });
    setTimeout(() => {
      addStream('packet_review', { text: 'Insights summary added', status: 'done', indent: true });
      addStream('packet_review', {
        text: 'Patient & insurance details added',
        status: 'done',
        indent: true,
      });
      addStream('packet_review', {
        text: 'Supporting documents attached',
        status: 'done',
        indent: true,
      });
      setStreamData((prev) => {
        const items = [...(prev['packet_review'] || [])];
        if (items[0]) items[0] = { ...items[0], status: 'done', text: 'Packet ready for review' };
        return { ...prev, packet_review: items };
      });
    }, 1000);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQuestionnaireSubmit = useCallback((_answers: Record<string, string>) => {
    setStepStates((p) => ({ ...p, pa_initiation: 'done' }));
    setStepOutcomes((p) => ({ ...p, pa_initiation: '6/6 answered' }));
    updateLastStream('pa_initiation', { status: 'done', text: 'Questionnaire completed' });
    setActiveStep('packet_review');
    setStepStates((p) => ({ ...p, packet_review: 'active' }));
    setCenterView('packet');
    addStream('packet_review', { text: 'Compiling authorization packet...', status: 'loading' });
    setTimeout(() => {
      addStream('packet_review', {
        text: 'Patient & insurance details added',
        status: 'done',
        indent: true,
      });
      addStream('packet_review', {
        text: 'Questionnaire answers attached',
        status: 'done',
        indent: true,
      });
      addStream('packet_review', {
        text: 'Supporting documents attached',
        status: 'done',
        indent: true,
      });
      setStreamData((prev) => {
        const items = [...(prev['packet_review'] || [])];
        if (items[0]) items[0] = { ...items[0], status: 'done', text: 'Packet ready for review' };
        return { ...prev, packet_review: items };
      });
    }, 1200);
  }, []);

  const handlePacketSubmit = useCallback(() => {
    setStepStates((p) => ({ ...p, packet_review: 'done' }));
    setStepOutcomes((p) => ({ ...p, packet_review: 'Submitted' }));
    addStream('packet_review', { text: 'Packet submitted', status: 'done' });
    setActiveStep('decision');
    setStepStates((p) => ({ ...p, decision: 'active' }));
    setCenterView('decision');
    setDecisionStatus('pended');
    addStream('decision', { text: 'Submitted to payer', status: 'done' });
    addStream('decision', { text: 'Awaiting decision — auto-polling active', status: 'loading' });
  }, []);

  const handleSimulate = useCallback((outcome: string) => {
    if (outcome === 'approved') {
      setDecisionStatus('approved');
      setStepOutcomes((p) => ({ ...p, decision: 'Approved' }));
      updateLastStream('decision', { status: 'done', text: 'Authorization APPROVED' });
      setStepStates((p) => ({ ...p, decision: 'done' }));
    } else if (outcome === 'denied') {
      setDecisionStatus('denied');
      setStepOutcomes((p) => ({ ...p, decision: 'Denied' }));
      updateLastStream('decision', { status: 'error', text: 'Authorization DENIED' });
      setStepStates((p) => ({ ...p, decision: 'blocked' }));
    } else if (outcome === 'additional_docs') {
      setDecisionStatus('additional_docs');
      setStepOutcomes((p) => ({ ...p, decision: 'More docs needed' }));
      addStream('decision', {
        text: 'Payer requested additional documentation',
        status: 'waiting',
      });
    } else if (outcome === 'additional_questions') {
      setDecisionStatus('additional_questions');
      setStepOutcomes((p) => ({ ...p, decision: 'More questions' }));
      addStream('decision', { text: 'PBM returned follow-up questions', status: 'waiting' });
    } else if (outcome === 'pended_resubmit') {
      setDecisionStatus('pended');
      setStepOutcomes((p) => ({ ...p, decision: 'Pended' }));
      addStream('decision', { text: 'Resubmitted — awaiting decision', status: 'loading' });
    } else if (outcome === 'contact_payer') {
      setDecisionStatus('contact_payer');
      setStepOutcomes((p) => ({ ...p, decision: 'Contact payer' }));
      addStream('decision', { text: 'Payer response: Contact required (CT)', status: 'waiting' });
    } else if (outcome === 'submission_error') {
      setDecisionStatus('submission_error');
      setStepOutcomes((p) => ({ ...p, decision: 'Error' }));
      addStream('decision', { text: 'Submission error — documents not sent', status: 'error' });
    }
  }, []);

  const handleStepClick = useCallback(
    (stepId: string) => {
      const state = stepStates[stepId];
      if (state === 'done' || state === 'blocked') {
        setViewingStep(stepId);
        if (stepId === 'eligibility') setCenterView('eligibility');
        else if (stepId === 'pa_initiation') setCenterView('questionnaire');
        else if (stepId === 'medical_necessity') setCenterView('medical_necessity');
        else if (stepId === 'packet_review') setCenterView('packet');
        else if (stepId === 'decision') setCenterView('decision');
      } else if (state === 'active') {
        setViewingStep(null);
      }
    },
    [stepStates],
  );

  const renderCenter = () => {
    switch (centerView) {
      case 'ai_processing':
        return <AIProcessingPanel message={centerMsg} />;
      case 'eligibility':
        return (
          <EligibilityPanel
            order={order}
            insActive={insActive}
            onContinue={handleAlternativeSelect}
          />
        );
      case 'questionnaire':
        return (
          <QuestionnairePanel
            questions={PBM_QUESTIONS}
            onSubmit={handleQuestionnaireSubmit}
            onRecordRound={(r) => setSubmissionHistory((p) => [...p, r])}
          />
        );
      case 'medical_necessity':
        return <MedicalNecessityPanel onContinue={handleMedicalNecessityContinue} />;
      case 'packet':
        return (
          <PacketReviewPanel
            order={order}
            docs={isRx ? RX_DOCS : MED_DOCS}
            onSubmit={handlePacketSubmit}
          />
        );
      case 'decision':
        return (
          <DecisionPanel
            type={order.type === 'medical_multi' ? 'medical' : order.type}
            status={decisionStatus}
            onSimulate={handleSimulate}
            submissionHistory={submissionHistory}
            onRecordFollowUp={(r) => setSubmissionHistory((p) => [...p, r])}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="wf-page">
      <PageHeader
        title={`${order.patient.name} · ${order.title}`}
        separator
        navigationPosition="center"
        button={
          <Button
            appearance="transparent"
            icon="arrow_back"
            onClick={onBack}
            aria-label="Back to worklist"
          />
        }
        badge={<Badge appearance={isRx ? 'accent2' : 'primary'}>{isRx ? 'Rx' : 'Medical'}</Badge>}
        actions={
          <div className="ins-toggle">
            <span className="ins-toggle-label">Simulate insurance:</span>
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

      <div className="wf-body">
        <LeftStepper
          steps={steps}
          activeStep={viewingStep || activeStep}
          stepStates={stepStates}
          stepOutcomes={stepOutcomes}
          streamData={streamData}
          onStepClick={handleStepClick}
        />
        <div className="wf-center">{renderCenter()}</div>
      </div>
    </div>
  );
}
