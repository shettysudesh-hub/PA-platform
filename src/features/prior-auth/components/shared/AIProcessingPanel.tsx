import { Text } from '@innovaccer/design-system';
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
          background: 'var(--white)',
          borderRadius: 8,
          border: '1px solid var(--secondary-light)',
        }}
      >
        <SaraSparkle size={32} state="short-processing" />
        <div>
          <Text weight="strong">AI is working</Text>
          <br />
          <Text size="small" appearance="subtle">
            {message}
          </Text>
        </div>
      </div>
    </div>
  );
}
