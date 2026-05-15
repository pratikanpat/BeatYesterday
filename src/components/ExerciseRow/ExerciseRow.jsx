import { useRef } from 'react';
import { X } from 'lucide-react';
import './ExerciseRow.css';

/**
 * A single exercise row in the Today screen.
 * Design System §7.2
 */
export default function ExerciseRow({
  exerciseName,
  muscleGroup,
  inputType,
  value,
  previousBest,
  onValueChange,
  onRemove,
  isPR,
}) {
  const inputRef = useRef(null);
  const unit = inputType === 'time' ? 'sec' : 'reps';

  // Calculate delta from previous best
  const numValue = Number(value);
  const delta = previousBest && numValue > 0 ? numValue - previousBest : null;

  return (
    <div className="exercise-row" id={`exercise-row-${exerciseName.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="exercise-row__left">
        <div className="exercise-row__name-row">
          <span className="exercise-row__name">{exerciseName}</span>
          {isPR && (
            <span className="exercise-row__pr-badge">PR 🔥</span>
          )}
        </div>
        <span className="exercise-row__meta">
          {muscleGroup}
          {delta !== null && delta > 0 && (
            <span className="exercise-row__delta exercise-row__delta--positive">
              {' '}· +{delta} from best
            </span>
          )}
          {delta !== null && delta === 0 && (
            <span className="exercise-row__delta exercise-row__delta--neutral">
              {' '}· = matched best
            </span>
          )}
        </span>
      </div>
      <div className="exercise-row__right">
        <input
          ref={inputRef}
          id={`input-${exerciseName.replace(/\s+/g, '-').toLowerCase()}`}
          className="exercise-row__input"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
        <span className="exercise-row__unit">{unit}</span>
        <button
          className="exercise-row__remove"
          onClick={onRemove}
          aria-label={`Remove ${exerciseName}`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
