import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@innovaccer/design-system';
import { Page } from '../../../components/app/Page';
import { PageHeader } from '../../../components/app/PageHeader';
import { LoadingState } from '../../../components/app/LoadingState';
import { PatientDetail } from '../components/PatientDetail';
import { PatientForm } from '../components/PatientForm';
import { ConfirmDialog } from '../../../components/patterns/ConfirmDialog';
import { usePatient } from '../hooks/usePatient';
import { useUpdatePatient, useDeletePatient } from '../hooks/usePatientMutation';
import type { PatientFormData } from '../types/patient';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id!);
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading || !patient) return <LoadingState />;

  const handleUpdate = (data: PatientFormData) => {
    updatePatient.mutate({ id: id!, data }, { onSuccess: () => setEditOpen(false) });
  };

  const handleDelete = () => {
    deletePatient.mutate(id!, {
      onSuccess: () => navigate('/patients'),
    });
  };

  return (
    <Page>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        showBackButton
        breadcrumbs={[
          { label: 'Home', link: '/' },
          { label: 'Patients', link: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}` },
        ]}
        actions={
          <div className="d-flex">
            <Button appearance="basic" onClick={() => setEditOpen(true)} className="mr-2">
              Edit
            </Button>
            <Button appearance="alert" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />
      <PatientDetail patient={patient} />
      <PatientForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        defaultValues={patient}
        isSubmitting={updatePatient.isPending}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Patient"
        description={`Are you sure you want to delete ${patient.firstName} ${patient.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        appearance="alert"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Page>
  );
}
