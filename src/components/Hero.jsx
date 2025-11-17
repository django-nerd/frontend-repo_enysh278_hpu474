import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import BackgroundNPCs from './BackgroundNPCs';
import Environment3D from './Environment3D';

const SCENE_URL = 'https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode';

export default function Hero({ onOpenPortal }) {
  const [loaded, setLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const splineRef = useRef(null);
  const splineMouseDownHandlerRef = useRef(null);

  // FX state: ephemeral interaction bursts
  const [effects, setEffects] = useState([]);
  const idRef = useRef(0);
  const lastOpenRef = useRef(0);

  const setCanvasEnhancements = useCallback(() => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector('canvas');
    if (canvas) {
      canvasRef.current = canvas;
      canvas.setAttribute('aria-label', 'Interactive 3D keyboard');
      canvas.style.userSelect = 'none';
      canvas.style.webkitUserSelect = 'none';
      canvas.style.touchAction = 'none';
      canvas.style.webkitTapHighlightColor = 'transparent';
      canvas.style.cursor = 'default';
    }
  }, []);

  const spawnEffect = useCallback((pageX, pageY) => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const x = pageX - rect.left;
    const y = pageY - rect.top;

    const id = idRef.current++;
    const hueBase = Math.random() > 0.5 ? 160 : 190; // emerald/cyan family
    const lifetime = 1200 + Math.random() * 500;
    setEffects((prev) => [...prev, { id, x, y, hueBase, lifetime }]);

    window.setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, lifetime + 100);
  }, []);

  const triggerPortal = useCallback(() => {
    const now = Date.now();
    if (now - lastOpenRef.current < 600) return; // throttle transitions
    lastOpenRef.current = now;

    setIsTransitioning(true);
    window.setTimeout(() => {
      setIsTransitioning(false);
      if (typeof onOpenPortal === 'function') onOpenPortal();
    }, 360);
  }, [onOpenPortal]);

  // When the Spline scene loads, wire object-level mouseDown to only respond to keycaps
  const handleLoad = useCallback((splineApp) => {
    setLoaded(true);
    setTimeout(setCanvasEnhancements, 0);

    splineRef.current = splineApp;

    // Create and save handler so we can remove it later
    const mouseDownHandler = (e) => {
      const name = e?.target?.name?.toLowerCase?.() || '';
      // Heuristics: only react when clicking key-like objects
      const isKey = name.startsWith('key') || name.includes('keycap') || name.includes('cap') || name.includes('keyboard');
      if (!isKey) return;

      const clientX = e?.originalEvent?.clientX ?? 0;
      const clientY = e?.originalEvent?.clientY ?? 0;
      spawnEffect(clientX, clientY);
      triggerPortal();
    };
    splineMouseDownHandlerRef.current = mouseDownHandler;

    try {
      splineApp?.addEventListener?.('mouseDown', mouseDownHandler);
    } catch (_) {
      // no-op if API changes
    }
  }, [setCanvasEnhancements, spawnEffect, triggerPortal]);

  // Cleanup Spline listeners on unmount
  useEffect(() => {
    return () => {
      const app = splineRef.current;
      const handler = splineMouseDownHandlerRef.current;
      try {
        app?.removeEventListener?.('mouseDown', handler);
      } catch (_) {}
    };
  }, []);

  // Safety: ensure any stuck pointer states inside the Spline canvas are released
  useEffect(() => {
    const releasePointer = () => {
      const canvas = canvasRef.current;
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
  }, []);

  const preventContext = useCallback((e) => {
    e.preventDefault();
  }, []);

  // We no longer listen for pointerdown on the whole canvas; only Spline object-level events

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
        <Environment3D />
      </div>

      {/* Background ambience above the environment but below Spline */}
      <div className="absolute inset-0 z-20">
        <BackgroundNPCs />
      </div>

      {/* Spline Canvas at the top of visual stack (except loader) */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-30 select-none"
        onContextMenu={preventContext}
        onPointerLeave={() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          try {
            const evt = new PointerEvent('pointerup', { bubbles: true, cancelable: true });
            canvas.dispatchEvent(evt);
            const mouseEvt = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
            canvas.dispatchEvent(mouseEvt);
          } catch (_) {}
        }}
      >
        <Spline scene={SCENE_URL} onLoad={handleLoad} />
      </div>

      {/* Interaction VFX (above Spline, below loader) */}
      <div className="pointer-events-none absolute inset-0 z-40">
        {effects.map((fx) => (
          <EffectBurst key={fx.id} x={fx.x} y={fx.y} hueBase={fx.hueBase} lifetime={fx.lifetime} />
        ))}
      </div>

      {/* Minimal loader while the scene initializes */}
      <AnimatePresence>
        {!loaded && (
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
    </section>
  );
}

function EffectBurst({ x, y, hueBase = 170, lifetime = 1400 }) {
  const count = 14;
  const particles = Array.from({ length: count }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
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
