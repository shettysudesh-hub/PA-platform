import { useState } from 'react';
import { SidebarLayout } from '../../../components/app/SidebarLayout';
import { PatientList } from '../components/PatientList';
import { PatientForm } from '../components/PatientForm';
import { useCreatePatient } from '../hooks/usePatientMutation';
import type { PatientFormData } from '../types/patient';

const patientNavMenus = [
  {
    name: 'my-current-patients',
    label: 'My current patients',
    icon: 'check_circle',
    group: 'PATIENT LIST',
    count: 15,
  },
  {
    name: 'my-past-patients',
    label: 'My past patients',
    icon: 'history',
    group: 'PATIENT LIST',
    count: 6,
  },
  {
    name: 'diabetes-patients',
    label: 'Diabetes patients',
    icon: 'list',
    group: 'CUSTOM LISTS',
  },
];

export function PatientsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const createPatient = useCreatePatient();

  const handleCreate = (data: PatientFormData) => {
    createPatient.mutate(data, {
      onSuccess: () => setFormOpen(false),
    });
  };

  return (
    <SidebarLayout menus={patientNavMenus}>
      <PatientList onAdd={() => setFormOpen(true)} />
      <PatientForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createPatient.isPending}
      />
    </SidebarLayout>
  );
}
