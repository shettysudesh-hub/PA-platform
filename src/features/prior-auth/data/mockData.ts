export interface Insurance {
  payer: string;
  planId: string;
  memberId: string;
  group: string;
  bin: string;
  pcn: string;
  planType: string;
}

export interface Patient {
  name: string;
  dob: string;
  mrn: string;
  gender: string;
  phone: string;
  insurance: Insurance;
}

export interface RxOrder {
  id: string;
  type: 'prescription';
  title: string;
  icd10: string;
  icd10Desc: string;
  provider: string;
  ndc: string;
  pharmacy: string;
  urgency: string;
  dose: string;
  copay: string;
  daySupply: string;
  patient: Patient;
  status?: string;
  daysOpen?: number;
}

export interface MedOrder {
  id: string;
  type: 'medical';
  title: string;
  cpt: string;
  icd10: string;
  icd10Desc: string;
  provider: string;
  facility: string;
  urgency: string;
  patient: Patient;
  status?: string;
  daysOpen?: number;
}

// ── Multi-CPT order types ────────────────────────────────────────────────────

export interface CptItem {
  cpt: string;
  title: string;
  icd10: string;
  icd10Desc: string;
  facility: string;
  suggestedPayer: string;
  suggestedChannel: 'electronic' | 'fax';
  faxNumber?: string;
}

export interface MultiCptOrder {
  id: string;
  type: 'medical_multi';
  title: string;
  provider: string;
  urgency: string;
  patient: Patient;
  status?: string;
  daysOpen?: number;
  cpts: CptItem[];
}

export type Order = RxOrder | MedOrder | MultiCptOrder;

export interface Question {
  id: string;
  q: string;
  ai: boolean;
  a: string;
  type?: 'textarea' | 'radio' | 'checkbox' | 'input' | 'dropdown';
  options?: string[];
  subFields?: { label: string; options: string[] }[];
}

export interface Doc {
  name: string;
  ext: string;
  auto: boolean;
}

export interface StepDef {
  id: string;
  label: string;
}

const PATIENT_RX: Patient = {
  name: 'Priya Menon',
  dob: '07/22/1985',
  mrn: 'MRN-00519382',
  gender: 'Female',
  phone: '(415) 231-6060',
  insurance: {
    payer: 'Aetna',
    planId: 'AET-HMO-2025',
    memberId: 'XWK6712034',
    group: 'GRP-51782',
    bin: '5197805',
    pcn: '5197805',
    planType: 'Medicare',
  },
};

const PATIENT_MED: Patient = {
  name: 'Rajesh Kapoor',
  dob: '03/14/1978',
  mrn: 'MRN-00482917',
  gender: 'Male',
  phone: '(212) 555-0147',
  insurance: {
    payer: 'Aetna',
    planId: 'AET-PPO-2025',
    memberId: 'XWK9831047',
    group: 'GRP-40291',
    bin: '—',
    pcn: '—',
    planType: 'PPO',
  },
};

export const ORDER_RX: RxOrder = {
  id: 'ORD-20260326-2031',
  type: 'prescription',
  title: 'Humira® (adalimumab) 40mg/0.8mL',
  icd10: 'M06.9',
  icd10Desc: 'Rheumatoid arthritis',
  provider: 'Dr. Vikram Patel',
  ndc: '0074-3799-02',
  pharmacy: 'CVS',
  urgency: 'Routine',
  dose: '40 mg / 0.4 mL pen q14d',
  copay: '$50.00 ($3.00/Day)',
  daySupply: '28 Days',
  patient: PATIENT_RX,
};

export const ORDER_MED: MedOrder = {
  id: 'ORD-20260326-1847',
  type: 'medical',
  title: 'MRI Brain w/ & w/o Contrast',
  cpt: '70553',
  icd10: 'G43.909',
  icd10Desc: 'Migraine, unspecified',
  provider: 'Dr. Anita Sharma',
  facility: 'City Imaging Center',
  urgency: 'Routine',
  patient: PATIENT_MED,
};

export const BIOSIMILARS = [
  {
    name: 'Hyrimoz (adalimumab-adaz)',
    covered: true,
    paRequired: false,
    copay: '$50.00 ($3.00/Day)',
    dose: '25 mg / 0.32 mL pen q14d',
    pharmacy: 'CVS',
    daySupply: '30 days',
  },
  {
    name: 'Cyltezo',
    covered: true,
    paRequired: null as null,
    copay: '$50.00 ($3.00/Day)',
    pharmacy: 'Mail order',
    daySupply: '',
    dose: '',
  },
];

