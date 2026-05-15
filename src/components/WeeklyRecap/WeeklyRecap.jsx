import { useState, useEffect } from 'react';
import { getWeeklyRecapData } from '../../db/heatmapService.js';
import './WeeklyRecap.css';

/**
 * Weekly Recap — Phase 3
 *
 * Shows this week's summary with day-by-day bars.
 * Honest, factual copy. No fake hype.
 */
export default function WeeklyRecap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getWeeklyRecapData().then(setData);
  }, []);

  if (!data) return null;

  const maxExercises = Math.max(...data.weekDays.map(d => d.exerciseCount), 1);

  return (
    <div className="weekly-recap" id="weekly-recap">
      <div className="weekly-recap__header">
        <h3 className="weekly-recap__title">THIS WEEK</h3>
        <span className="weekly-recap__message">{data.message}</span>
      </div>

      {/* Stats row */}
      <div className="weekly-recap__stats">
        <div className="weekly-recap__stat-item">
          <span className="weekly-recap__stat-num">{data.totalSessions}</span>
          <span className="weekly-recap__stat-label">sessions</span>
        </div>
        <div className="weekly-recap__stat-item">
          <span className="weekly-recap__stat-num">{data.totalExercises}</span>
          <span className="weekly-recap__stat-label">exercises</span>
        </div>
        <div className="weekly-recap__stat-item">
          <span className="weekly-recap__stat-num">{data.totalPRs}</span>
          <span className="weekly-recap__stat-label">PRs</span>
        </div>
      </div>

      {/* Day bars */}
      <div className="weekly-recap__bars">
        {data.weekDays.map((day) => {
          const height = day.exerciseCount > 0
            ? Math.max(20, (day.exerciseCount / maxExercises) * 100)
            : 0;
          const hasPR = day.prCount > 0;

          return (
            <div key={day.label} className={`weekly-recap__bar-col ${day.isToday ? 'weekly-recap__bar-col--today' : ''} ${day.isFuture ? 'weekly-recap__bar-col--future' : ''}`}>
              <div className="weekly-recap__bar-track">
                {day.exerciseCount > 0 && (
                  <div
                    className={`weekly-recap__bar-fill ${hasPR ? 'weekly-recap__bar-fill--pr' : ''}`}
                    style={{ height: `${height}%` }}
                  />
                )}
              </div>
              <span className="weekly-recap__bar-label">{day.label}</span>
              {hasPR && <span className="weekly-recap__bar-pr">🔥</span>}
            </div>
          );
        })}
      </div>

      {/* vs last week */}
      {data.prevWeekSessions > 0 && data.totalSessions > 0 && (
        <div className="weekly-recap__compare">
          {data.totalSessions > data.prevWeekSessions && (
            <span className="weekly-recap__compare-text weekly-recap__compare-text--up">
              ↑ {data.totalSessions - data.prevWeekSessions} more than last week
            </span>
          )}
          {data.totalSessions < data.prevWeekSessions && (
            <span className="weekly-recap__compare-text weekly-recap__compare-text--down">
              {data.prevWeekSessions - data.totalSessions} fewer than last week
            </span>
          )}
          {data.totalSessions === data.prevWeekSessions && (
            <span className="weekly-recap__compare-text">
              Same as last week — consistent
            </span>
          )}
        </div>
      )}
    </div>
  );
}
