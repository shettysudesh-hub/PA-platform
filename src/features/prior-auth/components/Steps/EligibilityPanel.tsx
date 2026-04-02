import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  LinkButton,
  Text,
  Radio,
  Message,
  Card,
  StatusHint,
} from '@innovaccer/design-system';
import { BIOSIMILARS, MOCK_INSURANCES } from '../../data/mockData';
import type { Order, RxOrder, Insurance } from '../../data/mockData';

type WizardStep = 'insurance' | 'medication' | 'pharmacy';
type VerifyState = 'idle' | 'verifying' | 'verified';

interface Props {
  order: Order;
  insActive: boolean;
  isCompleted?: boolean; // step is done — always show confirmed view
  locked?: boolean; // packet submitted — hide update buttons too
  onContinue: (selIndex: number) => void;
}

const PHARMACY_OPTIONS = ['CVS', 'Mail Order'];

// ── Extracted sub-components (must live outside render to avoid re-creation) ──

interface MedOption {
  label: string;
  sub: string;
  paTag: string | null;
  paAppearance: 'success' | 'warning';
  copay: string;
  dose: string;
  daySupply: string;
  pharmacy: string;
}

function InsDetailGrid({ ins }: { ins: Insurance }) {
  return (
    <div className="elig-detail-grid">
      {/* Left column */}
      <div className="elig-detail-col">
        <div className="elig-detail-row">
          <span className="elig-detail-label">BIN</span>
          <Text size="small" weight="medium">
            {ins.bin}
          </Text>
        </div>
        <div className="elig-detail-row">
          <span className="elig-detail-label">Group</span>
          <Text size="small" weight="medium">
            {ins.group}
          </Text>
        </div>
        <div className="elig-detail-row">
          <span className="elig-detail-label">Plan ID</span>
          <Text size="small" weight="medium">
            {ins.planId}
          </Text>
        </div>
        <div className="elig-detail-row">
          <span className="elig-detail-label">Plan Type</span>
          <Text size="small" weight="medium">
            {ins.planType}
          </Text>
        </div>
      </div>
      {/* Right column */}
      <div className="elig-detail-col">
        <div className="elig-detail-row">
          <span className="elig-detail-label elig-detail-label--wide">Policy / Member ID</span>
          <Text size="small" weight="medium">
            {ins.memberId}
          </Text>
        </div>
        <div className="elig-detail-row">
          <span className="elig-detail-label elig-detail-label--wide">PCN</span>
          <Text size="small" weight="medium">
            {ins.pcn}
          </Text>
        </div>
      </div>
    </div>
  );
}

