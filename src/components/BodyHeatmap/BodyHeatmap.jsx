import { useState, useEffect } from 'react';
import { getMuscleGroupCoverage } from '../../db/consistencyService.js';
import './BodyHeatmap.css';

/**
 * Body Area Heatmap — Phase 2
 *
 * Visual map of muscle groups trained recently.
 * Uses a simplified body silhouette with color-coded regions.
 */

const BODY_REGIONS = {
  upper: [
    { id: 'chest',     label: 'Chest',     groups: ['Chest'] },
    { id: 'back',      label: 'Back',      groups: ['Back'] },
    { id: 'shoulders', label: 'Shoulders', groups: ['Shoulders'] },
    { id: 'triceps',   label: 'Triceps',   groups: ['Triceps'] },
  ],
  core: [
    { id: 'core',      label: 'Core',      groups: ['Core'] },
  ],
  lower: [
    { id: 'quads',     label: 'Quads',     groups: ['Quads'] },
    { id: 'glutes',    label: 'Glutes',    groups: ['Glutes'] },
    { id: 'calves',    label: 'Calves',    groups: ['Calves'] },
  ],
};

function getHeatLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

export default function BodyHeatmap() {
  const [coverage, setCoverage] = useState(null);
  const [days, setDays] = useState(14);

  useEffect(() => {
    getMuscleGroupCoverage(days).then(setCoverage);
  }, [days]);

  if (!coverage) return null;

  const getCountForRegion = (region) => {
    let total = 0;
    for (const group of region.groups) {
      total += coverage.coverage[group]?.count || 0;
    }
    return total;
  };

  return (
    <div className="body-heatmap" id="body-heatmap">
      <div className="body-heatmap__header">
        <h3 className="body-heatmap__title">BODY MAP</h3>
        <div className="body-heatmap__period-toggle">
          <button
            className={`body-heatmap__period-btn ${days === 7 ? 'body-heatmap__period-btn--active' : ''}`}
            onClick={() => setDays(7)}
          >
            7D
          </button>
          <button
            className={`body-heatmap__period-btn ${days === 14 ? 'body-heatmap__period-btn--active' : ''}`}
            onClick={() => setDays(14)}
          >
            14D
          </button>
          <button
            className={`body-heatmap__period-btn ${days === 30 ? 'body-heatmap__period-btn--active' : ''}`}
            onClick={() => setDays(30)}
          >
            30D
          </button>
        </div>
      </div>

      {/* Body regions grid */}
      <div className="body-heatmap__body">
        {Object.entries(BODY_REGIONS).map(([category, regions]) => (
          <div key={category} className="body-heatmap__section">
            <span className="body-heatmap__section-label">{category.toUpperCase()}</span>
            <div className="body-heatmap__muscles">
              {regions.map(region => {
                const count = getCountForRegion(region);
                const level = getHeatLevel(count);
                return (
                  <div
                    key={region.id}
                    className={`body-heatmap__muscle body-heatmap__muscle--level-${level}`}
                  >
                    <span className="body-heatmap__muscle-name">{region.label}</span>
                    <span className="body-heatmap__muscle-count">
                      {count > 0 ? `${count}×` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="body-heatmap__legend">
        <span className="body-heatmap__legend-label">None</span>
        <div className="body-heatmap__legend-scale">
          {[0, 1, 2, 3, 4].map(level => (
            <span key={level} className={`body-heatmap__legend-dot body-heatmap__legend-dot--level-${level}`} />
          ))}
        </div>
        <span className="body-heatmap__legend-label">Heavy</span>
      </div>

      {/* Category summary */}
      <div className="body-heatmap__summary">
        {Object.entries(coverage.categoryCount).map(([cat, count]) => (
          <div key={cat} className="body-heatmap__summary-item">
            <span className="body-heatmap__summary-count">{count}</span>
            <span className="body-heatmap__summary-label">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
