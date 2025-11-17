import { motion } from 'framer-motion';
import { Gamepad2, Cpu, Rocket, Sparkles } from 'lucide-react';

const items = [
  {
    icon: <Gamepad2 className="text-fuchsia-500" />,
    title: 'Procedural Playground',
    desc: 'A voxel-based world generator with real-time terrain sculpting and biomes.',
    tags: ['WebGL', 'Noise', 'Chunks'],
    link: '#'
  },
  {
    icon: <Cpu className="text-blue-500" />,
    title: 'AI NPC Director',
    desc: 'Utility-AI system that orchestrates believable NPC behaviors and encounters.',
    tags: ['AI', 'Behavior Trees', 'Simulation'],
    link: '#'
  },
  {
    icon: <Rocket className="text-emerald-500" />,
    title: 'Netcode Lab',
    desc: 'Rollback networking experiment for fast-paced action prototypes.',
    tags: ['Networking', 'Rollback', 'Multiplayer'],
    link: '#'
  },
];

export default function Projects() {
  return (
    <section id="projects" className="relative py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[50rem] rounded-full bg-gradient-to-r from-fuchsia-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Sparkles className="text-fuchsia-500" size={16} /> Featured Work
        </div>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Projects with Personality</h2>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {items.map((it, idx) => (
            <motion.a
              key={it.title}
              href={it.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                <div className="absolute -inset-10 bg-gradient-to-r from-fuchsia-500/10 via-blue-500/10 to-emerald-500/10 blur-2xl" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 grid place-items-center rounded-xl bg-gray-50 border border-gray-200">
                  {it.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{it.title}</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600">{it.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {it.tags.map(t => (
                  <span key={t} className="text-xs rounded-full px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200">{t}</span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
