import { motion } from 'framer-motion';

// Ultra-subtle ambient effects only (no characters)
// - Soft drifting dust
// - Slow parallax spark pixels
// - Gentle scanline shimmer
// All effects are low-opacity and designed to keep focus on the 3D keyboard.
export default function BackgroundNPCs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft drifting dust */}
      <DustLayer count={18} colorClass="bg-white/35" durationBase={14} />

      {/* Parallax spark pixels (very faint) */}
      <ParallaxPixels layer={1} count={10} yStart={110} yEnd={-10} duration={18} opacity={0.18} hue="emerald" />
      <ParallaxPixels layer={2} count={8} yStart={120} yEnd={-12} duration={22} opacity={0.14} hue="cyan" />

      {/* Gentle scanline shimmer */}
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

function ScanlineShimmer() {
  return (
    <div className="absolute inset-0">
      {/* Static ultra-faint scanlines */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6)_1px,transparent_1px)] [background-size:0.5px_8px]"
      />
      {/* Passing shimmer band */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ y: '-120%' }}
        animate={{ y: '120%' }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-x-0 top-1/3 h-24 bg-gradient-to-b from-transparent via-white/4 to-transparent" />
      </motion.div>
    </div>
  );
}
