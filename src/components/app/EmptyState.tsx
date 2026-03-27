import { EmptyState as MdsEmptyState } from '@innovaccer/design-system';

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <MdsEmptyState title={title} description={description} size="compressed">
      {children}
    </MdsEmptyState>
  );
}
