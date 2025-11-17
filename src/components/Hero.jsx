import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import BackgroundNPCs from './BackgroundNPCs';
import Environment3D from './Environment3D';

const SCENE_URL = 'https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const handleLoad = useCallback(() => setLoaded(true), []);

  return (
    <section
      aria-label="3D keyboard scene"
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100"
    >
      {/* Subtle texture grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(rgba(0,0,0,0.8)_1px,transparent_1px)] [background-size:18px_18px]"
      />

      {/* Soft vignette to center focus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-30 bg-[radial-gradient(1200px_600px_at_50%_20%,rgba(0,0,0,0.12),transparent_60%)]"
      />

      {/* 3D Environment behind the keyboard */}
      <Environment3D />

      {/* Background ambience */}
      <BackgroundNPCs />

      {/* Spline Canvas */}
      <div className="absolute inset-0">
        <Spline scene={SCENE_URL} onLoad={handleLoad} />
      </div>

      {/* Minimal loader while the scene initializes */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
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