export const MOCK_INSURANCES: Insurance[] = [
  {
    payer: 'Aetna',
    planId: 'AET-HMO-2025',
    memberId: 'XWK6712034',
    group: 'GRP-51782',
    bin: '5197805',
    pcn: '5197805',
    planType: 'Medicare',
  },
  {
    payer: 'Blue Cross Blue Shield',
    planId: 'BCBS-PPO-2025',
    memberId: 'BCB4521089',
    group: 'GRP-88201',
    bin: '610014',
    pcn: 'BCBSMA',
    planType: 'PPO',
  },
];

export const PHARMACIES: string[] = [
  'CVS',
  'Walgreens',
  'Rite Aid',
  'Mail Order',
  'Specialty Pharmacy',
];

export const PBM_QUESTIONS: Question[] = [
  {
    id: 'q1',
    ai: true,
    q: "What is the patient's diagnosis for this medication?",
    a: 'Rheumatoid arthritis',
    type: 'radio',
    options: [
      'Rheumatoid arthritis',
      'Psoriatic arthritis',
      "Crohn's disease",
      'Ulcerative colitis',
      'Hidradenitis suppurativa',
      'Other (specify)',
    ],
  },
  {
    id: 'q2',
    ai: true,
    q: 'Enter the ICD-10 code',
    a: 'M06.9',
    type: 'input',
  },
  {
    id: 'q3',
    ai: true,
    q: 'Has the patient tried and failed any preferred alternative(s) required by the plan?',
    a: 'Yes',
    type: 'radio',
    options: ['Yes', 'No'],
  },
  {
    id: 'q4',
    ai: true,
    q: 'Select drugs tried and failed (choose all that apply)',
    a: 'Methotrexate,Sulfasalazine',
    type: 'checkbox',
    options: ['Methotrexate', 'Sulfasalazine', 'Leflunomide', 'Other (specify)'],
  },
  {
    id: 'q5',
    ai: true,
    q: 'Requested dosing',
    a: '40 mg|Every 2 weeks',
    type: 'dropdown',
    subFields: [
      { label: 'Requested dosing strength', options: ['40 mg', '20 mg', '80 mg'] },
      {
        label: 'Requested dosing frequency',
        options: ['Every 2 weeks', 'Every 4 weeks', 'Weekly'],
      },
    ],
  },
  {
    id: 'q6',
    ai: true,
    q: 'Is this a new start or continuation of therapy?',
    a: 'Continuation',
    type: 'radio',
    options: ['New start', 'Continuation'],
  },
];

export const PBM_FOLLOWUP_QUESTIONS: Question[] = [
  {
    id: 'fq1',
    q: 'Please clarify the specific joints affected and current functional limitations.',
    ai: true,
    a: 'Bilateral MCP joints (2nd–4th), bilateral PIP joints, both wrists. HAQ-DI score: 1.75.',
  },
  {
    id: 'fq2',
    q: 'Has the patient been evaluated for latent tuberculosis within the last 12 months?',
    ai: true,
    a: 'QuantiFERON-TB Gold Plus — Negative. Test date: 2026-02-28.',
  },
  {
    id: 'fq3',
    q: "What is the patient's current weight and proposed dosing regimen?",
    ai: true,
    a: 'Weight: 68 kg. Proposed: Adalimumab 40mg SC every other week.',
  },
  {
    id: 'fq4',
    q: 'Has a shared decision-making conversation occurred regarding biologic therapy risks?',
    ai: false,
    a: '',
  },
];

export const RX_DOCS: Doc[] = [
  { name: 'Progress Note 2026-03-20', ext: '.pdf', auto: true },
  { name: 'Lab Results CBC CRP ESR', ext: '.pdf', auto: true },
  { name: 'X-Ray Hands Bilateral', ext: '.dcm', auto: true },
  { name: 'TB Screening QuantiFERON', ext: '.pdf', auto: true },
];

export const MED_DOCS: Doc[] = [
  { name: 'Clinical Notes Dr. Sharma', ext: '.pdf', auto: true },
  { name: 'Previous MRI Brain 2025', ext: '.dcm', auto: true },
  { name: 'Neurology Consult Note', ext: '.pdf', auto: true },
  { name: 'Headache Diary Log', ext: '.pdf', auto: false },
];

// ── Amit Deshmukh — Multi-CPT order ─────────────────────────────────────────

const PATIENT_AMIT: Patient = {
  name: 'Amit Deshmukh',
  dob: '11/03/1972',
  mrn: 'MRN-00437621',
  gender: 'Male',
  phone: '',
  insurance: {
    payer: 'UHC',
    planId: 'UHC-PPO-2025',
    memberId: 'UHC88231047',
    group: 'GRP-81204',
    bin: '—',
    pcn: '—',
    planType: 'PPO',
  },
};

export const AMIT_DOCS: Doc[] = [
  { name: 'Clinical Notes Dr. Singh', ext: '.pdf', auto: true },
  { name: 'Previous CT Abdomen 2025', ext: '.dcm', auto: true },
  { name: 'Chest X-Ray Report', ext: '.pdf', auto: true },
  { name: 'Previous MRI Brain 2024', ext: '.dcm', auto: true },
  { name: 'Lab Results CMP CBC', ext: '.pdf', auto: true },
  { name: 'Referral Note — Neurology', ext: '.pdf', auto: true },
];

