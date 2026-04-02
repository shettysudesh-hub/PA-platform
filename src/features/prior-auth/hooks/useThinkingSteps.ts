import { useState, useEffect, useRef } from 'react';

export interface ThinkingStepState {
  text: string;
  status: 'pending' | 'active' | 'done';
}

interface UseThinkingStepsOptions {
  steps: string[];
  delays?: number[]; // ms before each step appears (default 800ms)
  skipAnimation?: boolean; // skip animation, show collapsed accordion immediately
  onAllDone?: () => void;
}

export function useThinkingSteps({
  steps,
  delays,
  skipAnimation = false,
  onAllDone,
}: UseThinkingStepsOptions) {
  const [revealed, setRevealed] = useState(skipAnimation ? steps.length : 0);
  const [allDone, setAllDone] = useState(skipAnimation);
  const [expanded, setExpanded] = useState(false);
  const calledRef = useRef(false);

  useEffect(() => {
    if (skipAnimation) {
      if (!calledRef.current) {
        calledRef.current = true;
        onAllDone?.();
      }
      return;
    }

    if (steps.length === 0) {
      queueMicrotask(() => {
        setAllDone(true);
        if (!calledRef.current) {
          calledRef.current = true;
          onAllDone?.();
        }
      });
      return;
    }

    let cumDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((_, idx) => {
      cumDelay += delays?.[idx] ?? 800;
      const t = setTimeout(() => {
        setRevealed(idx + 1);
        if (idx === steps.length - 1) {
          // All steps visible — wait 500ms then collapse to accordion
          const t2 = setTimeout(() => {
            setAllDone(true);
            if (!calledRef.current) {
              calledRef.current = true;
              onAllDone?.();
            }
          }, 500);
          timers.push(t2);
        }
      }, cumDelay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, []); // intentionally run once on mount

  // Build step state array
  // - idx >= revealed: pending (not shown yet)
  // - idx === revealed-1 && !allDone: active (spinner)
  // - otherwise visible: done (checkmark)
  const stepStates: ThinkingStepState[] = steps.map((text, idx) => ({
    text,
    status: idx >= revealed ? 'pending' : allDone || idx < revealed - 1 ? 'done' : 'active',
  }));

  return {
    stepStates,
    allDone,
    expanded,
    toggleExpanded: () => setExpanded((p) => !p),
  };
}
