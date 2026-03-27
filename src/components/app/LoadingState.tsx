import { Spinner } from '@innovaccer/design-system';

export function LoadingState() {
  return (
    <div className="d-flex justify-content-center py-8">
      <Spinner size="large" />
    </div>
  );
}
