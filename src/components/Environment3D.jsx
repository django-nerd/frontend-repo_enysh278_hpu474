import { motion } from 'framer-motion';

// Cinematic ambient environment behind the Spline canvas
// Adds:
// - Arctic sky + aurora veil
// - Layered Icelandic mountain silhouettes with parallax
// - Horizon glow
// - Volumetric light shafts
// - Perspective floor grid with soft reflection
// - Layered fog for depth
export default function Environment3D() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Arctic sky */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-b from-cyan-100 via-sky-100 to-white"
      />

      {/* Aurora veil */}
      <Aurora />

      {/* Horizon glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(65%_45%_at_50%_75%,rgba(59,130,246,0.30),transparent_60%)]"
      />

      {/* Volumetric light shafts */}
      <LightShaft angle={-18} left="12%" width="22%" delay={0} baseOpacity={0.08} />
      <LightShaft angle={10} left="58%" width="18%" delay={6} baseOpacity={0.08} />

      {/* Layered mountains with gentle parallax */}
      <Mountains />

      {/* Floor with perspective grid and reflection */}
      <FloorGrid />

      {/* Layered fog for depth */}
      <FogLayer position="top" />
      <FogLayer position="bottom" />
    </div>
  );
}

function Aurora() {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0 top-0 h-1/2 -z-15 mix-blend-screen"
      initial={{ opacity: 0.18 }}
      animate={{ opacity: [0.18, 0.32, 0.18], filter: ['blur(14px)', 'blur(18px)', 'blur(14px)'] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute inset-x-0 top-24 h-40"
        initial={{ x: -40 }}
        animate={{ x: [ -40, 40, -40 ] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(90deg, rgba(34,197,94,0.18), rgba(59,130,246,0.22), rgba(20,184,166,0.18))',
        }}
      />
      <motion.div
        className="absolute inset-x-0 top-10 h-28"
        initial={{ x: 60 }}
        animate={{ x: [ 60, -60, 60 ] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(90deg, rgba(16,185,129,0.12), rgba(99,102,241,0.18), rgba(34,211,238,0.12))',
        }}
      />
    </motion.div>
  );
}

function Mountains() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[58%] -z-5">
      {/* Distant ridge */}
      <ParallaxLayer speed={8} className="opacity-40">
        <MountainSVG fill="#94a3b8" opacity={0.35} scale={1.2} yOffset={24} />
      </ParallaxLayer>

      {/* Mid ridge */}
      <ParallaxLayer speed={14} className="opacity-60">
        <MountainSVG fill="#64748b" opacity={0.45} scale={1.35} yOffset={14} />
      </ParallaxLayer>

      {/* Near ridge with snow caps */}
      <ParallaxLayer speed={22} className="opacity-80">
        <MountainSVG fill="#475569" opacity={0.55} scale={1.6} yOffset={0} snow />
      </ParallaxLayer>
    </div>
  );
}

function ParallaxLayer({ speed = 12, className = '', children }) {
  return (
    <motion.div
      aria-hidden
      className={`absolute inset-x-0 bottom-0 ${className}`}
      initial={{ x: 0 }}
      animate={{ x: [0, -20, 0] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function MountainSVG({ fill = '#64748b', opacity = 0.5, scale = 1, yOffset = 0, snow = false }) {
  const common = `w-[140%] max-w-none`;
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-center">
      <svg
        viewBox="0 0 1200 300"
        className={common}
        style={{ transform: `translateY(${yOffset}px) scale(${scale})` }}
        aria-hidden
      >
        <path
          d="M0 260 L120 220 L220 250 L320 200 L440 240 L520 180 L600 220 L700 160 L800 210 L900 170 L1000 210 L1100 190 L1200 220 L1200 300 L0 300 Z"
          fill={fill}
          opacity={opacity}
        />
        {snow && (
          <path
            d="M100 230 L150 210 L180 225 L210 205 L260 220 L320 200 L380 210 L430 190 L480 205 L540 190 L600 200 L660 185 L720 200 L780 190 L840 200 L900 185 L960 200 L1020 190 L1080 200 L1140 190 L1200 200 L1200 230 L100 230 Z"
            fill="#e2e8f0"
            opacity="0.5"
          />
        )}
      </svg>
    </div>
  );
}

function FloorGrid() {
  // Two layers: main grid and soft reflection band near the keyboard
  return (
    <div className="absolute inset-x-0 bottom-0 h-[60%] [perspective:1200px]">
      <div
        className="absolute inset-x-0 bottom-0 h-full origin-bottom [transform:rotateX(62deg)]"
      >
        {/* Grid lines */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.28] bg-[linear-gradient(to_right,rgba(226,232,240,0.28)_1px,transparent_1px),linear-gradient(to_top,rgba(226,232,240,0.28)_1px,transparent_1px)] [background-size:64px_64px,64px_64px]"
        />

        {/* Subtle animated flow along the grid */}
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_top,rgba(59,130,246,0.35),transparent)]"
          initial={{ backgroundPositionY: '0%' }}
          animate={{ backgroundPositionY: ['0%', '100%', '0%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />

        {/* Soft reflection band */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/20 via-white/10 to-transparent" />

        {/* Vignette to fade the edge */}
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent via-transparent to-black/[0.10]" />
      </div>
    </div>
  );
}

function LightShaft({ angle = 0, left = '0%', width = '20%', delay = 0, baseOpacity = 0.06 }) {
  return (
    <motion.div
      aria-hidden
      className="absolute top-0 bottom-0 -z-10"
      style={{ left, width }}
      initial={{ opacity: baseOpacity, rotate: angle }}
      animate={{ opacity: [baseOpacity, baseOpacity + 0.08, baseOpacity] }}
      transition={{ duration: 14, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <div className="absolute inset-y-0 -inset-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[2px]" />
    </motion.div>
  );
}

function FogLayer({ position = 'bottom' }) {
  const isTop = position === 'top';
  return (
    <motion.div
      aria-hidden
      className={`absolute inset-x-0 ${isTop ? 'top-0 h-1/3' : 'bottom-0 h-1/2'}`}
      initial={{ opacity: 0.16, x: 0 }}
      animate={{ opacity: [0.16, 0.28, 0.16], x: [0, isTop ? -10 : 10, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className={`absolute inset-0 ${isTop ? 'bg-gradient-to-b from-white/20 via-white/8 to-transparent' : 'bg-gradient-to-t from-white/28 via-white/10 to-transparent'}`} />
    </motion.div>
  );
}
