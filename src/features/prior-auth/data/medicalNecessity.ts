export interface Criterion {
  id: string;
  text: string;
  status: 'pass' | 'fail' | 'pending' | 'review';
  doc?: string | null;
  children?: Criterion[];
}

export interface MedNecessityData {
  guideline: string;
  guidelineEditable: boolean;
  criteria: Criterion[];
  docsGathered: number;
  docsTotal: number;
}

export const MED_NECESSITY: MedNecessityData = {
  guideline: 'Hemifacial Spasm / Chronic Migraine',
  guidelineEditable: true,
  criteria: [
    {
      id: 'c3a',
      text: 'Verify existence of Prior Imaging (MRI/CT)',
      status: 'pass',
      doc: 'Previous MRI Brain 2025.dcm',
    },
    { id: 'c3b', text: 'Verify existence of Neurology Consult', status: 'fail', doc: null },
    {
      id: 'c3c',
      text: 'At least one of the criteria needs to be met',
      status: 'review',
      children: [
        {
          id: 'c3c1',
          text: 'Failed conservative treatment (within last 180 days)',
          status: 'pass',
          doc: 'Clinical Notes Dr. Sharma.pdf',
        },
        { id: 'c3c2', text: 'Documented neurological deficit', status: 'pending', doc: null },
      ],
    },
  ],
  docsGathered: 3,
  docsTotal: 4,
};

// ── After re-review with added Neurology Consult doc — all criteria pass ──────
export const MED_NECESSITY_REVIEWED: MedNecessityData = {
  guideline: 'Hemifacial Spasm / Chronic Migraine',
  guidelineEditable: true,
  criteria: [
    {
      id: 'c3a',
      text: 'Verify existence of Prior Imaging (MRI/CT)',
      status: 'pass',
      doc: 'Previous MRI Brain 2025.dcm',
    },
    {
      id: 'c3b',
      text: 'Verify existence of Neurology Consult',
      status: 'pass',
      doc: 'Neurology Consult Note.pdf',
    },
    {
      id: 'c3c',
      text: 'At least one of the criteria needs to be met',
      status: 'pass',
      children: [
        {
          id: 'c3c1',
          text: 'Failed conservative treatment (within last 180 days)',
          status: 'pass',
          doc: 'Clinical Notes Dr. Sharma.pdf',
        },
        {
          id: 'c3c2',
          text: 'Documented neurological deficit',
          status: 'pass',
          doc: 'Neurology Consult Note.pdf',
        },
      ],
    },
  ],
  docsGathered: 4,
  docsTotal: 4,
};
