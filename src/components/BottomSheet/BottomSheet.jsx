import { useState, useEffect, useRef } from 'react';
import { X, Search, PlusCircle } from 'lucide-react';
import db from '../../db/db.js';
import CustomExerciseForm from '../CustomExerciseForm/CustomExerciseForm.jsx';
import './BottomSheet.css';

const FILTER_TABS = [
  { id: 'all',   label: 'ALL' },
  { id: 'upper', label: 'UPPER' },
  { id: 'core',  label: 'CORE' },
  { id: 'lower', label: 'LOWER' },
];

/**
 * Add Exercise Bottom Sheet
 * Design System §7.8
 */
export default function BottomSheet({ isOpen, onClose, onSelectExercise, addedExerciseIds }) {
  const [exercises, setExercises] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      db.exercises.toArray().then(setExercises);
      setSearchQuery('');
      setActiveFilter('all');
      setShowCustomForm(false);
    }
  }, [isOpen]);

  const handleCustomCreated = (newExercise) => {
    setExercises(prev => [...prev, newExercise]);
    onSelectExercise(newExercise);
    onClose();
  };

  const filtered = exercises.filter(ex => {
    const matchesCategory = activeFilter === 'all' || ex.category === activeFilter;
    const matchesSearch = searchQuery === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div
        className="bottom-sheet"
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="bottom-sheet__handle" />

        {/* Header */}
        <div className="bottom-sheet__header">
          <h2 className="bottom-sheet__title">ADD EXERCISE</h2>
          <button className="bottom-sheet__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="bottom-sheet__search">
          <Search size={16} className="bottom-sheet__search-icon" />
          <input
            className="bottom-sheet__search-input"
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Filter tabs */}
        <div className="bottom-sheet__filters">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              className={`bottom-sheet__filter-tab ${activeFilter === tab.id ? 'bottom-sheet__filter-tab--active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="bottom-sheet__list">
          {filtered.map(exercise => {
            const isAdded = addedExerciseIds.includes(exercise.id);
            return (
              <button
                key={exercise.id}
                className={`bottom-sheet__exercise ${isAdded ? 'bottom-sheet__exercise--added' : ''}`}
                onClick={() => {
                  if (!isAdded) {
                    onSelectExercise(exercise);
                    onClose();
                  }
                }}
                disabled={isAdded}
              >
                <div className="bottom-sheet__exercise-info">
                  <span className="bottom-sheet__exercise-name">{exercise.name}</span>
                  <span className="bottom-sheet__exercise-meta">
                    {exercise.muscleGroup} · {exercise.difficulty} · {exercise.inputType === 'time' ? 'timed' : 'reps'}
                  </span>
                </div>
                {isAdded && <span className="bottom-sheet__added-label">Added</span>}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="bottom-sheet__empty">
              No exercises found.
            </div>
          )}

          {/* Create Custom Exercise */}
          <button
            className="bottom-sheet__create-custom"
            onClick={() => setShowCustomForm(true)}
            id="create-custom-exercise-btn"
          >
            <PlusCircle size={18} />
            CREATE YOUR OWN
          </button>
        </div>

        {/* Custom Exercise Form overlay */}
        <CustomExerciseForm
          isOpen={showCustomForm}
          onClose={() => setShowCustomForm(false)}
          onCreated={handleCustomCreated}
        />
      </div>
    </div>
  );
}
