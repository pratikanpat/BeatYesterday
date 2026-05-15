import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import YearHeatmap from '../../components/YearHeatmap/YearHeatmap.jsx';
import WeeklyRecap from '../../components/WeeklyRecap/WeeklyRecap.jsx';
import ConsistencyCard from '../../components/ConsistencyCard/ConsistencyCard.jsx';
import BodyHeatmap from '../../components/BodyHeatmap/BodyHeatmap.jsx';
import ChallengeCard from '../../components/ChallengeCard/ChallengeCard.jsx';
import ChallengeCreator from '../../components/ChallengeCreator/ChallengeCreator.jsx';
import GrindModeSelector from '../../components/GrindModeSelector/GrindModeSelector.jsx';
import SleepEnergyCorrelation from '../../components/SleepEnergyCorrelation/SleepEnergyCorrelation.jsx';
import ExportData from '../../components/ExportData/ExportData.jsx';
import { getActiveChallenges, cancelChallenge } from '../../db/challengeService.js';
import './InsightsScreen.css';

/**
 * Screen 4: INSIGHTS
 * Phase 3
 *
 * Year heatmap, weekly recap, challenges, consistency,
 * body heatmap, grind mode. The growth & retention layer.
 */
export default function InsightsScreen() {
  const [challenges, setChallenges] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadChallenges();
  }, [refreshKey]);

  async function loadChallenges() {
    const active = await getActiveChallenges();
    setChallenges(active);
  }

  const handleChallengeStarted = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleCancelChallenge = useCallback(async (id) => {
    await cancelChallenge(id);
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div className="insights-screen" id="insights-screen">
      <header className="insights-screen__header">
        <h1 className="insights-screen__title">INSIGHTS</h1>
      </header>

      <div className="insights-screen__content">
        {/* Year Heatmap */}
        <section className="insights-screen__section">
          <YearHeatmap key={refreshKey} />
        </section>

        {/* Weekly Recap */}
        <section className="insights-screen__section">
          <WeeklyRecap key={`recap-${refreshKey}`} />
        </section>

        {/* Challenges */}
        <section className="insights-screen__section">
          <div className="insights-screen__section-header">
            <h3 className="insights-screen__section-title">CHALLENGES</h3>
            <button
              className="insights-screen__section-action"
              onClick={() => setShowCreator(true)}
              id="start-challenge-btn"
            >
              <Plus size={16} />
              START
            </button>
          </div>

          {challenges.length === 0 && (
            <div className="insights-screen__challenges-empty">
              <p className="insights-screen__challenges-empty-text">
                No active challenges.
              </p>
              <button
                className="insights-screen__challenges-start"
                onClick={() => setShowCreator(true)}
              >
                Start your first 30-day challenge →
              </button>
            </div>
          )}

          <div className="insights-screen__challenges">
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onCancel={handleCancelChallenge}
              />
            ))}
          </div>
        </section>

        {/* Consistency Score */}
        <section className="insights-screen__section">
          <ConsistencyCard />
        </section>

        {/* Body Heatmap */}
        <section className="insights-screen__section">
          <BodyHeatmap />
        </section>

        {/* Performance Insights */}
        <section className="insights-screen__section">
          <SleepEnergyCorrelation />
        </section>

        {/* Grind Mode */}
        <section className="insights-screen__section">
          <GrindModeSelector />
        </section>

        {/* Export Data */}
        <section className="insights-screen__section">
          <ExportData />
        </section>
      </div>

      {/* Challenge Creator bottom sheet */}
      <ChallengeCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onChallengeStarted={handleChallengeStarted}
      />
    </div>
  );
}
