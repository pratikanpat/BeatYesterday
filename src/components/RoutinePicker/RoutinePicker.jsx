import { useState, useEffect } from 'react';
import { X, Trash2, BookOpen } from 'lucide-react';
import { getAllRoutines, deleteRoutine } from '../../db/routinesService.js';
import './RoutinePicker.css';

/**
 * Routine Picker — Phase 2
 * Load a saved workout routine into today's session.
 */
export default function RoutinePicker({ isOpen, onClose, onLoadRoutine }) {
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    if (isOpen) {
      getAllRoutines().then(setRoutines);
    }
  }, [isOpen]);

  const handleDelete = async (e, routineId) => {
    e.stopPropagation();
    await deleteRoutine(routineId);
    setRoutines(prev => prev.filter(r => r.id !== routineId));
  };

  const handleLoad = (routine) => {
    onLoadRoutine(routine.exercises);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="routine-picker-overlay" onClick={onClose}>
      <div className="routine-picker" onClick={(e) => e.stopPropagation()}>
        <div className="routine-picker__handle" />

        <div className="routine-picker__header">
          <h2 className="routine-picker__title">MY ROUTINES</h2>
          <button className="routine-picker__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="routine-picker__list">
          {routines.length === 0 && (
            <div className="routine-picker__empty">
              <BookOpen size={32} className="routine-picker__empty-icon" />
              <p className="routine-picker__empty-text">No routines saved yet.</p>
              <p className="routine-picker__empty-sub">
                After logging a workout, tap "Save as Routine" to create one.
              </p>
            </div>
          )}

          {routines.map(routine => (
            <button
              key={routine.id}
              className="routine-picker__item"
              onClick={() => handleLoad(routine)}
            >
              <div className="routine-picker__item-info">
                <span className="routine-picker__item-name">{routine.name}</span>
                <span className="routine-picker__item-exercises">
                  {routine.exercises.map(e => e.name).join(' · ')}
                </span>
                <span className="routine-picker__item-count">
                  {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className="routine-picker__delete-btn"
                onClick={(e) => handleDelete(e, routine.id)}
                aria-label={`Delete ${routine.name}`}
              >
                <Trash2 size={16} />
              </button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
