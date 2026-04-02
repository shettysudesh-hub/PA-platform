export interface CollapsedSummary {
  line1: string;
  line2: string;
  status: 'success' | 'warning' | 'error';
}

interface Props {
  stepName: string;
  summary: CollapsedSummary;
  onClick: () => void;
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const WarnIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

export default function CollapsedSection({ stepName, summary, onClick }: Props) {
  const statusColor =
    summary.status === 'success'
      ? 'var(--success)'
      : summary.status === 'warning'
        ? 'var(--warning-dark)'
        : 'var(--alert)';

  return (
    <div
      className="collapsed-section"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <span className="collapsed-check" style={{ color: statusColor }}>
        {summary.status === 'success' ? <CheckIcon /> : <WarnIcon />}
      </span>
      <div className="collapsed-text">
        <div className="collapsed-line1">
          <span className="collapsed-step-name">{stepName}</span>
          <span className="collapsed-sep"> — </span>
          <span style={{ color: statusColor }}>{summary.line1}</span>
        </div>
        <div className="collapsed-line2">{summary.line2}</div>
      </div>
      <span className="collapsed-expand-icon">▾</span>
    </div>
  );
}
