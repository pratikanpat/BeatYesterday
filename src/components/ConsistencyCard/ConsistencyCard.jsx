import { useState, useEffect } from 'react';
import { getConsistencyScore } from '../../db/consistencyService.js';
import './ConsistencyCard.css';

/**
 * Consistency Card — Phase 2
 *
 * Rolling 30-day consistency score.
 * No streaks. No guilt. Just honest data.
 * "Trained 60% of days this month."
 */
export default function ConsistencyCard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getConsistencyScore(30).then(setData);
  }, []);

  if (!data) return null;
  if (data.totalAllTime === 0) return null; // Don't show until first session

  return (
    <div className="consistency-card" id="consistency-card">
      <div className="consistency-card__header">
        <h3 className="consistency-card__title">CONSISTENCY</h3>
        <span className="consistency-card__message">{data.message}</span>
      </div>

      {/* Big percentage */}
      <div className="consistency-card__score">
        <span className="consistency-card__number">{data.percentage}</span>
        <span className="consistency-card__percent">%</span>
      </div>
      <p className="consistency-card__sub">
        {data.daysActive} of {data.days} days
      </p>

      {/* Mini heatmap — last 30 days */}
      <div className="consistency-card__heatmap">
        {data.heatmapData.map((day, i) => (
          <div
            key={i}
            className={`consistency-card__day ${day.active ? 'consistency-card__day--active' : ''}`}
            title={`${day.date}${day.active ? ' — trained' : ''}`}
          />
        ))}
      </div>

      {/* Total all-time */}
      <p className="consistency-card__total">
        {data.totalAllTime} total sessions
      </p>
    </div>
  );
}
