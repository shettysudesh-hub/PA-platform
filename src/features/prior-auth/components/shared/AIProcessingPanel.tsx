import { Spinner, Text } from '@innovaccer/design-system';
import { SaraSparkle } from '@innovaccer/design-system';

interface Props {
  message: string;
}

export default function AIProcessingPanel({ message }: Props) {
  return (
    <div className="center-panel">
      <div
        className="d-flex align-items-center p-6"
        style={{
          gap: 'var(--spacing-40)',
          background: `linear-gradient(135deg, var(--accent2-lightest) 0%, var(--primary-lightest) 100%)`,
          borderRadius: 8,
          border: `1px solid var(--accent2-lighter)`,
        }}
      >
        <SaraSparkle size={32} state="short-processing" />
        <div>
          <Text weight="strong" style={{ color: 'var(--accent2)' }}>
            AI is working
          </Text>
          <br />
          <Text size="small" appearance="subtle">
            {message}
          </Text>
        </div>
        <Spinner size="small" appearance="primary" />
      </div>
    </div>
  );
}
