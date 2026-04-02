import type { Criterion } from '../data/medicalNecessity';

export function computeMedNecessityOutcome(criteria: Criterion[]): { text: string; state: string } {
  let fail = 0,
    pending = 0;
  const count = (items: Criterion[]) => {
    items.forEach((c) => {
      if (c.status === 'fail') fail++;
      else if (c.status === 'pending') pending++;
      if (c.children) count(c.children);
    });
  };
  count(criteria);
  if (fail === 0 && pending === 0) return { text: 'Fully met', state: 'done' };
  if (fail > 0) return { text: `${fail} not met`, state: 'blocked' };
  if (pending > 0) return { text: `${pending} pending`, state: 'done' };
  return { text: 'Reviewed', state: 'done' };
}
