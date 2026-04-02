import { Spinner } from '@innovaccer/design-system';
import { Ic } from '../shared/icons';
import { useThinkingSteps } from '../../hooks/useThinkingSteps';

interface Props {
  steps: string[];
  delays?: number[];
  skipAnimation?: boolean;
  onAllDone?: () => void;
}

export default function ThinkingSteps({ steps, delays, skipAnimation, onAllDone }: Props) {
  const { stepStates, allDone, expanded, toggleExpanded } = useThinkingSteps({
    steps,
    delays,
    skipAnimation,
    onAllDone,
  });

  const visibleSteps = stepStates.filter((s) => s.status !== 'pending');

  if (allDone) {
    return (
      <div className="thinking-done">
        <button className="thinking-toggle" onClick={toggleExpanded}>
          <span className="thinking-check-icon">{Ic.check}</span>
          <span className="thinking-toggle-label">{steps.length} steps completed</span>
          <span className={`thinking-chevron ${expanded ? 'open' : ''}`}>▾</span>
        </button>
        {expanded && (
          <div className="thinking-steps-list">
            {steps.map((text, i) => (
              <div key={i} className="thinking-step done">
                <span className="thinking-step-icon done">{Ic.check}</span>
                <span className="thinking-text">{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="thinking-steps-list">
      {visibleSteps.map((s, i) => (
        <div key={i} className={`thinking-step ${s.status}`}>
          {s.status === 'done' && <span className="thinking-step-icon done">{Ic.check}</span>}
          {s.status === 'active' && (
            <span className="thinking-step-icon active">
              <Spinner size="xsmall" appearance="primary" />
            </span>
          )}
          <span className={`thinking-text ${s.status === 'active' ? 'thinking-text-active' : ''}`}>
            {s.text}
          </span>
        </div>
      ))}
    </div>
  );
}