export const ORDER_MULTI_CPT: MultiCptOrder = {
  id: 'ORD-20260326-0042',
  type: 'medical_multi',
  title: 'Multiple Imaging Studies (3 CPTs)',
  provider: 'Dr. R. Singh',
  urgency: 'Urgent',
  patient: PATIENT_AMIT,
  cpts: [
    {
      cpt: '74178',
      title: 'CT Abdomen & Pelvis with Contrast',
      icd10: 'R10.9',
      icd10Desc: 'Unspecified abdominal pain',
      facility: 'City Imaging Center',
      suggestedPayer: 'UHC',
      suggestedChannel: 'electronic',
    },
    {
      cpt: '71260',
      title: 'CT Chest with Contrast',
      icd10: 'R91.8',
      icd10Desc: 'Other nonspecific abnormal finding of lung',
      facility: 'City Imaging Center',
      suggestedPayer: 'UHC',
      suggestedChannel: 'electronic',
    },
    {
      cpt: '70553',
      title: 'MRI Brain w/ & w/o Contrast',
      icd10: 'G43.909',
      icd10Desc: 'Migraine, unspecified',
      facility: 'Advanced Neuro Imaging',
      suggestedPayer: 'NeuroCarve Inc.',
      suggestedChannel: 'fax',
      faxNumber: '1-888-555-0199',
    },
  ],
};

// ── PA Required Check results ───────────────────────────────────────────────
export interface PaCheckResult {
  cpt: string;
  title: string;
  icd10: string;
  icd10Desc: string;
  paRequired: boolean;
  reason: string;
  payerRule: string;
}

export const PA_CHECK_SINGLE: PaCheckResult[] = [
  {
    cpt: '70553',
    title: 'MRI Brain w/ & w/o Contrast',
    icd10: 'G43.909',
    icd10Desc: 'Migraine, unspecified',
    paRequired: true,
    reason: 'Advanced imaging requires prior authorization per plan policy',
    payerRule: 'Aetna Policy AIM-2025-MRI',
  },
];

export const PA_CHECK_MULTI: PaCheckResult[] = [
  {
    cpt: '74178',
    title: 'CT Abdomen & Pelvis with Contrast',
    icd10: 'R10.9',
    icd10Desc: 'Unspecified abdominal pain',
    paRequired: true,
    reason: 'CT with contrast requires PA for non-emergency indication',
    payerRule: 'UHC Policy RAD-2025-CT',
  },
  {
    cpt: '71260',
    title: 'CT Chest with Contrast',
    icd10: 'R91.8',
    icd10Desc: 'Other nonspecific abnormal finding of lung',
    paRequired: true,
    reason: 'CT with contrast requires PA for non-emergency indication',
    payerRule: 'UHC Policy RAD-2025-CT',
  },
  {
    cpt: '70553',
    title: 'MRI Brain w/ & w/o Contrast',
    icd10: 'G43.909',
    icd10Desc: 'Migraine, unspecified',
    paRequired: true,
    reason: 'Advanced imaging requires prior authorization per carve-out',
    payerRule: 'NeuroCarve Policy NCI-2025-MRI',
  },
];

export const WORKLIST: Order[] = [
  { ...ORDER_RX, status: 'New', daysOpen: 1 },
  { ...ORDER_MED, status: 'New', daysOpen: 0 },
  { ...ORDER_MULTI_CPT, status: 'New', daysOpen: 2 },
  {
    id: 'ORD-20260322-1102',
    type: 'prescription',
    title: 'Keytruda (pembrolizumab)',
    patient: {
      name: 'Sunita Rao',
      mrn: 'MRN-00561293',
      dob: '',
      gender: '',
      phone: '',
      insurance: {
        payer: 'Cigna',
        memberId: 'CIG2049182',
        planId: '',
        group: '',
        bin: '',
        pcn: '',
        planType: '',
      },
    },
    status: 'Approved',
    daysOpen: 5,
    provider: 'Dr. M. Khan',
    urgency: 'Urgent',
    ndc: '',
    pharmacy: '',
    dose: '',
    copay: '',
    daySupply: '',
    icd10: '',
    icd10Desc: '',
  } as RxOrder,
];

export const STEPS_RX: StepDef[] = [
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'pa_initiation', label: 'PA Initiation' },
  { id: 'packet_review', label: 'Packet Review' },
  { id: 'decision', label: 'Decision' },
];

export const STEPS_MED: StepDef[] = [
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'medical_necessity', label: 'Medical Necessity' },
  { id: 'packet_review', label: 'Packet Review' },
  { id: 'decision', label: 'Decision' },
];
