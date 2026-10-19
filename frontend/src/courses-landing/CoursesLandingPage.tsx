import './theme.css';
import LandingNavbar from './components/LandingNavbar';
import LandingHero from './components/LandingHero';
import CalendarBatchesSection from './components/CalendarBatchesSection';
import CoursesSection from './components/CoursesSection';
import DemoDatesSection from './components/DemoDatesSection';
import StatsSection from './components/StatsSection';
import FeaturesBand from './components/FeaturesBand';
import AboutSection from './components/AboutSection';
import LandingFooter from './components/LandingFooter';

export default function CoursesLandingPage() {
  return (
    <div className="qt-theme relative min-h-screen bg-cream/80 overflow-x-hidden selection:bg-sun selection:text-white">
      <LandingNavbar />
      <main className="relative z-10">
        <LandingHero />
        <CalendarBatchesSection />
        <CoursesSection />
        <DemoDatesSection />
        <StatsSection />
        <FeaturesBand />
        <AboutSection />
      </main>
      <LandingFooter />
    </div>
  );
}
