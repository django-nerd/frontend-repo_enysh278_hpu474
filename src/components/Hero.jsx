import { useState, useCallback, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Spline runtime
const SplineLazy = lazy(() => import('@splinetool/react-spline'));
// Optional ambience (kept but not required)
const BackgroundNPCsLazy = lazy(() => import('./BackgroundNPCs'));
const Environment3DLazy = lazy(() => import('./Environment3D'));

// Replace with your rebuilt keyboard scene. Only the TOP surface of each key should be interactable and named: "key-<label>"
// Examples: key-esc, key-f1, key-a, key-space, key-enter
const SCENE_URL = 'https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode';

export default function Hero({ onKeyAction }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [canLoad3D, setCanLoad3D] = useState(false);

  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const splineRef = useRef(null);

  // Press state management (single activation per pointer)
  const activePointerIdRef = useRef(null);
  const pressedKeyRef = useRef(null);

  // HUD state
  const [hoverName, setHoverName] = useState('');
  const [hoverIsKey, setHoverIsKey] = useState(false);
  const [sceneStatus, setSceneStatus] = useState('idle');
  const [lastPressedKey, setLastPressedKey] = useState('');

  // Simple VFX
  const [effects, setEffects] = useState([]);
  const idRef = useRef(0);

  // Performance tier
  const perf = useMemo(() => {
    const w = typeof window !== 'undefined' ? window : undefined;
    const prefersReduced = w?.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mem = (navigator && 'deviceMemory' in navigator) ? navigator.deviceMemory : undefined;
    const cores = navigator?.hardwareConcurrency || undefined;
    const low = (mem && mem <= 4) || (cores && cores <= 4) || prefersReduced;
    return { particles: low ? 6 : 14 };
  }, []);

  // View/idle gates
  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let id;
    let usedRIC = false;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      usedRIC = true;
      id = window.requestIdleCallback(() => setCanLoad3D(true), { timeout: 500 });
    } else {
      id = window.setTimeout(() => setCanLoad3D(true), 100);
    }
    return () => {
      if (usedRIC && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, []);

  const show3D = inView && canLoad3D;

  // Helper: key top naming
  const isKeyTop = useCallback((name) => {
    if (!name) return false;
    const n = String(name).toLowerCase();
    return n.startsWith('key-');
  }, []);

  const parseKeyLabel = useCallback((name) => {
    if (!name) return '';
    const n = String(name).toLowerCase();
    if (!n.startsWith('key-')) return '';
    return n.slice(4); // part after key-
  }, []);

  // Basic canvas binding (cursor + non-interfering listeners)
  const bindCanvas = useCallback(() => {
    if (!containerRef.current) return false;
    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) return false;
    if (canvasRef.current === canvas) return true;
    canvasRef.current = canvas;
    canvas.style.cursor = 'default';
    return true;
  }, []);

  // Try to bind early even before onLoad
  useEffect(() => {
    if (!show3D) return;
    let tries = 0; let raf;
    const loop = () => {
      tries += 1;
      const ok = bindCanvas();
      if (!ok && tries < 90) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [show3D, bindCanvas]);

  // Hover: Spline reports the object under cursor
  const onSplineHover = useCallback((e) => {
    const name = e?.target?.name || '';
    const isKey = isKeyTop(name);
    setHoverName(name);
    setHoverIsKey(isKey);
    if (canvasRef.current) canvasRef.current.style.cursor = isKey ? 'pointer' : 'default';
  }, [isKeyTop]);

  // Mouse/Pointer down: Only act when a key-top is pressed and no other pointer is active
  const onSplineMouseDown = useCallback((e) => {
    const name = e?.target?.name || '';
    if (!isKeyTop(name)) return; // ignore non-key surfaces
    const pid = e?.originalEvent?.pointerId ?? 'mouse';
    if (activePointerIdRef.current !== null && activePointerIdRef.current !== pid) return; // another pointer active

    activePointerIdRef.current = pid;
    const label = parseKeyLabel(name);
    pressedKeyRef.current = label;
    setLastPressedKey(label);

    // Fire optional callback to parent with the key label
    if (typeof onKeyAction === 'function') onKeyAction({ type: 'press', key: label });

    // Local visual feedback
    const x = e?.originalEvent?.clientX ?? 0;
    const y = e?.originalEvent?.clientY ?? 0;
    spawnEffect(x, y);
  }, [isKeyTop, parseKeyLabel, onKeyAction]);

  // Pointer up/cancel releases the lock and fires "release" action if there was a key
  const onWindowPointerEnd = useCallback(() => {
    const label = pressedKeyRef.current;
    if (label) {
      if (typeof onKeyAction === 'function') onKeyAction({ type: 'release', key: label });
    }
    pressedKeyRef.current = null;
    activePointerIdRef.current = null;
  }, [onKeyAction]);

  useEffect(() => {
    window.addEventListener('pointerup', onWindowPointerEnd, true);
    window.addEventListener('pointercancel', onWindowPointerEnd, true);
    window.addEventListener('blur', onWindowPointerEnd);
    return () => {
      window.removeEventListener('pointerup', onWindowPointerEnd, true);
      window.removeEventListener('pointercancel', onWindowPointerEnd, true);
      window.removeEventListener('blur', onWindowPointerEnd);
    };
  }, [onWindowPointerEnd]);

  // Load hook
  const handleLoad = useCallback((splineApp) => {
    setLoaded(true);
    setSceneStatus('loaded');
    splineRef.current = splineApp;

    try {
      splineApp?.addEventListener?.('mouseMove', onSplineHover);
      splineApp?.addEventListener?.('mouseHover', onSplineHover);
      splineApp?.addEventListener?.('mouseDown', onSplineMouseDown);
    } catch (_) {}
  }, [onSplineHover, onSplineMouseDown]);

  // Track loading state
  useEffect(() => {
    if (show3D && sceneStatus === 'idle') setSceneStatus('loading');
  }, [show3D, sceneStatus]);

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        const app = splineRef.current;
        app?.removeEventListener?.('mouseMove', onSplineHover);
        app?.removeEventListener?.('mouseHover', onSplineHover);
        app?.removeEventListener?.('mouseDown', onSplineMouseDown);
      } catch (_) {}
    };
  }, [onSplineHover, onSplineMouseDown]);

  // Simple particle burst
  const spawnEffect = useCallback((pageX, pageY) => {
    if (!perf.particles) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = pageX - rect.left;
    const y = pageY - rect.top;
    const id = idRef.current++;
    const count = perf.particles;
    const hue = 170;
    setEffects((prev) => [...prev, { id, x, y, count, hue }]);
    setTimeout(() => setEffects((prev) => prev.filter((p) => p.id !== id)), 900);
  }, [perf.particles]);

  return (
    <section ref={sectionRef} className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-white to-slate-100">
      {/* Ambience (optional) */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={null}><Environment3DLazy /></Suspense>
      </div>
      <div className="absolute inset-0 z-20">
        <Suspense fallback={null}><BackgroundNPCsLazy /></Suspense>
      </div>

      {/* Spline stage */}
      <div ref={containerRef} className="absolute inset-0 z-30 select-none">
        {show3D && (
          <Suspense fallback={null}>
            <SplineLazy
              scene={SCENE_URL}
              onLoad={handleLoad}
              onMouseMove={onSplineHover}
              onMouseHover={onSplineHover}
              onMouseDown={onSplineMouseDown}
            />
          </Suspense>
        )}
      </div>

      {/* VFX */}
      <div className="pointer-events-none absolute inset-0 z-40">
        {effects.map((fx) => (
          <KeyBurst key={fx.id} x={fx.x} y={fx.y} count={fx.count} hue={fx.hue} />
        ))}
      </div>

      {/* Loader */}
      <AnimatePresence>
        {!loaded && show3D && (
          <motion.div className="absolute inset-0 z-40 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur ring-1 ring-black/5">
              Loading keyboard…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      <div className="absolute left-3 top-3 z-50 rounded-md border border-slate-200 bg-white/90 px-3 py-1 text-xs text-slate-700 shadow-sm backdrop-blur">
        <div>Hover: <span className="font-mono">{hoverName || '—'}</span></div>
        <div className="mt-0.5 flex items-center gap-2">Key surface: <span className={`h-2.5 w-2.5 rounded-full ${hoverIsKey ? 'bg-emerald-500' : 'bg-rose-500'}`} /></div>
        <div className="mt-0.5">Scene: <span className="font-mono">{sceneStatus}</span></div>
        <div className="mt-0.5">Last pressed: <span className="font-mono">{lastPressedKey || '—'}</span></div>
        <div className="mt-1 text-[10px] text-slate-500">Only objects named key-* are interactable. Name the TOP faces only.</div>
      </div>
    </section>
  );
}

function KeyBurst({ x, y, count = 10, hue = 170 }) {
  const items = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / Math.max(1, count) + (Math.random() - 0.5) * 0.7;
    const speed = 80 + Math.random() * 100;
    return {
      i,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed * 0.85,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 0.06,
      color: `hsl(${hue + (Math.random() - 0.5) * 18} 85% ${55 + Math.random() * 10}%)`
    };
  }), [count, hue]);

  return (
    <div className="absolute" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }} aria-hidden>
      {items.map((p) => (
        <motion.span
          key={p.i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, delay: p.delay, ease: 'easeOut' }}
          className="absolute rounded-full shadow-[0_0_6px_rgba(0,0,0,0.15)]"
          style={{ width: p.size, height: p.size, background: p.color }}
        />
      ))}
    </div>
  );
}
