import { useQuery } from '@tanstack/react-query';
import { patientApi } from '../services/patientApi';

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientApi.getPatient(id),
    enabled: !!id,
  });
}
