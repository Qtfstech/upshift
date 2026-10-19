import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import CoursesLandingPage from './courses-landing/CoursesLandingPage.tsx';
import IdeaChallengePage from './courses-landing/IdeaChallengePage.tsx';
import './index.css';

// Loaded on demand so the main site doesn't ship the dashboard's chart libraries.
const DashboardApp = lazy(() => import('./dashboard/DashboardApp.tsx'));
const HackathonPage = lazy(() => import('./hackathon/HackathonPage.tsx'));

const path = window.location.pathname.replace(/\/+$/, '');
const isCoursesPage = path.endsWith('/courses');
const isDashboard = path.endsWith('/dashboard');
const isIdeaChallenge = path.endsWith('/idea-challenge');
const isHackathon = path.endsWith('/hackathon');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDashboard ? (
      <Suspense fallback={null}>
        <DashboardApp />
      </Suspense>
    ) : isHackathon ? (
      <Suspense fallback={<div className="min-h-screen bg-[#05060d]" />}>
        <HackathonPage />
      </Suspense>
    ) : isIdeaChallenge ? (
      <IdeaChallengePage />
    ) : isCoursesPage ? (
      <CoursesLandingPage />
    ) : (
      <App />
    )}
  </StrictMode>,
);
