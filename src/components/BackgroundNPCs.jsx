import { motion } from 'framer-motion';

// Ambient world elements: dust, spark pixels, birds, and falling stars.
export default function BackgroundNPCs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft drifting dust */}
      <DustLayer count={22} colorClass="bg-white/35" durationBase={16} />

      {/* Parallax spark pixels */}
      <ParallaxPixels layer={1} count={12} yStart={110} yEnd={-10} duration={18} opacity={0.18} hue="emerald" />
      <ParallaxPixels layer={2} count={10} yStart={120} yEnd={-12} duration={22} opacity={0.14} hue="cyan" />

      {/* Birds and falling stars */}
      <BirdFlock count={6} />
      <FallingStars count={5} />

      {/* Scanline shimmer */}
      <ScanlineShimmer />
    </div>
  );
}

function DustLayer({ count = 16, colorClass = 'bg-white/30', durationBase = 12 }) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }).map((_, i) => {
        const size = 2 + (i % 3);
        const left = `${(i * 97) % 100}%`;
        const delay = (i % 6) * 0.7;
        const duration = durationBase + (i % 5);
        return (
          <motion.span
            key={i}
            className={`absolute rounded-full ${colorClass}`}
            style={{ left, width: size, height: size, filter: 'blur(0.4px)' }}
            initial={{ y: '105%', opacity: 0 }}
            animate={{ y: '-8%', opacity: [0, 0.4, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

function ParallaxPixels({ layer = 1, count = 8, yStart = 110, yEnd = -10, duration = 18, opacity = 0.2, hue = 'emerald' }) {
  const color = hue === 'cyan' ? 'bg-cyan-300/60' : 'bg-emerald-300/60';
  const glow = hue === 'cyan'
    ? 'shadow-[0_0_6px_rgba(34,211,238,0.35)]'
    : 'shadow-[0_0_6px_rgba(16,185,129,0.35)]';

  return (
    <div className="absolute inset-0" style={{ opacity }}>
      {Array.from({ length: count }).map((_, i) => {
        const size = [2, 3][(i + layer) % 2];
        const left = `${(i * 121 + layer * 13) % 100}%`;
        const d = duration + (i % 4) + layer * 2;
        const delay = (i % 5) * 0.9 + layer * 0.6;
        return (
          <motion.span
            key={`${layer}-${i}`}
            className={`absolute rounded-sm ${color} ${glow}`}
            style={{ left, width: size, height: size, filter: 'blur(0.2px)' }}
            initial={{ y: `${yStart}%`, opacity: 0 }}
            animate={{ y: `${yEnd}%`, opacity: [0, 0.7, 0] }}
            transition={{ duration: d, delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

function BirdFlock({ count = 5 }) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }).map((_, i) => {
        const top = 10 + (i % 3) * 8;
        const delay = i * 2.2;
        const duration = 22 + i * 2;
        const scale = 0.8 + (i % 3) * 0.15;
        return (
          <motion.div
            key={`bird-${i}`}
            className="absolute"
            style={{ top: `${top}%`, left: '-10%', opacity: 0.6, scale }}
            initial={{ x: '-10vw' }}
            animate={{ x: '110vw', y: [0, -4, 0, 3, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* simple bird silhouette: double chevron */}
            <div className="relative w-6 h-3 rotate-[-5deg]">
              <span className="absolute left-0 top-1/2 h-[2px] w-3 -translate-y-1/2 -rotate-45 bg-slate-700/70" />
              <span className="absolute right-0 top-1/2 h-[2px] w-3 -translate-y-1/2 rotate-45 bg-slate-700/70" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function FallingStars({ count = 6 }) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }).map((_, i) => {
        const delay = i * 3.5;
        const duration = 2.5 + (i % 3) * 0.6;
        const startX = (i * 17 + 20) % 100; // percent
        const startY = (i % 2 === 0) ? 8 : 15;
        return (
          <motion.span
            key={`star-${i}`}
            className="absolute h-[2px] w-12 bg-gradient-to-r from-white via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.45)]"
            style={{ left: `${startX}%`, top: `${startY}%`, transformOrigin: 'left center', rotate: -18 }}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: [0, 1, 0], x: 180, y: 55, scaleX: [0.6, 1, 1] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

function ScanlineShimmer() {
  return (
    <div className="absolute inset-0">
      {/* Static ultra-faint scanlines */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6)_1px,transparent_1px)] [background-size:0.5px_8px]"
      />
      {/* Passing shimmer band */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ y: '-120%' }}
        animate={{ y: '120%' }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-x-0 top-1/3 h-24 bg-gradient-to-b from-transparent via-white/6 to-transparent" />
      </motion.div>
    </div>
  );
}
