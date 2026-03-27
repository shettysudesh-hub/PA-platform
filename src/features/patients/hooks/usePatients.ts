import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { patientApi } from '../services/patientApi';

interface UsePatientsParams {
  search?: string;
  status?: string;
  page?: number;
}

export function usePatients({ search, status, page = 1 }: UsePatientsParams = {}) {
  return useQuery({
    queryKey: ['patients', { search, status, page }],
    queryFn: () => patientApi.getPatients({ search, status, page }),
    placeholderData: keepPreviousData,
  });
}
