import { useState, useEffect, useRef } from 'react';
import { getYearHeatmapData } from '../../db/heatmapService.js';
import './YearHeatmap.css';

/**
 * Year Heatmap — Phase 3
 *
 * GitHub-style 365-day activity grid.
 * Horizontally scrollable, auto-scrolls to today.
 * Tap a day → tooltip with session details.
 */

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

export default function YearHeatmap() {
  const [data, setData] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    getYearHeatmapData().then(setData);
  }, []);

  // Auto-scroll to right edge (today) on load
  useEffect(() => {
    if (data && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      });
    }
  }, [data]);

  if (!data) return null;
  if (data.totalActiveDays === 0) {
    return (
      <div className="year-heatmap" id="year-heatmap">
        <div className="year-heatmap__header">
          <h3 className="year-heatmap__title">ACTIVITY</h3>
        </div>
        <div className="year-heatmap__empty">
          <p className="year-heatmap__empty-text">Log your first workout to see your year.</p>
        </div>
      </div>
    );
  }

  // Group days into weeks (columns)
  const weeks = [];
  let currentWeek = [];
  for (const day of data.days) {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Pad first week
  if (weeks.length > 0) {
    const firstWeek = weeks[0];
    while (firstWeek.length < 7) {
      firstWeek.unshift(null);
    }
  }

  // Find month label positions
  const monthPositions = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay && firstDay.month !== lastMonth) {
      monthPositions.push({ weekIdx, month: firstDay.month });
      lastMonth = firstDay.month;
    }
  });

  const handleDayClick = (day) => {
    if (!day || day.level === 0) {
      setTooltip(null);
      return;
    }
    const date = new Date(day.date + 'T00:00:00');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

    setTooltip({
      date: `${dayName} ${dayNum} ${monthName}`,
      sessions: day.sessionCount,
      exercises: day.exerciseCount,
      prs: day.prCount,
    });

    // Auto-dismiss tooltip
    setTimeout(() => setTooltip(null), 3000);
  };

  return (
    <div className="year-heatmap" id="year-heatmap">
      <div className="year-heatmap__header">
        <h3 className="year-heatmap__title">ACTIVITY</h3>
        <div className="year-heatmap__stats">
          <span className="year-heatmap__stat">
            <span className="year-heatmap__stat-num">{data.totalActiveDays}</span> days
          </span>
          <span className="year-heatmap__stat-divider">·</span>
          <span className="year-heatmap__stat">
            <span className="year-heatmap__stat-num">{data.totalSessions}</span> sessions
          </span>
          {data.currentStreak > 0 && (
            <>
              <span className="year-heatmap__stat-divider">·</span>
              <span className="year-heatmap__stat year-heatmap__stat--streak">
                <span className="year-heatmap__stat-num">{data.currentStreak}</span> day streak
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="year-heatmap__tooltip">
          <span className="year-heatmap__tooltip-date">{tooltip.date}</span>
          <span className="year-heatmap__tooltip-detail">
            {tooltip.exercises} exercise{tooltip.exercises !== 1 ? 's' : ''}
            {tooltip.prs > 0 && ` · ${tooltip.prs} PR${tooltip.prs !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="year-heatmap__scroll" ref={scrollRef}>
        <div className="year-heatmap__grid-wrap">
          {/* Day labels (left side) */}
          <div className="year-heatmap__day-labels">
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="year-heatmap__day-label">{label}</span>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="year-heatmap__grid">
            {/* Month labels row */}
            <div className="year-heatmap__month-labels">
              {monthPositions.map((mp, i) => (
                <span
                  key={i}
                  className="year-heatmap__month-label"
                  style={{ gridColumnStart: mp.weekIdx + 1 }}
                >
                  {MONTH_LABELS[mp.month]}
                </span>
              ))}
            </div>

            {/* Day cells */}
            <div className="year-heatmap__cells">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="year-heatmap__week">
                  {week.map((day, dayIdx) => (
                    <button
                      key={dayIdx}
                      className={`year-heatmap__cell ${day ? `year-heatmap__cell--level-${day.level}` : 'year-heatmap__cell--empty'}`}
                      onClick={() => handleDayClick(day)}
                      aria-label={day ? `${day.date}: ${day.exerciseCount} exercises` : ''}
                      disabled={!day}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="year-heatmap__legend">
        <span className="year-heatmap__legend-label">Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <span key={level} className={`year-heatmap__legend-cell year-heatmap__cell--level-${level}`} />
        ))}
        <span className="year-heatmap__legend-label">More</span>
      </div>
    </div>
  );
}
