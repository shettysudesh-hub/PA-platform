import { http, HttpResponse } from 'msw';
import type { Patient } from '../../features/patients/types/patient';
import { patients } from '../data/patients';

export const patientHandlers = [
  // GET /api/patients — paginated list with search/filter
  http.get('/api/patients', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const status = url.searchParams.get('status') ?? '';
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '10');

    let filtered = [...patients];
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(search) || p.lastName.toLowerCase().includes(search),
      );
    }
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data: paginated,
      total: filtered.length,
      page,
      limit,
    });
  }),

  // GET /api/patients/:id
  http.get('/api/patients/:id', ({ params }) => {
    const patient = patients.find((p) => p.id === params.id);
    if (!patient) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(patient);
  }),

  // POST /api/patients
  http.post('/api/patients', async ({ request }) => {
    const body = (await request.json()) as Omit<
      Patient,
      | 'id'
      | 'empi'
      | 'assignedDate'
      | 'ongoingActivity'
      | 'keyDiagnosis'
      | 'riskInfo'
      | 'conditions'
      | 'encounters'
      | 'careTeam'
    >;
    const newPatient: Patient = {
      ...body,
      id: crypto.randomUUID(),
      empi: `P${Math.floor(100000 + Math.random() * 900000)}`,
      assignedDate: new Date().toLocaleDateString('en-US'),
      conditions: [],
      encounters: [],
      careTeam: [],
    };
    patients.unshift(newPatient);
    return HttpResponse.json(newPatient, { status: 201 });
  }),

  // PUT /api/patients/:id
  http.put('/api/patients/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const index = patients.findIndex((p) => p.id === params.id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    patients[index] = { ...patients[index], ...body };
    return HttpResponse.json(patients[index]);
  }),

  // DELETE /api/patients/:id
  http.delete('/api/patients/:id', ({ params }) => {
    const index = patients.findIndex((p) => p.id === params.id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    patients.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
