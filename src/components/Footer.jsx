export default function Footer() {
  return (
    <footer className="py-10 border-t border-black/5 bg-white">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">© {new Date().getFullYear()} Super Original Dev — Built with love and caffeine.</p>
        <div className="text-sm text-gray-600">
          Open to roles in gameplay, tools, and engine programming.
        </div>
      </div>
    </footer>
  );
}
