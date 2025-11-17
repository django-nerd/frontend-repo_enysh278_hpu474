import { Menu, Gamepad2, Github, Linkedin, Mail } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#projects", label: "Projects" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/60 border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-semibold text-gray-900">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-blue-500 grid place-items-center text-white shadow-sm">
            <Gamepad2 size={18} />
          </div>
          <span>Super Original Dev</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-700">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-gray-900 transition-colors">
              {l.label}
            </a>
          ))}
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Github size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Linkedin size={18} />
            </a>
            <a href="#contact" aria-label="Email" className="p-2 rounded-lg hover:bg-gray-100">
              <Mail size={18} />
            </a>
          </div>
        </nav>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <Menu />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-black/5 bg-white/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2"
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-sm">LinkedIn</a>
              <a href="#contact" className="text-sm">Email</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
