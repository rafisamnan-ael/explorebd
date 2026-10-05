import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './AppProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { Layout } from '@/components/navigation/Layout';
import { RouteFallback } from '@/components/ui/RouteFallback';

const HomePage = lazy(() => import('@/pages/HomePage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const WorldPage = lazy(() => import('@/pages/WorldPage'));
const GuidePage = lazy(() => import('@/pages/GuidePage'));
const DistrictGuidePage = lazy(() => import('@/pages/DistrictGuidePage'));
const PlacePage = lazy(() => import('@/pages/PlacePage'));
const FamousPage = lazy(() => import('@/pages/FamousPage'));
const SeasonPage = lazy(() => import('@/pages/SeasonPage'));
const PlannerPage = lazy(() => import('@/pages/PlannerPage'));
const PassportPage = lazy(() => import('@/pages/PassportPage'));
const ShareStudioPage = lazy(() => import('@/pages/ShareStudioPage'));
const SharedMapPage = lazy(() => import('@/pages/SharedMapPage'));
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const GamesPage = lazy(() => import('@/pages/GamesPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const PuzzlePage = lazy(() => import('@/pages/PuzzlePage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const CreditsPage = lazy(() => import('@/pages/CreditsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const TripsPage = lazy(() => import('@/pages/TripsPage'));
const TripDetailPage = lazy(() => import('@/pages/TripDetailPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="map" element={<MapPage />} />
                <Route path="world" element={<WorldPage />} />
                <Route path="guide" element={<GuidePage />} />
                <Route path="guide/:districtSlug" element={<DistrictGuidePage />} />
                <Route path="place/:placeSlug" element={<PlacePage />} />
                <Route path="famous" element={<FamousPage />} />
                <Route path="season/:monthSlug" element={<SeasonPage />} />
                <Route path="planner" element={<PlannerPage />} />
                <Route path="passport" element={<PassportPage />} />
                <Route path="share" element={<ShareStudioPage />} />
                <Route path="m/:code" element={<SharedMapPage />} />
                <Route path="journal" element={<JournalPage />} />
                <Route path="games" element={<GamesPage />} />
                <Route path="games/quiz" element={<QuizPage />} />
                <Route path="games/map-puzzle" element={<PuzzlePage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="trips" element={<TripsPage />} />
                <Route path="trip/:tripId" element={<TripDetailPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="credits" element={<CreditsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
