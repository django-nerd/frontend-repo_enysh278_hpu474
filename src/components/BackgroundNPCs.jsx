import { motion } from 'framer-motion';

// Simple, whimsical gaming-style background actors
// - A player silhouette pacing
// - A builder NPC stacking blocks
// - Gentle floating pixels for ambient motion
export default function BackgroundNPCs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Floating pixels */}
      <div className="absolute inset-0 opacity-40">
        {Array.from({ length: 14 }).map((_, i) => {
          const delay = (i % 7) * 0.6;
          const size = [2, 3, 4][i % 3];
          const left = `${(i * 7 + 13) % 100}%`;
          const duration = 6 + (i % 5);
          return (
            <motion.span
              key={i}
              className="absolute bg-emerald-400/60 dark:bg-emerald-300/50 rounded-sm shadow-[0_0_6px_rgba(16,185,129,0.5)]"
              style={{ left, width: size, height: size }}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '-10%', opacity: [0, 0.8, 0] }}
              transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          );
        })}
      </div>

      {/* Ground plane as a subtle line */}
      <div className="absolute bottom-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent" />

      {/* Player pacing silhouette */}
      <motion.div
        className="absolute bottom-12 left-0 right-0 flex justify-center"
        initial={false}
      >
        <motion.div
          className="relative h-10 w-10 opacity-60"
          initial={{ x: '-40vw' }}
          animate={{ x: '40vw' }}
          transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          {/* Head */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-3 h-3 w-3 rounded-full bg-slate-700/70" />
          {/* Body */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1 h-5 w-2 rounded bg-slate-700/70" />
          {/* Arms walking */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-2 h-3 w-8 -ml-3"
            animate={{ rotate: [12, -12, 12] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute left-0 top-0 h-1 w-4 origin-left rounded bg-slate-700/70" />
            <div className="absolute right-0 top-0 h-1 w-4 origin-right rounded bg-slate-700/60" />
          </motion.div>
          {/* Legs walking */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-6 h-3 w-8 -ml-3"
            animate={{ rotate: [-14, 14, -14] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute left-0 top-0 h-1 w-4 origin-left rounded bg-slate-700/70" />
            <div className="absolute right-0 top-0 h-1 w-4 origin-right rounded bg-slate-700/60" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Builder NPC stacking blocks */}
      <div className="absolute bottom-12 right-8 sm:right-16 opacity-70">
        <BuilderNPC />
      </div>
    </div>
  );
}

function BuilderNPC() {
  return (
    <div className="relative w-24 h-24">
      {/* Platform */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded bg-slate-400/50" />

      {/* NPC body */}
      <div className="absolute bottom-1 left-2 h-14 w-10">
        <div className="absolute -top-3 left-3 h-3 w-3 rounded bg-indigo-500/80 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        <div className="absolute top-0 left-2 h-6 w-6 rounded bg-indigo-600/70" />
        <div className="absolute top-6 left-1 h-8 w-8 rounded bg-indigo-700/60" />
        {/* Tool hand */}
        <motion.div
          className="absolute top-2 -right-2 h-1.5 w-5 origin-left rounded bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          animate={{ rotate: [-20, 20, -20] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Stacking blocks */}
      {[0, 1, 2, 3].map((level) => (
        <motion.div
          key={level}
          className="absolute bottom-1 left-14 flex gap-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, 0] }}
          transition={{
            times: [0, 0.2, 0.8, 1],
            duration: 4,
            delay: level * 0.4,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeOut',
          }}
          style={{ bottom: 4 + level * 10 }}
        >
          <div className="h-3 w-4 rounded-sm bg-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="h-3 w-4 rounded-sm bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        </motion.div>
      ))}

      {/* Dust particles when placing */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute bottom-10 left-16 h-1 w-1 rounded-full bg-white/70"
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: [0, (i % 2 ? -1 : 1) * (4 + i), 0], y: [0, -6 - i, 0] }}
          transition={{ duration: 1.2, delay: 0.4 + i * 0.1, repeat: Infinity, repeatDelay: 2 }}
        />
      ))}
    </div>
  );
}
