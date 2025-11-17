import { useState, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Hero from './components/Hero';
const PortalLazy = lazy(() => import('./components/Portal'));

function App() {
  const [route, setRoute] = useState('home');

  const goPortal = useCallback(() => setRoute('portal'), []);
  const goHome = useCallback(() => setRoute('home'), []);

  return (
    <div className="min-h-screen text-gray-900 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(15,23,42,0.06),transparent_60%)]">
      <AnimatePresence mode="wait">
        {route === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            <Hero onOpenPortal={goPortal} />
          </motion.div>
        ) : (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Suspense fallback={null}>
              <PortalLazy onBack={goHome} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
