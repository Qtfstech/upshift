import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
const Workshops = lazy(() => import('./components/Workshops'));
import Problem from './components/Problem';
import Solution from './components/Solution';
import WhyNow from './components/WhyNow';
import Product from './components/Product';
import Products from './components/Products';
import Domains from './components/Domains';
import Investors from './components/Investors';
import Contact from './components/Contact';
import Footer from './components/Footer';
// three.js is heavy: load it in its own chunk, after the page has painted.
const BackgroundCanvas3D = lazy(() => import('./components/BackgroundCanvas3D'));

export default function App() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    const start = () => setShowBackground(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  const handleSelectWorkshop = (name: string) => {
    setSelectedWorkshop(name);
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-cream/80 overflow-x-hidden selection:bg-sun selection:text-white">
      {/* 3D Global Interactive Background Canvas */}
      {showBackground && (
        <Suspense fallback={null}>
          <BackgroundCanvas3D />
        </Suspense>
      )}

      <Navbar />
      <main className="relative z-10">
        <Hero />
        <div className="focus-blur">
          <Suspense fallback={<div id="workshops" className="min-h-[600px]" />}>
            <Workshops onSelectWorkshop={handleSelectWorkshop} />
          </Suspense>
          <Problem />
          <Solution />
          <WhyNow />
          <Product />
          <Products />
          <Domains />
          <Investors />
          <Contact selectedWorkshop={selectedWorkshop} />
        </div>
      </main>
      <div className="focus-blur">
        <Footer />
      </div>
    </div>
  );
}
