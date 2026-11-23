import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Check, RefreshCw } from 'lucide-react';
import { UI_TEXT } from '../i18n/translations';
import { useTrip } from '../store/TripContext';

type PtrPhase = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'done';

const DEAD_ZONE = 14;
const THRESHOLD = 58;
const MAX_PULL = 86;
const MIN_REFRESH_MS = 450;
const DONE_VISIBLE_MS = 700;

function shouldIgnoreTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (
    target.closest(
      '.leaflet-container, [role="dialog"], input, textarea, select, [data-no-ptr]'
    )
  ) {
    return true;
  }

  // If the touch begins inside a vertically scrollable container that isn't at its top, ignore.
  let el: Element | null = target;
  while (el && el !== document.body && el !== document.documentElement) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      el.scrollHeight > el.clientHeight + 2 &&
      el.scrollTop > 0
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

interface PullToRefreshProps {
  enabled: boolean;
}

export function PullToRefresh({ enabled }: PullToRefreshProps) {
  const { lang, refreshCurrentView } = useTrip();
  const t = UI_TEXT[lang];

  const [phase, setPhase] = useState<PtrPhase>('idle');
  const [pullDistance, setPullDistance] = useState(0);

  const phaseRef = useRef<PtrPhase>('idle');
  phaseRef.current = phase;
  const pullRef = useRef(0);
  pullRef.current = pullDistance;

  const refreshRef = useRef(refreshCurrentView);
  refreshRef.current = refreshCurrentView;

  const trackingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const doneTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      trackingRef.current = false;
      setPhase('idle');
      setPullDistance(0);
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (phaseRef.current === 'refreshing') return;
      if (e.touches.length !== 1) return;
      if (window.scrollY > 1) return;
      if (shouldIgnoreTarget(e.target)) return;

      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      trackingRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!trackingRef.current) return;
      if (e.touches.length !== 1) {
        trackingRef.current = false;
        setPhase('idle');
        setPullDistance(0);
        return;
      }

      if (window.scrollY > 1) {
        trackingRef.current = false;
        setPhase('idle');
        setPullDistance(0);
        return;
      }

      const touch = e.touches[0];
      const dx = touch.clientX - startXRef.current;
      const dy = touch.clientY - startYRef.current;

      // Cancel if user is swiping up or horizontally (e.g. day pills)
      if (dy <= 0 || (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.1)) {
        if (pullRef.current === 0) {
          trackingRef.current = false;
        }
        return;
      }

      if (dy < DEAD_ZONE) return;

      // Prevent browser's native pull-to-refresh reload
      if (e.cancelable) {
        e.preventDefault();
      }

      if (doneTimerRef.current) {
        window.clearTimeout(doneTimerRef.current);
        doneTimerRef.current = null;
      }

      // Smooth rubber-band damping
      const raw = (dy - DEAD_ZONE) * 0.46;
      const damped = Math.min(MAX_PULL, raw);
      setPullDistance(damped);
      setPhase(damped >= THRESHOLD ? 'ready' : 'pulling');
    };

    const finishGesture = () => {
      if (!trackingRef.current) return;
      trackingRef.current = false;

      if (phaseRef.current === 'ready') {
        setPhase('refreshing');
        setPullDistance(50);

        const startedAt = Date.now();
        void refreshRef
          .current()
          .catch(() => undefined)
          .finally(() => {
            const elapsed = Date.now() - startedAt;
            const remaining = Math.max(0, MIN_REFRESH_MS - elapsed);
            window.setTimeout(() => {
              setPhase('done');
              doneTimerRef.current = window.setTimeout(() => {
                setPhase('idle');
                setPullDistance(0);
                doneTimerRef.current = null;
              }, DONE_VISIBLE_MS);
            }, remaining);
          });
      } else {
        setPhase('idle');
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', finishGesture, { passive: true });
    window.addEventListener('touchcancel', finishGesture, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', finishGesture);
      window.removeEventListener('touchcancel', finishGesture);
      if (doneTimerRef.current) {
        window.clearTimeout(doneTimerRef.current);
        doneTimerRef.current = null;
      }
    };
  }, [enabled]);

  if (!enabled || (phase === 'idle' && pullDistance === 0)) {
    return null;
  }

  const progress = Math.min(1, pullDistance / THRESHOLD);
  const translateY =
    phase === 'refreshing' || phase === 'done'
      ? 14
      : Math.max(-24, pullDistance - 36);

  const label =
    phase === 'refreshing'
      ? t.ptr.refreshing
      : phase === 'done'
        ? t.ptr.updated
        : phase === 'ready'
          ? t.ptr.release
          : t.ptr.pull;

  return (
    <div
      id="ivy-pull-to-refresh"
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[62px] z-40 flex justify-center px-4"
      style={{
        transform: `translate3d(0, ${translateY}px, 0)`,
        opacity: phase === 'refreshing' || phase === 'done' ? 1 : Math.min(1, progress * 1.25),
        transition:
          phase === 'pulling' || phase === 'ready'
            ? 'none'
            : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease',
      }}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-[#DFD3BC] bg-[#FAF8F4]/95 px-3.5 py-1.5 shadow-[0_6px_20px_rgba(20,59,43,0.10)] backdrop-blur-md">
        {phase === 'refreshing' ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin stroke-[1.7] text-[#B39258]" />
        ) : phase === 'done' ? (
          <Check className="h-3.5 w-3.5 stroke-[2] text-[#143B2B]" />
        ) : (
          <ArrowDown
            className="h-3.5 w-3.5 stroke-[1.7] text-[#B39258] transition-transform duration-150"
            style={{
              transform: phase === 'ready' ? 'rotate(180deg)' : `rotate(${Math.round(progress * 140)}deg)`,
            }}
          />
        )}
        <span
          className={`text-[11.5px] tracking-wide ${
            phase === 'ready' || phase === 'done'
              ? 'font-normal text-[#143B2B]'
              : 'font-light text-[#5F7067]'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
