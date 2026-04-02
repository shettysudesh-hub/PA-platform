import { useState } from 'react';
import { Text, Spinner } from '@innovaccer/design-system';
import { Ic } from '../shared/icons';
import StreamItem from './StreamItem';
import type { StepDef } from '../../data/mockData';

interface StreamItemType {
  text: string;
  status: 'done' | 'loading' | 'waiting' | 'error';
  indent?: boolean;
}

interface Props {
  steps: StepDef[];
  activeStep: string;
  stepStates: Record<string, string>;
  stepOutcomes: Record<string, string>;
  streamData: Record<string, StreamItemType[]>;
  onStepClick: (stepId: string) => void;
}

export default function LeftStepper({
  steps,
  activeStep,
  stepStates,
  stepOutcomes,
  streamData,
  onStepClick,
}: Props) {
  const [expandedAI, setExpandedAI] = useState<string | null>(null);

  return (
    <div className="stepper-col">
      {steps.map((step, i) => {
        const state = stepStates[step.id] || 'pending';
        const isActive = step.id === activeStep;
        const outcome = stepOutcomes[step.id];
        const stream = streamData[step.id] || [];
        const aiExpanded = expandedAI === step.id;

        const outcomeClass =
          outcome?.includes('not met') ||
          outcome?.includes('Error') ||
          outcome?.includes('Denied') ||
          outcome?.includes('Inactive')
            ? 'warn'
            : state === 'blocked'
              ? 'blocked'
              : state;

        return (
          <div key={step.id} className={`step-block ${isActive ? 'is-active' : ''}`}>
            <div className="step-header" onClick={() => onStepClick(step.id)}>
              {/* Step indicator circle */}
              <div className={`step-indicator ${state}`}>
                {state === 'done' ? (
                  Ic.check
                ) : state === 'active' ? (
                  <div className="step-active-dot" />
                ) : state === 'blocked' ? (
                  Ic.warn
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)' }}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <Text weight={isActive ? 'strong' : 'medium'} style={{ flex: 1, fontSize: 13 }}>
                {step.label}
              </Text>

              {/* Outcome chip */}
              {outcome && <span className={`step-outcome ${outcomeClass}`}>{outcome}</span>}
            </div>

            {/* AI Activity toggle */}
            {(state === 'done' || state === 'blocked' || state === 'active') &&
              stream.length > 0 && (
                <div className="step-ai-section">
                  <button
                    className="step-ai-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedAI(aiExpanded ? null : step.id);
                    }}
                  >
                    <span className="step-ai-spark">{Ic.spark}</span>
                    <Text size="small" appearance="subtle">
                      AI Activity
                    </Text>
                    <span className={`step-ai-chevron ${aiExpanded ? 'open' : ''}`}>▾</span>
                  </button>

                  {aiExpanded && (
                    <div className="step-ai-content">
                      <div className="step-stream-line" />
                      {stream.map((item, j) => (
                        <StreamItem
                          key={j}
                          text={item.text}
                          indent={item.indent}
                          icon={
                            item.status === 'done' ? (
                              <span style={{ color: 'var(--success)', display: 'flex' }}>
                                {Ic.check}
                              </span>
                            ) : item.status === 'loading' ? (
                              <Spinner size="xsmall" appearance="primary" />
                            ) : item.status === 'waiting' ? (
                              <span style={{ color: 'var(--text-subtle)', display: 'flex' }}>
                                {Ic.hourglass}
                              </span>
                            ) : item.status === 'error' ? (
                              <span style={{ color: 'var(--alert)', display: 'flex' }}>
                                {Ic.warn}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-subtle)', display: 'flex' }}>
                                {Ic.hourglass}
                              </span>
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
}
