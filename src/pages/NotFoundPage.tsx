import { EmptyState } from '@innovaccer/design-system';
import { Link } from 'react-router';
import { Page } from '../components/app/Page';

export function NotFoundPage() {
  return (
    <Page>
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist."
        size="large"
      >
        <Link to="/">Go Home</Link>
      </EmptyState>
    </Page>
  );
}
