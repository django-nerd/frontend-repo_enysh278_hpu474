import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Hero />
      <Projects />
      <section id="about" className="py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">About</h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              I build game prototypes, tools, and interactive web experiences. My sweet spot is where systems meet style: AI, procedural generation, physics, and delightful UX.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Comfortable across engines and stacks. Obsessed with polish, performance, and player feel.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-fuchsia-500/10 via-blue-500/10 to-emerald-500/10 blur-2xl" />
            <div className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <ul className="grid grid-cols-2 gap-4 text-sm">
                <li className="p-3 rounded-xl bg-gray-50 border border-gray-200">Unity / Unreal</li>
                <li className="p-3 rounded-xl bg-gray-50 border border-gray-200">TypeScript / React</li>
                <li className="p-3 rounded-xl bg-gray-50 border border-gray-200">C# / C++</li>
                <li className="p-3 rounded-xl bg-gray-50 border border-gray-200">Shaders / WebGL</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Contact</h2>
          <p className="mt-4 text-gray-700">Have a role or a wild idea? Let’s talk.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-8 grid md:grid-cols-3 gap-3">
            <input className="px-4 py-3 rounded-xl border border-gray-200 bg-white" placeholder="Your email" />
            <input className="px-4 py-3 rounded-xl border border-gray-200 bg-white" placeholder="Subject" />
            <button className="px-5 py-3 rounded-xl bg-gray-900 text-white">Send</button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
