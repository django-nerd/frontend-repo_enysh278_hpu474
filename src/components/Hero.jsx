import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[80vh] md:min-h-[90vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 md:pt-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-6xl font-black tracking-tight text-gray-900"
        >
          Playful. Technical. Yours.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="mt-4 md:mt-6 text-lg md:text-xl text-gray-700 max-w-2xl"
        >
          I craft interactive game worlds and tools — blending engineering rigor with playful design.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a href="#projects" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white shadow hover:shadow-md transition">
            View Projects
          </a>
          <a href="#contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm">
            Get in touch
          </a>
        </motion.div>
      </div>
    </section>
  );
}
