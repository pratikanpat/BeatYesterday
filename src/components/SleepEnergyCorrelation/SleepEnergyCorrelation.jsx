import { useState, useEffect } from 'react';
import { getSleepEnergyCorrelation } from '../../db/analyticsService.js';
import './SleepEnergyCorrelation.css';

/**
 * Sleep/Energy Correlation — Phase 3.5
 *
 * Shows how energy levels and sleep quality affect workout performance.
 * Only unlocks after 5+ check-ins exist.
 */
export default function SleepEnergyCorrelation() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getSleepEnergyCorrelation().then(setData);
  }, []);

  if (!data) return null;

  if (!data.hasEnoughData) {
    return (
      <div className="sleep-energy" id="sleep-energy-correlation">
        <div className="sleep-energy__header">
          <h3 className="sleep-energy__label">PERFORMANCE INSIGHTS</h3>
          <p className="sleep-energy__sublabel">
            How your energy and sleep affect your workouts
          </p>
        </div>
        <div className="sleep-energy__locked">
          <p className="sleep-energy__locked-text">
            🔒 Log {5 - data.checkinCount} more sessions with check-in to unlock
          </p>
          <p className="sleep-energy__locked-sub">
            Tap the energy check-in before your next session
          </p>
        </div>
      </div>
    );
  }

  const { energyData, sleepData } = data;

  // Find max volume for bar height scaling
  const maxEnergyVol = Math.max(...energyData.map(d => d.avgVolume), 1);
  const maxSleepVol = Math.max(...sleepData.map(d => d.avgVolume), 1);

  // Generate insight text
  const bestEnergy = energyData.reduce((best, d) =>
    d.avgVolume > (best?.avgVolume || 0) ? d : best, null);
  const bestSleep = sleepData.reduce((best, d) =>
    d.avgVolume > (best?.avgVolume || 0) ? d : best, null);

  const insightText = bestEnergy
    ? `You perform best at "${bestEnergy.label}" energy (avg ${bestEnergy.avgVolume} total volume).`
    : null;

  return (
    <div className="sleep-energy" id="sleep-energy-correlation">
      <div className="sleep-energy__header">
        <h3 className="sleep-energy__label">PERFORMANCE INSIGHTS</h3>
        <p className="sleep-energy__sublabel">
          How your energy and sleep affect your workouts
        </p>
      </div>

      {/* Energy Level Chart */}
      {energyData.length > 0 && (
        <div className="sleep-energy__section">
          <p className="sleep-energy__section-label">AVG VOLUME BY ENERGY</p>
          <div className="sleep-energy__bars">
            {energyData.map(d => (
              <div key={d.level} className="sleep-energy__bar-group">
                <span className="sleep-energy__bar-value">{d.avgVolume}</span>
                <div className="sleep-energy__bar-wrapper">
                  <div
                    className="sleep-energy__bar sleep-energy__bar--energy"
                    style={{ height: `${(d.avgVolume / maxEnergyVol) * 100}%` }}
                  />
                </div>
                <span className="sleep-energy__bar-label">{d.label}</span>
                <span className="sleep-energy__bar-sessions">{d.sessions}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sleep Quality Chart */}
      {sleepData.length > 0 && (
        <div className="sleep-energy__section">
          <p className="sleep-energy__section-label">AVG VOLUME BY SLEEP</p>
          <div className="sleep-energy__bars">
            {sleepData.map(d => (
              <div key={d.level} className="sleep-energy__bar-group">
                <span className="sleep-energy__bar-value">{d.avgVolume}</span>
                <div className="sleep-energy__bar-wrapper">
                  <div
                    className="sleep-energy__bar sleep-energy__bar--sleep"
                    style={{ height: `${(d.avgVolume / maxSleepVol) * 100}%` }}
                  />
                </div>
                <span className="sleep-energy__bar-label">{d.label}</span>
                <span className="sleep-energy__bar-sessions">{d.sessions}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      {insightText && (
        <p className="sleep-energy__insight">{insightText}</p>
      )}
    </div>
  );
}
