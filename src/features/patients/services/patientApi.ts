import { apiClient } from '../../../services/apiClient';
import type { Patient, PatientFormData } from '../types/patient';
import type { PaginatedResponse } from '../../../types';

interface GetPatientsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const patientApi = {
  getPatients: (params: GetPatientsParams = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 10));
    return apiClient.get<PaginatedResponse<Patient>>(`/patients?${query}`);
  },
  getPatient: (id: string) => apiClient.get<Patient>(`/patients/${id}`),
  createPatient: (data: PatientFormData) => apiClient.post<Patient>('/patients', data),
  updatePatient: (id: string, data: PatientFormData) =>
    apiClient.put<Patient>(`/patients/${id}`, data),
  deletePatient: (id: string) => apiClient.delete<void>(`/patients/${id}`),
};
