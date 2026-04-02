import { useState } from 'react';
import { Button, Text, Icon, Divider } from '@innovaccer/design-system';

// ── Types ─────────────────────────────────────────────────────────────────────
export type SingleOutcome =
  | 'approved'
  | 'denied'
  | 'additional_docs'
  | 'additional_questions'
  | 'contact_payer'
  | 'submission_error';

export type CptStatus =
  | 'pended'
  | 'approved'
  | 'denied'
  | 'additional_docs'
  | 'contact_payer'
  | 'submission_error';

interface CptInfo {
  cpt: string;
  title: string;
}

interface Props {
  orderType: 'prescription' | 'medical' | 'medical_multi';
  onSimulate?: (outcome: SingleOutcome) => void;
  cpts?: CptInfo[];
  onSimulateCpt?: (index: number, status: CptStatus) => void;
}

// ── SimulatorFloater ──────────────────────────────────────────────────────────
export default function SimulatorFloater({ orderType, onSimulate, cpts, onSimulateCpt }: Props) {
  const [open, setOpen] = useState(false);
  const isMulti = orderType === 'medical_multi';

  return (
    <div className="sim-floater">
      {/* Expandable panel */}
      {open && (
        <div className="sim-floater-panel">
          <Text size="small" weight="strong" className="d-block mb-4" appearance="subtle">
            Simulate payer response
          </Text>

          {isMulti && cpts ? (
            /* Per-CPT rows */
            cpts.map((cpt, i) => (
              <div key={cpt.cpt}>
                {i > 0 && <Divider className="my-4" />}
                <Text size="small" appearance="subtle" className="d-block mb-3">
                  {`CPT ${cpt.cpt}`}
                  <span style={{ marginLeft: 6, fontWeight: 400 }}>{cpt.title}</span>
                </Text>
                <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                  <Button size="tiny" onClick={() => onSimulateCpt?.(i, 'approved')}>
                    Approved
                  </Button>
                  <Button
                    size="tiny"
                    appearance="alert"
                    onClick={() => onSimulateCpt?.(i, 'denied')}
                  >
                    Denied
                  </Button>
                  <Button size="tiny" onClick={() => onSimulateCpt?.(i, 'additional_docs')}>
                    More Docs
                  </Button>
                  <Button size="tiny" onClick={() => onSimulateCpt?.(i, 'contact_payer')}>
                    Contact Payer
                  </Button>
                  <Button
                    size="tiny"
                    appearance="alert"
                    onClick={() => onSimulateCpt?.(i, 'submission_error')}
                  >
                    Error
                  </Button>
                </div>
              </div>
            ))
          ) : (
            /* Single decision row */
            <div className="d-flex flex-wrap" style={{ gap: 6 }}>
              <Button size="tiny" onClick={() => onSimulate?.('approved')}>
                Approved
              </Button>
              <Button size="tiny" appearance="alert" onClick={() => onSimulate?.('denied')}>
                Denied
              </Button>
              <Button size="tiny" onClick={() => onSimulate?.('additional_docs')}>
                More Docs
              </Button>
              {orderType === 'prescription' && (
                <Button size="tiny" onClick={() => onSimulate?.('additional_questions')}>
                  More Questions
                </Button>
              )}
              {orderType === 'medical' && (
                <Button size="tiny" onClick={() => onSimulate?.('contact_payer')}>
                  Contact Payer
                </Button>
              )}
              {orderType === 'medical' && (
                <Button
                  size="tiny"
                  appearance="alert"
                  onClick={() => onSimulate?.('submission_error')}
                >
                  Error
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Trigger pill */}
      <button
        className={`sim-floater-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="science" size={14} />
        <span>Simulate</span>
        <Icon name={open ? 'keyboard_arrow_down' : 'keyboard_arrow_up'} size={14} />
      </button>
    </div>
  );
}
