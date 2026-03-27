import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../store/useToastStore';
import { patientApi } from '../services/patientApi';
import type { PatientFormData } from '../types/patient';

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientFormData) => patientApi.createPatient(data),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.add({
        title: 'Patient created',
        appearance: 'success',
        message: `${patient.firstName} ${patient.lastName} has been added.`,
      });
    },
    onError: () => {
      toast.add({
        title: 'Error',
        appearance: 'alert',
        message: 'Failed to create patient.',
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientFormData }) =>
      patientApi.updatePatient(id, data),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.add({
        title: 'Patient updated',
        appearance: 'success',
        message: `${patient.firstName} ${patient.lastName} has been updated.`,
      });
    },
    onError: () => {
      toast.add({
        title: 'Error',
        appearance: 'alert',
        message: 'Failed to update patient.',
      });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientApi.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.add({
        title: 'Patient deleted',
        appearance: 'success',
        message: 'Patient has been removed.',
      });
    },
    onError: () => {
      toast.add({
        title: 'Error',
        appearance: 'alert',
        message: 'Failed to delete patient.',
      });
    },
  });
}
