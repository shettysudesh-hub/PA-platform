import { createBrowserRouter } from 'react-router';
import { ROUTES } from './routes';
import { AppLayout } from '../layouts/AppLayout';
import { HomePage } from '../../pages/HomePage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { FormExamplePage } from '../../pages/FormExamplePage';
import { PatientsPage } from '../../features/patients/pages/PatientsPage';
import { PatientDetailPage } from '../../features/patients/pages/PatientDetailPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.PATIENTS, element: <PatientsPage /> },
      { path: ROUTES.PATIENT_DETAIL, element: <PatientDetailPage /> },
      { path: ROUTES.FORM_EXAMPLE, element: <FormExamplePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
