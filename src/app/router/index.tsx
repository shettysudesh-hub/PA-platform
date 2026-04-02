import { createBrowserRouter } from 'react-router';
import PriorAuthPage from '../../features/prior-auth/pages/PriorAuthPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PriorAuthPage />,
  },
  {
    path: '*',
    element: <PriorAuthPage />,
  },
]);
