import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
const Workshops = lazy(() => import('./components/Workshops'));
import Problem from './components/Problem';
import Solution from './components/Solution';
import WhyNow from './components/WhyNow';
import Product from './components/Product';
import Products from './components/Products';
import CompanyWorkshops from './components/CompanyWorkshops';
import CorporateUpskilling from './components/CorporateUpskilling';
import Domains from './components/Domains';
import Investors from './components/Investors';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { whatsappHref } from './courses-landing/whatsapp';
import { trackProduct, useAccount } from './account/account';
import MyUpshiftSection from './account/MyUpshiftSection';
// three.js is heavy: load it in its own chunk, after the page has painted.
const BackgroundCanvas3D = lazy(() => import('./components/BackgroundCanvas3D'));

export default function App() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');
  const { account } = useAccount();

  // "My Upshift" from another page's account menu: the section appears once the account loads, so scroll then
  const hasAccount = Boolean(account);
  useEffect(() => {
    if (hasAccount && window.location.hash === '#my-upshift') document.getElementById('my-upshift')?.scrollIntoView({ behavior: 'smooth' });
  }, [hasAccount]);
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

  /** Company workshop / corporate upskilling buttons: pre-fill the contact form (and record the interest). */
  const handleSelectWorkshop = (name: string) => {
    trackProduct({ key: `company:${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, action: 'enquire', page: 'main' });
    setSelectedWorkshop(name);
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  /** "Reserve Seat" on a workshop card: straight to WhatsApp, no form to fill. Recorded against the account if logged in. */
  const reserveOnWhatsApp = (w: { key: string; name: string; price: number }) => {
    trackProduct({ key: `workshop:${w.key}`, name: `${w.name} workshop`, price: w.price, action: 'reserve_whatsapp', page: 'main' });
    window.open(whatsappHref(`Hi Upshift India! I'd like to reserve a seat in the ${w.name} demo workshop.`), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative min-h-screen bg-cream/80 overflow-x-hidden selection:bg-sun selection:text-white">
      {/* 3D Global Interactive Background Canvas */}
      {showBackground && (
        <Suspense fallback={null}>
          <BackgroundCanvas3D />
        </Suspense>
      )}

      <Navbar account={account} />
      <main className="relative z-10">
        <Hero />
        {/* Logged in: the person's ideas, evening Zoom calls, hackathon team and workshops */}
        {account && <MyUpshiftSection account={account} page="main" />}
        <div className="focus-blur">
          <Suspense fallback={<div id="workshops" className="min-h-[600px]" />}>
            <Workshops onSelectWorkshop={reserveOnWhatsApp} />
          </Suspense>
          <Problem />
          <Solution />
          <WhyNow />
          <Products />
          <Product />
          <CompanyWorkshops onSelect={handleSelectWorkshop} />
          <CorporateUpskilling onSelect={handleSelectWorkshop} />
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
