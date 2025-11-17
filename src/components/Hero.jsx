import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import BackgroundNPCs from './BackgroundNPCs';
import Environment3D from './Environment3D';

const SCENE_URL = 'https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

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

  const handleLoad = useCallback(() => {
    setLoaded(true);
    // after Spline mounts, capture the canvas and harden interaction settings
    setTimeout(setCanvasEnhancements, 0);
  }, [setCanvasEnhancements]);

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
    // avoid context menu interfering with long-press on touch
    e.preventDefault();
  }, []);

  return (
    <section
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
          // if pointer leaves canvas area while pressed, force release
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
    </section>
  );
}
