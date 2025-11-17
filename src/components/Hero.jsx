import { useState, useCallback, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Lazy-load heavy components to reduce initial bundle
const SplineLazy = lazy(() => import('@splinetool/react-spline'));
const BackgroundNPCsLazy = lazy(() => import('./BackgroundNPCs'));
const Environment3DLazy = lazy(() => import('./Environment3D'));

const SCENE_URL = 'https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode';

export default function Hero({ onOpenPortal }) {
  const [loaded, setLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inView, setInView] = useState(false);
  const [canLoad3D, setCanLoad3D] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const splineRef = useRef(null);

  // Global press lock and active pointer tracking to prevent multi-press
  const pressedLockRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const lastPointerDownTsRef = useRef(0);
  const blockUntilRef = useRef(0); // hard-block window for Spline-level events

  // FX state: ephemeral interaction bursts
  const [effects, setEffects] = useState([]);
  const idRef = useRef(0);
  const lastOpenRef = useRef(0);

  // Debug HUD
  const [hoverName, setHoverName] = useState('');
  const [hoverIsHit, setHoverIsHit] = useState(false);
  const [sceneStatus, setSceneStatus] = useState('idle'); // idle | loading | loaded
  const [lastEvent, setLastEvent] = useState('');
  const [acceptAllForDebug, setAcceptAllForDebug] = useState(true); // default ON so you see changes

  // Performance tier detection
  const perf = useMemo(() => {
    const w = typeof window !== 'undefined' ? window : undefined;
    const prefersReduced = w?.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mem = (navigator && 'deviceMemory' in navigator) ? navigator.deviceMemory : undefined; // e.g., 4, 8
    const cores = navigator?.hardwareConcurrency || undefined;
    const lowMem = mem && mem <= 4;
    const lowCore = cores && cores <= 4;
    const tier = prefersReduced ? 'reduced' : (lowMem || lowCore ? 'low' : 'high');
    const particleCount = tier === 'reduced' ? 0 : tier === 'low' ? 8 : 14;
    return { tier, prefersReduced, particleCount };
  }, []);

  // Only initialize heavy 3D once section is in viewport AND after main thread is idle
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
          }
        }
      },
      { rootMargin: '0px 0px 0px 0px', threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // requestIdleCallback polyfill
    const ric = (cb) => (window.requestIdleCallback ? window.requestIdleCallback(cb) : window.setTimeout(cb, 120));
    const cic = (id) => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id));
    const id = ric(() => setCanLoad3D(true));
    return () => cic(id);
  }, []);

  // show3D must be defined before any hooks that depend on it
  const show3D = inView && canLoad3D;

  // Keyboard debug toggle: Shift+D to accept all names as hit
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'd' || e.key === 'D') && e.shiftKey) {
        setAcceptAllForDebug((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const enableCanvasPointerEvents = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) canvas.style.pointerEvents = '';
  }, []);

  const releaseLock = useCallback(() => {
    pressedLockRef.current = false;
    activePointerIdRef.current = null;
    // End hard-block window and re-enable events
    blockUntilRef.current = 0;
    enableCanvasPointerEvents();
  }, [enableCanvasPointerEvents]);

  const setCanvasEnhancements = useCallback(() => {
    if (!containerRef.current) return false;
    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) return false;
    if (canvasRef.current === canvas) return true; // already bound

    canvasRef.current = canvas;
    canvas.setAttribute('aria-label', 'Interactive 3D keyboard');
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    canvas.style.touchAction = 'none';
    canvas.style.webkitTapHighlightColor = 'transparent';
    canvas.style.cursor = 'default';

    // Enforce single actionable press per pointer sequence at the canvas level
    const onPointerDown = (ev) => {
      if (pressedLockRef.current) {
        ev.preventDefault?.();
        ev.stopImmediatePropagation?.();
        ev.stopPropagation?.();
        return;
      }
      pressedLockRef.current = true;
      activePointerIdRef.current = ev.pointerId ?? 'mouse';
      lastPointerDownTsRef.current = typeof ev.timeStamp === 'number' ? ev.timeStamp : performance.now();
    };
    const onPointerUp = () => releaseLock();
    const onPointerCancel = () => releaseLock();
    const onLostPointerCapture = () => releaseLock();

    // Use non-passive so we can prevent default/propagation
    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp, { passive: true });
    canvas.addEventListener('pointercancel', onPointerCancel, { passive: true });
    canvas.addEventListener('lostpointercapture', onLostPointerCapture, { passive: true });

    // Fallback debug: show canvas coordinates to confirm the canvas is receiving input
    const onMouseMove = (ev) => {
      setLastEvent('dom:mousemove');
      // Keep HUD responsive even if Spline events don't fire
      setHoverName(`(canvas x:${Math.round(ev.clientX)} y:${Math.round(ev.clientY)})`);
      setHoverIsHit(false);
      canvas.style.cursor = 'default';
    };
    canvas.addEventListener('mousemove', onMouseMove, { passive: true });

    // Cleanup listeners if canvas gets replaced
    const cleanup = () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('lostpointercapture', onLostPointerCapture);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
    // store cleanup on the element for later unmount
    canvas.__singlePressCleanup = cleanup;

    return true;
  }, [releaseLock]);

  // If Spline doesn't call onLoad, still try to find and bind the canvas repeatedly for a short window
  useEffect(() => {
    if (!inView || !canLoad3D) return;
    setSceneStatus((s) => (s === 'idle' ? 'loading' : s));
    let tries = 0;
    let rafId;
    const loop = () => {
      tries += 1;
      const bound = setCanvasEnhancements();
      if (!bound && tries < 90) {
        rafId = requestAnimationFrame(loop);
      }
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [inView, canLoad3D, setCanvasEnhancements]);

  const spawnEffect = useCallback((pageX, pageY) => {
    if (perf.particleCount === 0) return; // respect reduced motion
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const x = pageX - rect.left;
    const y = pageY - rect.top;

    const id = idRef.current++;
    const hueBase = Math.random() > 0.5 ? 160 : 190; // emerald/cyan family
    const lifetime = 1100 + Math.random() * 400;
    setEffects((prev) => [...prev, { id, x, y, hueBase, lifetime }]);

    window.setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, lifetime + 120);
  }, [perf.particleCount]);

  const triggerPortal = useCallback(() => {
    const now = Date.now();
    if (now - lastOpenRef.current < 600) return; // throttle transitions
    lastOpenRef.current = now;

    setIsTransitioning(true);
    window.setTimeout(() => {
      setIsTransitioning(false);
      if (typeof onOpenPortal === 'function') onOpenPortal();
    }, 320);
  }, [onOpenPortal]);

  // Strict hit-plane naming. Planes must be named with hit- prefix and be physically above key meshes in Spline.
  const isHitPlaneName = useCallback((name) => {
    if (acceptAllForDebug) return true;
    if (!name) return false;
    const n = String(name).toLowerCase();
    return n.startsWith('hit-');
  }, [acceptAllForDebug]);

  // Shared hover handler (works with both component props and app-level events)
  const onSplineHover = useCallback((e) => {
    const name = e?.target?.name || '';
    const hit = isHitPlaneName(name);
    setHoverName(name);
    setHoverIsHit(hit);
    setLastEvent('spline:hover');
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit ? 'pointer' : 'default';
    }
  }, [isHitPlaneName]);

  // Shared mouseDown handler (works with both component props and app-level events)
  const onSplineMouseDown = useCallback((e) => {
    const now = performance.now();
    if (now < blockUntilRef.current) {
      e?.stopImmediatePropagation?.();
      e?.stopPropagation?.();
      e?.preventDefault?.();
      const oe = e?.originalEvent;
      oe?.stopImmediatePropagation?.();
      oe?.stopPropagation?.();
      oe?.preventDefault?.();
      return;
    }

    if (pressedLockRef.current) {
      const pid = e?.originalEvent?.pointerId ?? 'mouse';
      if (activePointerIdRef.current !== null && activePointerIdRef.current !== pid) {
        e?.stopImmediatePropagation?.();
        e?.stopPropagation?.();
        e?.preventDefault?.();
        const oe = e?.originalEvent;
        oe?.stopImmediatePropagation?.();
        oe?.stopPropagation?.();
        oe?.preventDefault?.();
        return;
      }
      e?.stopImmediatePropagation?.();
      e?.stopPropagation?.();
      e?.preventDefault?.();
      const oe2 = e?.originalEvent;
      oe2?.stopImmediatePropagation?.();
      oe2?.stopPropagation?.();
      oe2?.preventDefault?.();
      return;
    }

    const btn = e?.originalEvent?.button;
    const buttons = e?.originalEvent?.buttons;
    if (btn !== 0 && buttons !== 1) return;

    const name = e?.target?.name || '';
    if (!isHitPlaneName(name)) {
      setHoverName(name);
      setHoverIsHit(false);
      setLastEvent('spline:down-nonhit');
      return;
    }

    setLastEvent('spline:down');
    pressedLockRef.current = true;
    activePointerIdRef.current = e?.originalEvent?.pointerId ?? 'mouse';
    lastPointerDownTsRef.current = typeof e?.originalEvent?.timeStamp === 'number' ? e.originalEvent.timeStamp : performance.now();

    blockUntilRef.current = now + 140;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.pointerEvents = 'none';
      window.setTimeout(() => {
        enableCanvasPointerEvents();
      }, 160);
    }

    const clientX = e?.originalEvent?.clientX ?? 0;
    const clientY = e?.originalEvent?.clientY ?? 0;

    e?.stopImmediatePropagation?.();
    e?.stopPropagation?.();
    e?.preventDefault?.();
    const oe = e?.originalEvent;
    oe?.stopImmediatePropagation?.();
    oe?.stopPropagation?.();
    oe?.preventDefault?.();

    spawnEffect(clientX, clientY);
    triggerPortal();
  }, [enableCanvasPointerEvents, isHitPlaneName, spawnEffect, triggerPortal]);

  // When the Spline scene loads, wire object-level listeners (fallback for older runtime)
  const handleLoad = useCallback((splineApp) => {
    setLoaded(true);
    setSceneStatus('loaded');
    setTimeout(setCanvasEnhancements, 0);

    splineRef.current = splineApp;

    try {
      splineApp?.addEventListener?.('mouseMove', onSplineHover);
      splineApp?.addEventListener?.('mouseHover', onSplineHover);
    } catch (_) {}

    try {
      splineApp?.addEventListener?.('mouseDown', onSplineMouseDown);
    } catch (_) {}
  }, [onSplineHover, onSplineMouseDown, setCanvasEnhancements]);

  // Track initial loading state to surface in HUD
  useEffect(() => {
    if (show3D && sceneStatus === 'idle') {
      setSceneStatus('loading');
    }
  }, [show3D, sceneStatus]);

  // Cleanup Spline listeners on unmount
  useEffect(() => {
    return () => {
      const app = splineRef.current;
      try { app?.removeEventListener?.('mouseDown', onSplineMouseDown); } catch (_) {}
      try {
        app?.removeEventListener?.('mouseMove', onSplineHover);
        app?.removeEventListener?.('mouseHover', onSplineHover);
      } catch (_) {}
      try {
        const canvas = canvasRef.current;
        canvas?.__singlePressCleanup?.();
      } catch (_) {}
    };
  }, [onSplineHover, onSplineMouseDown]);

  // Safety: ensure any stuck pointer states inside the Spline canvas are released
  useEffect(() => {
    const releasePointer = () => {
      const canvas = canvasRef.current;
      releaseLock();
      if (!canvas) return;
      try {
        const evt = new PointerEvent('pointerup', { bubbles: true, cancelable: true });
        canvas.dispatchEvent(evt);
        const mouseEvt = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
        canvas.dispatchEvent(mouseEvt);
      } catch (_) {
        // ignore
      }
    };

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') releasePointer();
    };

    window.addEventListener('pointerup', releasePointer, true);
    window.addEventListener('pointercancel', releasePointer, true);
    window.addEventListener('blur', releasePointer);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('pointerup', releasePointer, true);
      window.removeEventListener('pointercancel', releasePointer, true);
      window.removeEventListener('blur', releasePointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [releaseLock]);

  const preventContext = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="3D keyboard scene"
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100"
    >
      {/* Subtle texture grid (push behind the environment) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] bg-[radial-gradient(rgba(0,0,0,0.8)_1px,transparent_1px)] [background-size:18px_18px]"
      />

      {/* Soft vignette to center focus (keep very light) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 mix-blend-multiply opacity-20 bg-[radial-gradient(1200px_600px_at_50%_20%,rgba(0,0,0,0.12),transparent_60%)]"
      />

      {/* 3D Environment behind the keyboard but above texture grid */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={null}>
          <Environment3DLazy />
        </Suspense>
      </div>

      {/* Background ambience above the environment but below Spline */}
      <div className="absolute inset-0 z-20">
        <Suspense fallback={null}>
          <BackgroundNPCsLazy />
        </Suspense>
      </div>

      {/* Spline Canvas at the top of visual stack (except loader) */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-30 select-none"
        onContextMenu={preventContext}
        onPointerLeave={() => {
          const canvas = canvasRef.current;
          // Release lock on leave so next entry can press again
          releaseLock();
          if (!canvas) return;
          try {
            const evt = new PointerEvent('pointerup', { bubbles: true, cancelable: true });
            canvas.dispatchEvent(evt);
            const mouseEvt = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
            canvas.dispatchEvent(mouseEvt);
          } catch (_) {}
        }}
      >
        {show3D ? (
          <Suspense fallback={null}>
            <SplineLazy
              scene={SCENE_URL}
              onLoad={handleLoad}
              onMouseMove={onSplineHover}
              onMouseHover={onSplineHover}
              onMouseDown={onSplineMouseDown}
            />
          </Suspense>
        ) : null}
      </div>

      {/* Interaction VFX (above Spline, below loader) */}
      <div className="pointer-events-none absolute inset-0 z-40">
        {effects.map((fx) => (
          <EffectBurst key={fx.id} x={fx.x} y={fx.y} hueBase={fx.hueBase} lifetime={fx.lifetime} count={perf.particleCount} />
        ))}
      </div>

      {/* Minimal loader while the scene initializes */}
      <AnimatePresence>
        {!loaded && show3D && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <motion.div
              className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 shadow-sm backdrop-blur-md ring-1 ring-black/5"
              initial={{ y: 6, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
              role="status"
              aria-live="polite"
            >
              <span className="relative inline-flex h-4 w-4">
                <span className="absolute inset-0 animate-ping rounded-full bg-slate-400/60" />
                <span className="relative inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              </span>
              <span className="text-sm font-medium text-slate-600">Loading scene…</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smooth transition overlay when navigating in-app */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.36, ease: 'easeInOut' }}
            aria-hidden
          >
            <div className="absolute inset-0 bg-white/40" />
            <div className="absolute inset-0 opacity-70 mix-blend-screen"
                 style={{
                   background:
                     'radial-gradient(60% 40% at 30% 10%, rgba(52,214,246,0.25), transparent 60%),\n                      radial-gradient(60% 40% at 70% 15%, rgba(34,211,238,0.22), transparent 60%),\n                      radial-gradient(40% 30% at 50% 5%, rgba(52,214,246,0.2), transparent 60%)',
                   filter: 'blur(20px) saturate(110%)'
                 }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_50%_20%,rgba(0,0,0,0.12),transparent_60%)] opacity-20 mix-blend-multiply" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug HUD: shows current hovered object and whether it's a hit plane */}
      <div className="absolute left-3 top-3 z-50 rounded-md border border-slate-200 bg-white/90 px-3 py-1 text-xs text-slate-700 shadow-sm backdrop-blur">
        <div className="font-medium">Hover</div>
        <div className="mt-0.5">Name: <span className="font-mono">{hoverName || '—'}</span></div>
        <div className="mt-0.5 flex items-center gap-2">
          <span>Hit plane:</span>
          <span className={`h-2.5 w-2.5 rounded-full ${hoverIsHit ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </div>
        <div className="mt-0.5">Scene: <span className="font-mono">{sceneStatus}</span></div>
        <div className="mt-0.5">Last event: <span className="font-mono">{lastEvent || '—'}</span></div>
        <div className="mt-0.5">Mode: <span className="font-mono">{acceptAllForDebug ? 'accept-all' : 'hit-only'}</span> <span className="ml-2 text-[10px] text-slate-500">(Shift+D to toggle)</span></div>
        <div className="mt-1 text-[10px] text-slate-500">Clicks only work on names starting with "hit-" unless accept-all is enabled.</div>
      </div>

      {/* If events never fired, show a gentle hint after a moment */}
      <IdleHint visible={show3D && loaded && !hoverName} />

      {/* Big banner if Spline events aren't coming through */}
      {show3D && sceneStatus === 'loaded' && !lastEvent && (
        <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-md bg-rose-50 px-3 py-1 text-xs text-rose-800 ring-1 ring-rose-200">
          No Spline hover events detected. Move your cursor over the keyboard. If this persists, the scene may block interaction or be layered behind another mesh.
        </div>
      )}
    </section>
  );
}

function IdleHint({ visible }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!visible) { setShow(false); return; }
    const id = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(id);
  }, [visible]);
  if (!show) return null;
  return (
    <div className="absolute left-3 top-20 z-50 rounded-md bg-amber-50 px-3 py-1 text-xs text-amber-800 ring-1 ring-amber-200">
      Move your cursor over the keyboard. If the name doesn’t change, Spline events aren’t reaching the app.
    </div>
  );
}

function EffectBurst({ x, y, hueBase = 170, lifetime = 1400, count = 14 }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(1, count) + (Math.random() - 0.5) * 0.5;
      const speed = 80 + Math.random() * 120;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed * 0.8; // slight vertical restraint
      const size = 2 + Math.random() * 3;
      const delay = Math.random() * 60;
      const hue = hueBase + (Math.random() - 0.5) * 20;
      const sat = 85 + Math.random() * 10;
      const light = 55 + Math.random() * 10;
      return { i, dx, dy, size, delay, color: `hsl(${hue} ${sat}% ${light}%)` };
    });
  }, [count, hueBase]);

  const rippleSize = 18 + Math.random() * 18;
  const glowSize = 160 + Math.random() * 120;

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
      aria-hidden
    >
      {/* ripple */}
      <motion.div
        initial={{ opacity: 0.3, scale: 0 }}
        animate={{ opacity: [0.35, 0.25, 0], scale: [0, 1, 1.4] }}
        transition={{ duration: lifetime / 1000, ease: 'easeOut' }}
        className="rounded-full"
        style={{
          width: rippleSize,
          height: rippleSize,
          boxShadow:
            '0 0 0 1px rgba(16,185,129,0.3), 0 0 0 6px rgba(34,211,238,0.18), inset 0 0 18px rgba(16,185,129,0.35)'
        }}
      />

      {/* glow */}
      <motion.div
        initial={{ opacity: 0.28, scale: 0.8 }}
        animate={{ opacity: 0, scale: 1.35 }}
        transition={{ duration: lifetime / 1200, ease: 'circOut' }}
        className="-z-10 rounded-full blur-2xl"
        style={{
          width: glowSize,
          height: glowSize,
          background:
            'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.35), rgba(59,130,246,0.0) 60%)'
        }}
      />

      {/* particles */}
      <div className="relative">
        {particles.map((p) => (
          <motion.span
            key={p.i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.9 }}
            transition={{ duration: lifetime / 1000, delay: p.delay / 1000, ease: 'easeOut' }}
            className="absolute rounded-full shadow-[0_0_6px_rgba(0,0,0,0.15)]"
            style={{ width: p.size, height: p.size, background: p.color }}
          />
        ))}
      </div>

      {/* scanline shimmer ring */}
      <motion.div
        initial={{ opacity: 0.3, scale: 0.7 }}
        animate={{ opacity: 0, scale: 1.3 }}
        transition={{ duration: lifetime / 1200, ease: 'easeOut' }}
        className="pointer-events-none"
        style={{
          width: rippleSize * 2.4,
          height: 2,
          background:
            'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)'
        }}
      />
    </div>
  );
}
