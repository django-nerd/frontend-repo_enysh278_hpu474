import { motion } from 'framer-motion';

// Creates a lightweight 3D-feeling environment for the keyboard:
// - A perspective floor grid with soft reflection
// - A subtle horizon glow
// - Volumetric light shafts drifting
// - Low, slow fog layers for depth
export default function Environment3D() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {/* Horizon glow */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_75%,rgba(59,130,246,0.20),transparent_60%)]"
      />

      {/* Volumetric light shafts (very subtle) */}
      <LightShaft angle={-18} left="10%" width="22%" delay={0} />
      <LightShaft angle={12} left="58%" width="18%" delay={6} />

      {/* Floor with perspective grid and reflection */}
      <FloorGrid />

      {/* Layered fog for depth */}
      <FogLayer position="top" />
      <FogLayer position="bottom" />
    </div>
  );
}

function FloorGrid() {
  // Two layers: main grid and soft reflection band near the keyboard
  return (
    <div className="absolute inset-x-0 bottom-0 h-[65%] [perspective:1200px]">
      <div
        className="absolute inset-x-0 bottom-0 h-full origin-bottom [transform:rotateX(62deg)]"
      >
        {/* Grid lines */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.22] bg-[linear-gradient(to_right,rgba(226,232,240,0.22)_1px,transparent_1px),linear-gradient(to_top,rgba(226,232,240,0.22)_1px,transparent_1px)] [background-size:64px_64px,64px_64px]"
        />

        {/* Subtle animated flow along the grid */}
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_top,rgba(59,130,246,0.25),transparent)]"
          initial={{ backgroundPositionY: '0%' }}
          animate={{ backgroundPositionY: ['0%', '100%', '0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Soft reflection band */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/10 via-white/5 to-transparent" />

        {/* Vignette to fade the edge */}
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent via-transparent to-black/[0.06]" />
      </div>
    </div>
  );
}

function LightShaft({ angle = 0, left = '0%', width = '20%', delay = 0 }) {
  return (
    <motion.div
      aria-hidden
      className="absolute top-0 bottom-0"
      style={{ left, width }}
      initial={{ opacity: 0.04, rotate: angle }}
      animate={{ opacity: [0.04, 0.12, 0.04] }}
      transition={{ duration: 14, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <div className="absolute inset-y-0 -inset-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent blur-[2px]" />
    </motion.div>
  );
}

function FogLayer({ position = 'bottom' }) {
  const isTop = position === 'top';
  return (
    <motion.div
      aria-hidden
      className={`absolute inset-x-0 ${isTop ? 'top-0 h-1/3' : 'bottom-0 h-1/2'}`}
      initial={{ opacity: 0.10, x: 0 }}
      animate={{ opacity: [0.10, 0.20, 0.10], x: [0, isTop ? -8 : 8, 0] }}
      transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className={`absolute inset-0 ${isTop ? 'bg-gradient-to-b from-white/15 via-white/6 to-transparent' : 'bg-gradient-to-t from-white/20 via-white/8 to-transparent'}`} />
    </motion.div>
  );
}
