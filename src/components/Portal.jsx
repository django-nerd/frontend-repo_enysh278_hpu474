import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Portal({ onBack }) {
  const pixelsRef = useRef(null);

  useEffect(() => {
    const el = pixelsRef.current;
    if (!el) return;
    el.innerHTML = '';
    const count = 60;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'absolute w-0.5 h-0.5';
      s.style.background = Math.random() > 0.5 ? '#34d6f6' : '#22d3ee';
      s.style.opacity = String(0.5 + Math.random() * 0.5);
      s.style.left = Math.random() * 100 + 'vw';
      s.style.top = Math.random() * 100 + 'vh';
      const d = 6000 + Math.random() * 10000;
      s.animate(
        [
          { transform: 'translateY(0px)' },
          { transform: 'translateY(-10px)' },
          { transform: 'translateY(0px)' }
        ],
        { duration: d, iterations: Infinity, easing: 'ease-in-out', delay: Math.random() * 2000 }
      );
      el.appendChild(s);
    }
    return () => { if (el) el.innerHTML = ''; };
  }, []);

  return (
    <section
      aria-label="Portal"
      className="relative h-screen w-screen overflow-hidden"
    >
      {/* Arctic sky gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#e8fbff_0%,#eaf7ff_30%,#f7fbff_70%,#ffffff_100%)]" />

      {/* Aurora veil */}
      <div
        className="absolute -inset-x-[10%] -top-[20%] bottom-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60%_40%_at_30%_10%,rgba(52,214,246,0.25),transparent_60%),\
            radial-gradient(60%_40%_at_70%_15%,rgba(34,211,238,0.22),transparent_60%),\
            radial-gradient(40%_30%_at_50%_5%,rgba(52,214,246,0.2),transparent_60%)',
          filter: 'blur(24px) saturate(110%)',
          animation: 'portal-drift 16s ease-in-out infinite alternate'
        }}
      />

      {/* Vignette */}
      <div className="absolute -inset-x-[10%] -top-[20%] -bottom-[10%] pointer-events-none opacity-20 mix-blend-multiply bg-[radial-gradient(1000px_500px_at_50%_20%,rgba(0,0,0,0.12),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 grid h-full place-items-center text-center">
        <div>
          <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-900 font-extrabold tracking-[-0.02em] text-[clamp(32px,6vw,72px)]">Portal Unlocked</h1>
          <p className="mt-2 text-slate-600 text-[clamp(14px,2.4vw,18px)]">You pressed a key. A new world opens.</p>
          <button
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 font-semibold text-slate-900 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/85 active:translate-y-0"
          >
            ↩ Back to the keyboard
          </button>
        </div>
      </div>

      {/* Scanlines & shimmer */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-10 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:100%_3px]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 mix-blend-screen"
        initial={{ y: '-100%' }}
        animate={{ y: '100%' }}
        transition={{ duration: 4.2, ease: 'easeInOut', repeat: Infinity }}
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(52,214,246,0.07) 40%, transparent 60%)' }}
      />

      {/* Floating pixels */}
      <div ref={pixelsRef} className="pointer-events-none absolute inset-0 z-0" />

      <style>{`
        @keyframes portal-drift {
          from { transform: translateY(-6px) translateX(-10px) skewX(-1deg); }
          to { transform: translateY(6px) translateX(10px) skewX(1deg); }
        }
      `}</style>
    </section>
  );
}
