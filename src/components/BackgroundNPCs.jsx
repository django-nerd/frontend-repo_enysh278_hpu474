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
      <BirdFlock count={8} />
      <FallingStars count={6} />

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
  // More organic movement: randomized altitude, speed, slight curve, and wing flaps
  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }).map((_, i) => {
        const top = 8 + (i * 7) % 30; // spread vertically
        const delay = (i * 1.3) % 6;
        const duration = 18 + (i % 4) * 3; // varied speed
        const scale = 0.7 + ((i * 37) % 30) / 100; // 0.7 - 1.0
        const drift = ((i * 19) % 9) - 4; // -4..4 px wiggle offset base
        const amp = 6 + (i % 3) * 3; // vertical wave amplitude
        const directionRight = i % 2 === 0; // alternate directions
        const startX = directionRight ? '-12vw' : '112vw';
        const endX = directionRight ? '112vw' : '-12vw';

        return (
          <motion.div
            key={`bird-${i}`}
            className="absolute"
            style={{ top: `${top}%`, left: 0, opacity: 0.65, scale }}
            initial={{ x: startX, y: 0 }}
            animate={{
              x: endX,
              y: [0, -amp, amp * 0.3, -amp * 0.5, 0],
              rotate: [0, directionRight ? -2 : 2, 0, directionRight ? 1 : -1, 0],
            }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BirdSilhouette flapDelay={i * 0.2} baseTilt={directionRight ? -5 : 5} drift={drift} />
          </motion.div>
        );
      })}
    </div>
  );
}

function BirdSilhouette({ flapDelay = 0, baseTilt = 0, drift = 0 }) {
  // Double-chevron bird with animated wing flaps
  return (
    <div className="relative w-7 h-4" style={{ transform: `rotate(${baseTilt}deg)` }}>
      <motion.span
        className="absolute left-0 top-1/2 h-[2px] w-3 -translate-y-1/2 bg-slate-700/70"
        style={{ transformOrigin: 'right center' }}
        initial={{ rotate: -35 }}
        animate={{ rotate: [-35, -10, -35] }}
        transition={{ duration: 0.8, delay: flapDelay, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute right-0 top-1/2 h-[2px] w-3 -translate-y-1/2 bg-slate-700/70"
        style={{ transformOrigin: 'left center' }}
        initial={{ rotate: 35 }}
        animate={{ rotate: [35, 10, 35] }}
        transition={{ duration: 0.8, delay: flapDelay + 0.1, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* tiny body/hinge */}
      <motion.span
        className="absolute left-1/2 top-1/2 h-[2px] w-[6px] -translate-x-1/2 -translate-y-1/2 bg-slate-700/60"
        initial={{ x: 0 }}
        animate={{ x: [0, drift * 0.15, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function FallingStars({ count = 6 }) {
  // Ensure stars travel along their angle; spawn from edges and move diagonally following rotation
  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }).map((_, i) => {
        const dirRight = i % 2 === 0; // alternate directions
        const angle = dirRight ? -28 : 208; // visual angle of trail
        const delay = (i * 2.7) % 11;
        const duration = 1.8 + (i % 3) * 0.7;
        const startTop = 6 + (i * 3) % 12; // 6% - 18%
        const startLeft = dirRight ? (-10 - (i % 3) * 8) : (110 + (i % 3) * 8); // offscreen
        const dx = dirRight ? 320 : -320; // px
        const dy = 160; // px downward
        const length = 80 + (i % 3) * 16;

        return (
          <motion.span
            key={`star-${i}`}
            className="absolute h-[2px] bg-gradient-to-r from-white via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.45)]"
            style={{ left: `${startLeft}%`, top: `${startTop}%`, width: length, transformOrigin: 'left center', rotate: angle }}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: [0, 1, 0], x: dx, y: dy, scaleX: [0.6, 1, 1] }}
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