function MedDetailGrid({ opt, indent }: { opt: MedOption; indent?: boolean }) {
  return (
    <div className={indent ? 'elig-radio-indent' : ''}>
      {/* Coverage status + PA tag */}
      {(opt.sub || opt.paTag) && (
        <div className="d-flex align-items-center mb-4" style={{ gap: 'var(--spacing-30)' }}>
          {opt.sub && (
            <Text size="small" appearance="subtle">
              {opt.sub}
            </Text>
          )}
          {opt.paTag && (
            <StatusHint appearance={opt.paAppearance}>{opt.paTag.toUpperCase()}</StatusHint>
          )}
        </div>
      )}
      {/* Detail columns */}
      <div className="elig-detail-grid-sm">
        <div className="elig-detail-col">
          {opt.copay && (
            <div className="elig-detail-row">
              <span className="elig-detail-label">Copay</span>
              <Text size="small" weight="medium">
                {opt.copay}
              </Text>
            </div>
          )}
          {opt.dose && (
            <div className="elig-detail-row">
              <span className="elig-detail-label">Dose</span>
              <Text size="small" weight="medium">
                {opt.dose}
              </Text>
            </div>
          )}
        </div>
        <div className="elig-detail-col">
          {opt.pharmacy && (
            <div className="elig-detail-row">
              <span className="elig-detail-label">Pharmacy</span>
              <Text size="small" weight="medium">
                {opt.pharmacy}
              </Text>
            </div>
          )}
          {opt.daySupply && (
            <div className="elig-detail-row">
              <span className="elig-detail-label">Day Supply</span>
              <Text size="small" weight="medium">
                {opt.daySupply}
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EligibilityPanel({
  order,
  insActive,
  isCompleted = false,
  locked = false,
  onContinue,
}: Props) {
  const [activeStep, setActiveStep] = useState<WizardStep>('insurance');
  const [insVerify, setInsVerify] = useState<VerifyState>('idle');
  const [medVerify, setMedVerify] = useState<VerifyState>('idle');
  const [selectedInsIdx, setSelectedInsIdx] = useState(0);
  const [selectedMedIdx, setSelectedMedIdx] = useState(0);
  const [selectedPharmacyIdx, setSelectedPharmacyIdx] = useState(0);
  const [pharmacyConfirmed, setPharmacyConfirmed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const isRx = order.type === 'prescription';
  const advancedRef = useRef(false);

  // ── Medical auto-verify: start verification on mount, auto-advance if active ──
  const startMedicalVerification = useCallback(() => {
    queueMicrotask(() => setInsVerify('verifying'));
    setTimeout(() => {
      setInsVerify('verified');
      if (insActive) {
        setTimeout(() => {
          if (!advancedRef.current) {
            advancedRef.current = true;
            onContinue(0);
          }
        }, 800);
      }
    }, 2000);
  }, [insActive, onContinue]);

  useEffect(() => {
    if (!isRx && !isCompleted && !locked) {
      startMedicalVerification();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When the step is completed (moved to next step), always show the confirmed
  // summary regardless of internal activeStep — fixes the medical case where
  // activeStep stays 'insurance' after onContinue() is called.
  const forceConfirmed = isCompleted || locked;

  const medOptions: MedOption[] = isRx
    ? [
        {
          label: `Continue with ${order.title}`,
          sub: 'Covered with restrictions',
          paTag: 'PA Required' as string | null,
          paAppearance: 'warning' as const,
          copay: (order as RxOrder).copay,
          dose: (order as RxOrder).dose,
          daySupply: (order as RxOrder).daySupply,
          pharmacy: (order as RxOrder).pharmacy || 'CVS',
        },
        ...BIOSIMILARS.map((b) => ({
          label: `Switch to ${b.name}`,
          sub: b.covered ? 'Covered' : 'Not covered',
          paTag:
            b.paRequired === false
              ? 'No PA Required'
              : b.paRequired === null
                ? null
                : 'PA Required',
          paAppearance: (b.paRequired === false ? 'success' : 'warning') as 'success' | 'warning',
          copay: b.copay,
          dose: b.dose,
          daySupply: b.daySupply,
          pharmacy: b.pharmacy,
        })),
      ]
    : [];

  // ── Card border helpers ───────────────────────────────────────────────────

  const selectionBorder = (selected: boolean): React.CSSProperties =>
    selected
      ? { border: '2px solid var(--primary)' }
      : { border: '1px solid var(--secondary-light)' };

  const verifyMedication = () => {
    setMedVerify('verifying');
    setTimeout(() => {
      setMedVerify('verified');
      // Auto-advance to pharmacy regardless of PA status —
      // PA Required isn't a blocker here, it just informs the user
      setTimeout(() => setActiveStep('pharmacy'), 350);
    }, 1500);
  };

  // ── Sync from EHR — re-pulls insurance data, resets verification ────────────
  const handleSyncFromEHR = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setInsVerify('idle');
      if (!isRx) {
        // Medical: auto-restart verification after sync
        advancedRef.current = false;
        startMedicalVerification();
      }
    }, 1500);
  };

  // ── Update handlers — reopen a step and reset downstream state ────────────

  const handleUpdateInsurance = () => {
    setInsVerify('idle');
    setMedVerify('idle'); // insurance change may affect formulary coverage
    setPharmacyConfirmed(false); // downstream: pharmacy choice may change too
    setActiveStep('insurance');
  };

  const handleUpdateMedication = () => {
    setMedVerify('idle');
    setPharmacyConfirmed(false);
    setActiveStep('medication');
  };

  const handleUpdatePharmacy = () => {
    setPharmacyConfirmed(false);
  };

  // Shortcuts
  const selectedIns = MOCK_INSURANCES[selectedInsIdx];
  const selectedMed = medOptions[selectedMedIdx];

  // ─────────────────────────────────────────────────────────────────────────
  // Sub-renders — keeps JSX readable
  // ─────────────────────────────────────────────────────────────────────────

  // ── Insurance / Medication detail grids are defined above (module level) ──

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="center-panel">
      {/* Flex-column gap between sub-sections — gap only applies between
          rendered children, so the last section never adds bottom margin */}
      <div className="d-flex flex-column" style={{ gap: 'var(--spacing-60)' }}>
        {/* ════════════════════════════════════════════════════════════════════
          STEP 1 — Insurance
          ════════════════════════════════════════════════════════════════════ */}

        <div>
          <Text appearance="subtle" className="d-block mb-2">
            {isRx ? '1. Select Insurance' : '1. Insurance Details'}
          </Text>

          {/* ── SELECTION MODE (idle / verifying) ──────────────────────────── */}
          {activeStep === 'insurance' && !forceConfirmed && (
            <>
              {isRx ? (
                /* ── Rx: multi-plan selection + Continue button ───────────── */
                <>
                  <Text size="small" appearance="subtle" className="d-block mb-6">
                    {MOCK_INSURANCES.length > 1
                      ? 'Multiple plans on file — select one to continue.'
                      : 'One insurance plan found.'}
                  </Text>

                  {!insActive && (
                    <Message
                      appearance="alert"
                      title="Insurance Inactive or Not Found"
                      description="We couldn't verify active coverage for this member. Update insurance details in your EHR, then sync here to pull latest data and try again."
                      className="mb-5"
                    />
                  )}

                  <div className="d-flex flex-column mb-6" style={{ gap: 'var(--spacing-40)' }}>
                    {MOCK_INSURANCES.map((ins, i) => (
                      <div key={i} className="elig-card-wrap" onClick={() => setSelectedInsIdx(i)}>
                        <Card
                          shadow="none"
                          className="p-5"
                          style={selectionBorder(selectedInsIdx === i)}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-5">
                            <Radio
                              name="insurance-select"
                              value={String(i)}
                              checked={selectedInsIdx === i}
                              onChange={() => setSelectedInsIdx(i)}
                              label={ins.payer}
                            />
                            {insActive ? (
                              <StatusHint appearance="success">Active</StatusHint>
                            ) : (
                              <StatusHint appearance="alert">Inactive</StatusHint>
                            )}
                          </div>
                          <InsDetailGrid ins={ins} />
                        </Card>
                      </div>
                    ))}
                  </div>

                  {insActive && (
                    <Button
                      size="tiny"
                      appearance="primary"
                      onClick={() => setActiveStep('medication')}
                    >
                      Continue
                    </Button>
                  )}
                </>
              ) : (
                /* ── Medical: auto-verify, single result ─────────────────── */
                <>
                  {/* Loading state */}
                  {insVerify !== 'verified' && (
                    <>
                      <Text size="small" appearance="subtle" className="d-block mb-4">
                        Verified from member records
                      </Text>
                      <Card shadow="none" className="p-5">
                        <Text appearance="subtle">Verifying insurance details…</Text>
                      </Card>
                    </>
                  )}

                  {/* Active result */}
                  {insVerify === 'verified' && insActive && (
                    <>
                      <Text size="small" appearance="subtle" className="d-block mb-4">
                        Verified from member records
                      </Text>
                      <Card
                        shadow="none"
                        className="p-5"
                        style={{ border: '1px solid var(--secondary-light)' }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-5">
                          <Text weight="medium">{selectedIns.payer}</Text>
                          <StatusHint appearance="success">Active Insurance</StatusHint>
                        </div>
                        <InsDetailGrid ins={selectedIns} />
                      </Card>
                    </>
                  )}

                  {/* Inactive result — blocks progression */}
                  {insVerify === 'verified' && !insActive && (
                    <>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <Text size="small" appearance="subtle">
                          Verified from member records
                        </Text>
                        <LinkButton
                          size="tiny"
                          icon="sync"
                          iconAlign="left"
                          disabled={isSyncing}
                          onClick={handleSyncFromEHR}
                        >
                          {isSyncing ? 'Syncing…' : 'Sync from EHR'}
                        </LinkButton>
                      </div>
                      <Message
                        appearance="alert"
                        title="Insurance Inactive or Not Found"
                        description="We couldn't verify active coverage for this member. Update the insurance details in your EHR, then sync here to pull the latest data and try again."
                        className="mb-5"
                      />
                      <Card
                        shadow="none"
                        className="p-5"
                        style={{ border: '1px solid var(--secondary-light)' }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-5">
                          <Text weight="medium">{selectedIns.payer}</Text>
                          <StatusHint appearance="alert">Inactive</StatusHint>
                        </div>
                        <InsDetailGrid ins={selectedIns} />
                      </Card>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* ── CONFIRMED MODE (past insurance step OR step completed) ─────── */}
          {(activeStep !== 'insurance' || forceConfirmed) &&
            (insVerify === 'verified' || forceConfirmed) && (
              <>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <Text size="small" appearance="subtle">
                    {isRx
                      ? MOCK_INSURANCES.length > 1
                        ? 'Multiple plans on file — select one and verify coverage to continue.'
                        : 'One insurance plan found — verify coverage to continue.'
                      : 'Verified from member records'}
                    {syncedAt && <span style={{ marginLeft: 6 }}>· Synced at {syncedAt}</span>}
                  </Text>
                  {isRx && (
                    <LinkButton
                      size="tiny"
                      icon="sync"
                      iconAlign="left"
                      disabled={isSyncing}
                      onClick={handleSyncFromEHR}
                    >
                      {isSyncing ? 'Syncing…' : 'Sync from EHR'}
                    </LinkButton>
                  )}
                </div>
                <div className="mb-5">
                  <Card
                    shadow="none"
                    className="p-5"
                    style={{ border: '1px solid var(--secondary-light)' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-5">
                      <Text weight="medium">{selectedIns.payer}</Text>
                      {insActive ? (
                        <StatusHint appearance="success">Active Insurance</StatusHint>
                      ) : (
                        <StatusHint appearance="alert">Inactive</StatusHint>
                      )}
                    </div>
                    <InsDetailGrid ins={selectedIns} />
                  </Card>
                </div>
                {!locked && isRx && (
                  <Button size="tiny" appearance="basic" onClick={handleUpdateInsurance}>
                    Update Insurance
                  </Button>
                )}
              </>
            )}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
          STEP 2 — Medication / Biosimilar (Rx only)
          ════════════════════════════════════════════════════════════════════ */}

        {isRx && (activeStep !== 'insurance' || forceConfirmed) && (
          <div>
            <Text appearance="subtle" className="d-block mb-2">
              2. Select bio-similar alternatives
            </Text>

            {/* ── SELECTION MODE ─────────────────────────────────────────────── */}
            {activeStep === 'medication' && !forceConfirmed && (
              <>
                <Text size="small" appearance="subtle" className="d-block mb-6">
                  Multiple alternatives found
                </Text>

                <div className="d-flex flex-column mb-6" style={{ gap: 'var(--spacing-40)' }}>
                  {medOptions.map((opt, i) => (
                    <div
                      key={i}
                      className="elig-card-wrap"
                      onClick={() => medVerify === 'idle' && setSelectedMedIdx(i)}
                    >
                      <Card
                        shadow="none"
                        className="p-5"
                        style={selectionBorder(selectedMedIdx === i)}
                      >
                        <div className="mb-3">
                          <Radio
                            name="med-select"
                            value={String(i)}
                            checked={selectedMedIdx === i}
                            onChange={() => setSelectedMedIdx(i)}
                            label={opt.label}
                          />
                        </div>
                        <MedDetailGrid opt={opt} indent />
                      </Card>
                    </div>
                  ))}
                </div>

                <Button
                  size="tiny"
                  appearance="primary"
                  disabled={medVerify === 'verifying'}
                  onClick={verifyMedication}
                >
                  {medVerify === 'verifying' ? 'Verifying…' : 'Continue'}
                </Button>
              </>
            )}

            {/* ── CONFIRMED MODE ─────────────────────────────────────────────── */}
            {(activeStep === 'pharmacy' || forceConfirmed) &&
              (medVerify === 'verified' || forceConfirmed) && (
                <>
                  <div className="mb-5">
                    <Card
                      shadow="none"
                      className="p-5"
                      style={{ border: '1px solid var(--secondary-light)' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <Text weight="medium">
                          {selectedMed.label
                            .replace('Continue with ', '')
                            .replace('Switch to ', '')}
                        </Text>
                        {selectedMed.paTag && (
                          <StatusHint appearance={selectedMed.paAppearance}>
                            {selectedMed.paTag.toUpperCase()}
                          </StatusHint>
                        )}
                      </div>
                      <MedDetailGrid opt={selectedMed} />
                    </Card>
                  </div>
                  {!locked && (
                    <Button size="tiny" appearance="basic" onClick={handleUpdateMedication}>
                      Update Medication
                    </Button>
                  )}
                </>
              )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
          STEP 3 — Pharmacy (Rx only)
          ════════════════════════════════════════════════════════════════════ */}

        {isRx && (activeStep === 'pharmacy' || forceConfirmed) && (
          <div>
            <Text appearance="subtle" className="d-block mb-2">
              3. Select Pharmacy
            </Text>

            {/* ── SELECTION MODE ─────────────────────────────────────────────── */}
            {!pharmacyConfirmed && !forceConfirmed && (
              <>
                <Text size="small" appearance="subtle" className="d-block mb-6">
                  Select your preferred pharmacy
                </Text>

                <div className="d-flex flex-column mb-6" style={{ gap: 'var(--spacing-40)' }}>
                  {PHARMACY_OPTIONS.map((ph, i) => (
                    <div
                      key={i}
                      className="elig-card-wrap"
                      onClick={() => setSelectedPharmacyIdx(i)}
                    >
                      <Card
                        shadow="none"
                        className="p-5"
                        style={selectionBorder(selectedPharmacyIdx === i)}
                      >
                        <Radio
                          name="pharmacy-select"
                          value={String(i)}
                          checked={selectedPharmacyIdx === i}
                          onChange={() => setSelectedPharmacyIdx(i)}
                          label={ph}
                        />
                      </Card>
                    </div>
                  ))}
                </div>

                <Button
                  size="tiny"
                  appearance="primary"
                  onClick={() => {
                    setPharmacyConfirmed(true);
                    onContinue(selectedMedIdx);
                  }}
                >
                  Continue
                </Button>
              </>
            )}

            {/* ── CONFIRMED MODE ─────────────────────────────────────────────── */}
            {(pharmacyConfirmed || forceConfirmed) && (
              <>
                <div className="mb-5">
                  <Card
                    shadow="none"
                    className="p-5"
                    style={{ border: '1px solid var(--secondary-light)' }}
                  >
                    <Text weight="medium">{PHARMACY_OPTIONS[selectedPharmacyIdx]}</Text>
                  </Card>
                </div>
                {!locked && (
                  <Button size="tiny" appearance="basic" onClick={handleUpdatePharmacy}>
                    Update Pharmacy
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {/* end flex-column gap wrapper */}
    </div>
  );
}
