import { z } from 'zod';

export const conditionSchema = z.object({
  name: z.string(),
  status: z.enum(['Active', 'Resolved']),
  diagnosedDate: z.string(),
});

export const encounterSchema = z.object({
  date: z.string(),
  type: z.string(),
  provider: z.string(),
  summary: z.string(),
});

export const careTeamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
});

export const ongoingActivitySchema = z.object({
  name: z.string(),
  count: z.number().optional(),
});

export const keyDiagnosisSchema = z.object({
  name: z.string(),
  icdCode: z.string(),
  count: z.number().optional(),
});

export const riskInfoSchema = z.object({
  model: z.string(),
  score: z.number(),
  level: z.enum(['L', 'M', 'H']),
  additionalCount: z.number().optional(),
});

export const patientSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  empi: z.string(),
  status: z.enum(['Active', 'Inactive']),
  riskScore: z.enum(['Low', 'Medium', 'High']),
  assignedDate: z.string(),
  ongoingActivity: ongoingActivitySchema.optional(),
  keyDiagnosis: keyDiagnosisSchema.optional(),
  riskInfo: riskInfoSchema.optional(),
  conditions: z.array(conditionSchema),
  encounters: z.array(encounterSchema),
  careTeam: z.array(careTeamMemberSchema),
});

export const patientFormSchema = patientSchema.omit({
  id: true,
  empi: true,
  assignedDate: true,
  ongoingActivity: true,
  keyDiagnosis: true,
  riskInfo: true,
  conditions: true,
  encounters: true,
  careTeam: true,
});

export type Patient = z.infer<typeof patientSchema>;
export type PatientFormData = z.infer<typeof patientFormSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type Encounter = z.infer<typeof encounterSchema>;
export type CareTeamMember = z.infer<typeof careTeamMemberSchema>;
