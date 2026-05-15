import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Share2 } from 'lucide-react';
import db from '../../db/db.js';
import { getRecentLogs } from '../../db/prService.js';
import ConsistencyCard from '../../components/ConsistencyCard/ConsistencyCard.jsx';
import BodyHeatmap from '../../components/BodyHeatmap/BodyHeatmap.jsx';
import PRShareCard from '../../components/PRShareCard/PRShareCard.jsx';
import './PRsScreen.css';

const FILTER_TABS = [
  { id: 'all',   label: 'ALL' },
  { id: 'upper', label: 'UPPER' },
  { id: 'core',  label: 'CORE' },
  { id: 'lower', label: 'LOWER' },
];

/**
 * Screen 3: MY PRs
 * Design System §8, Screen 3
 *
 * Per-exercise best ever with sparkline charts.
 */
export default function PRsScreen() {
  const [prCards, setPrCards] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [shareData, setShareData] = useState(null);

  useEffect(() => {
    loadPRs();
  }, []);

  async function loadPRs() {
    const prs = await db.prs.toArray();
    const exercises = await db.exercises.toArray();
    const exerciseMap = {};
    for (const ex of exercises) {
      exerciseMap[ex.id] = ex;
    }

    // Build PR card data
    const cards = await Promise.all(
      prs.map(async (pr) => {
        const exercise = exerciseMap[pr.exerciseId];
        if (!exercise) return null;

        // Get recent logs for sparkline
        const recentLogs = await getRecentLogs(pr.exerciseId, 14);

        // Get last logged value (for comparison)
        const allLogs = await db.logs
          .where('exerciseId')
          .equals(pr.exerciseId)
          .sortBy('timestamp');
        
        const lastLog = allLogs.length > 0 ? allLogs[allLogs.length - 1] : null;
        const lastValue = lastLog ? (lastLog.reps ?? lastLog.durationSec ?? 0) : 0;

        return {
          id: pr.id,
          exerciseId: pr.exerciseId,
          exerciseName: exercise.name,
          category: exercise.category,
          inputType: exercise.inputType,
          bestValue: pr.value,
          lastValue,
          delta: lastValue - pr.value,
          achievedAt: pr.achievedAt,
          sparklineData: recentLogs,
        };
      })
    );

    setPrCards(cards.filter(Boolean));
  }

  const filtered = prCards.filter(card => {
    return activeFilter === 'all' || card.category === activeFilter;
  });

  const formatValue = (value, inputType) => {
    if (inputType === 'time') {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      if (mins > 0) return `${mins}:${String(secs).padStart(2, '0')}`;
      return String(value);
    }
    return String(value);
  };

  return (
    <div className="prs-screen" id="prs-screen">
      <header className="prs-screen__header">
        <h1 className="prs-screen__title">MY PRs</h1>
      </header>

      {/* Consistency Score */}
      <div className="prs-screen__insights">
        <ConsistencyCard />
      </div>

      {/* Filter tabs */}
      <div className="prs-screen__filters">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            className={`prs-screen__filter-tab ${activeFilter === tab.id ? 'prs-screen__filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="prs-screen__content">
        {filtered.length === 0 && (
          <div className="prs-screen__empty">
            <p className="prs-screen__empty-text">No PRs yet.</p>
            <p className="prs-screen__empty-sub">
              Log a workout to set your first record.
            </p>
          </div>
        )}

        <div className="prs-screen__grid">
          {filtered.map(card => {
            const isExpanded = expandedId === card.id;
            return (
              <button
                key={card.id}
                className={`pr-card ${isExpanded ? 'pr-card--expanded' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : card.id)}
              >
                {/* Exercise name */}
                <span className="pr-card__name">{card.exerciseName.toUpperCase()}</span>

                {/* Big number */}
                <span className="pr-card__number">
                  {formatValue(card.bestValue, card.inputType)}
                </span>

                {/* Unit + last comparison */}
                <div className="pr-card__meta">
                  <span className="pr-card__unit">
                    {card.inputType === 'time' ? 'SEC' : 'REPS'}
                  </span>
                  {card.lastValue > 0 && (
                    <span className="pr-card__last">
                      Last: {formatValue(card.lastValue, card.inputType)}
                      {card.lastValue === card.bestValue && (
                        <span className="pr-card__check"> ✓</span>
                      )}
                    </span>
                  )}
                  <button
                    className="pr-card__share-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareData({
                        exerciseName: card.exerciseName,
                        value: card.bestValue,
                        inputType: card.inputType,
                        previousBest: card.lastValue !== card.bestValue ? card.lastValue : null,
                      });
                    }}
                    aria-label={`Share ${card.exerciseName} PR`}
                  >
                    <Share2 size={14} />
                  </button>
                </div>

                {/* Sparkline */}
                {card.sparklineData.length > 1 && (
                  <div className={`pr-card__sparkline ${isExpanded ? 'pr-card__sparkline--expanded' : ''}`}>
                    <ResponsiveContainer width="100%" height={isExpanded ? 120 : 40}>
                      <LineChart data={card.sparklineData}>
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#555555"
                          strokeWidth={1.5}
                          dot={false}
                          activeDot={isExpanded ? { r: 4, fill: '#E63946' } : false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body Heatmap */}
      <div className="prs-screen__insights">
        <BodyHeatmap />
      </div>

      {/* PR Share Card overlay */}
      {shareData && (
        <PRShareCard
          isOpen={true}
          onClose={() => setShareData(null)}
          exerciseName={shareData.exerciseName}
          value={shareData.value}
          inputType={shareData.inputType}
          previousBest={shareData.previousBest}
        />
      )}
    </div>
  );
}
