import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAvailablePresets, startChallenge } from '../../db/challengeService.js';
import './ChallengeCreator.css';

/**
 * Challenge Creator — Phase 3
 *
 * Bottom sheet that shows available preset challenges.
 * Pick one → starts 30-day challenge.
 */
export default function ChallengeCreator({ isOpen, onClose, onChallengeStarted }) {
  const [presets, setPresets] = useState([]);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getAvailablePresets().then(setPresets);
    }
  }, [isOpen]);

  const handleStart = async (preset) => {
    setStarting(preset.id);
    try {
      await startChallenge(preset);
      onChallengeStarted?.();
      onClose();
    } catch (err) {
      console.error('[ChallengeCreator] Failed to start:', err);
    } finally {
      setStarting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="challenge-creator-overlay" onClick={onClose}>
      <div className="challenge-creator" onClick={e => e.stopPropagation()}>
        <div className="challenge-creator__handle" />

        <div className="challenge-creator__header">
          <h2 className="challenge-creator__title">START A CHALLENGE</h2>
          <button className="challenge-creator__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <p className="challenge-creator__subtitle">
          30 days. One exercise. Zero excuses.
        </p>

        <div className="challenge-creator__list">
          {presets.map(preset => (
            <button
              key={preset.id}
              className="challenge-creator__preset"
              onClick={() => handleStart(preset)}
              disabled={starting === preset.id}
            >
              <span className="challenge-creator__preset-icon">{preset.icon}</span>
              <div className="challenge-creator__preset-info">
                <span className="challenge-creator__preset-name">{preset.name}</span>
                <span className="challenge-creator__preset-desc">{preset.description}</span>
              </div>
              <span className="challenge-creator__preset-target">
                {preset.targetValue} {preset.inputType === 'time' ? 'sec' : 'reps'}/day
              </span>
            </button>
          ))}

          {presets.length === 0 && (
            <div className="challenge-creator__empty">
              All challenges are already active. 💪
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
