import { useState, useEffect } from 'react';
import useWorkoutStore from './store/useWorkoutStore.js';
import db from './db/db.js';
import { seedExercises } from './db/seedExercises.js';
import { requestNotificationPermission, runNotificationChecks } from './db/notificationService.js';

// Screens
import TodayScreen from './screens/TodayScreen/TodayScreen.jsx';
import HistoryScreen from './screens/HistoryScreen/HistoryScreen.jsx';
import PRsScreen from './screens/PRsScreen/PRsScreen.jsx';
import InsightsScreen from './screens/InsightsScreen/InsightsScreen.jsx';

// Components
import BottomNav from './components/BottomNav/BottomNav.jsx';
import PRCelebration from './components/PRCelebration/PRCelebration.jsx';
import Onboarding from './components/Onboarding/Onboarding.jsx';

// Styles
import './styles/tokens.css';
import './styles/reset.css';
import './styles/animations.css';

/**
 * BeatYesterday — Main App
 *
 * 4 screens, bottom nav, PR celebration overlay.
 * Opens directly to Today screen. No onboarding. No dashboards.
 */
export default function App() {
  const activeTab = useWorkoutStore(s => s.activeTab);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Seed exercises on first launch
  useEffect(() => {
    seedExercises(db);
  }, []);

  // Check if onboarding is needed
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const profile = await db.userProfile.toCollection().first();
        if (!profile || !profile.onboardingComplete) {
          setShowOnboarding(true);
        }
      } catch (e) {
        // Table might not exist yet, show onboarding
        setShowOnboarding(true);
      }
      setOnboardingChecked(true);
    }
    // Small delay to ensure DB is ready after seed
    setTimeout(checkOnboarding, 100);
  }, []);

  // Request notification permission + run checks
  useEffect(() => {
    requestNotificationPermission().then(() => {
      runNotificationChecks();
    });
  }, []);

  return (
    <>
      {/* Active screen */}
      {activeTab === 'today' && <TodayScreen />}
      {activeTab === 'history' && <HistoryScreen />}
      {activeTab === 'prs' && <PRsScreen />}
      {activeTab === 'insights' && <InsightsScreen />}

      {/* Bottom navigation */}
      <BottomNav />

      {/* PR celebration overlay (above everything) */}
      <PRCelebration />

      {/* Onboarding (first launch only) */}
      {onboardingChecked && showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
