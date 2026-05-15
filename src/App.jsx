import { useEffect } from 'react';
import useWorkoutStore from './store/useWorkoutStore.js';
import db from './db/db.js';
import { seedExercises } from './db/seedExercises.js';

// Screens
import TodayScreen from './screens/TodayScreen/TodayScreen.jsx';
import HistoryScreen from './screens/HistoryScreen/HistoryScreen.jsx';
import PRsScreen from './screens/PRsScreen/PRsScreen.jsx';

// Components
import BottomNav from './components/BottomNav/BottomNav.jsx';
import PRCelebration from './components/PRCelebration/PRCelebration.jsx';

// Styles
import './styles/tokens.css';
import './styles/reset.css';
import './styles/animations.css';

/**
 * BeatYesterday — Main App
 *
 * 3 screens, bottom nav, PR celebration overlay.
 * Opens directly to Today screen. No onboarding. No dashboards.
 */
export default function App() {
  const activeTab = useWorkoutStore(s => s.activeTab);

  // Seed exercises on first launch
  useEffect(() => {
    seedExercises(db);
  }, []);

  return (
    <>
      {/* Active screen */}
      {activeTab === 'today' && <TodayScreen />}
      {activeTab === 'history' && <HistoryScreen />}
      {activeTab === 'prs' && <PRsScreen />}

      {/* Bottom navigation */}
      <BottomNav />

      {/* PR celebration overlay (above everything) */}
      <PRCelebration />
    </>
  );
}
