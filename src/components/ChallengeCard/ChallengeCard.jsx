import { Trash2, Check } from 'lucide-react';
import './ChallengeCard.css';

/**
 * Challenge Card — Phase 3
 *
 * Shows a 30-day challenge with progress bar and daily target.
 */
export default function ChallengeCard({ challenge, onCancel }) {
  const unit = challenge.inputType === 'time' ? 'sec' : 'reps';

  return (
    <div className={`challenge-card ${challenge.todayDone ? 'challenge-card--done' : ''}`} id={`challenge-${challenge.id}`}>
      <div className="challenge-card__header">
        <span className="challenge-card__icon">{challenge.icon}</span>
        <div className="challenge-card__info">
          <span className="challenge-card__name">{challenge.name}</span>
          <span className="challenge-card__desc">{challenge.description}</span>
        </div>
        <button
          className="challenge-card__cancel"
          onClick={(e) => { e.stopPropagation(); onCancel(challenge.id); }}
          aria-label="Cancel challenge"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="challenge-card__progress-wrap">
        <div className="challenge-card__progress-bar">
          <div
            className="challenge-card__progress-fill"
            style={{ width: `${Math.min(challenge.progress, 100)}%` }}
          />
        </div>
        <span className="challenge-card__progress-text">
          {challenge.daysCompleted}/{challenge.totalDays} days
        </span>
      </div>

      {/* Daily status */}
      <div className="challenge-card__daily">
        <div className="challenge-card__daily-target">
          <span className="challenge-card__daily-label">Daily target</span>
          <span className="challenge-card__daily-value">
            {challenge.targetValue} {unit}
          </span>
        </div>
        <div className="challenge-card__daily-status">
          {challenge.todayDone ? (
            <span className="challenge-card__today-done">
              <Check size={14} /> Done today
            </span>
          ) : (
            <span className="challenge-card__today-pending">
              {challenge.todayValue > 0
                ? `${challenge.todayValue}/${challenge.targetValue} ${unit}`
                : 'Not yet today'
              }
            </span>
          )}
        </div>
      </div>

      {/* Days remaining */}
      {challenge.daysRemaining > 0 && (
        <span className="challenge-card__remaining">
          {challenge.daysRemaining} day{challenge.daysRemaining !== 1 ? 's' : ''} left
        </span>
      )}
      {challenge.isExpired && (
        <span className="challenge-card__expired">Challenge complete</span>
      )}
    </div>
  );
}
