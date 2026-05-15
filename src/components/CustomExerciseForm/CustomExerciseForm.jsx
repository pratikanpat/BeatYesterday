import { useState } from 'react';
import { X } from 'lucide-react';
import db from '../../db/db.js';
import './CustomExerciseForm.css';

const CATEGORIES = [
  { value: 'upper', label: 'Upper Body' },
  { value: 'core',  label: 'Core' },
  { value: 'lower', label: 'Lower Body' },
];

const INPUT_TYPES = [
  { value: 'reps', label: 'Reps' },
  { value: 'time', label: 'Time (sec)' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

/**
 * Custom Exercise Form — Phase 2
 * Allows users to create their own exercises.
 */
export default function CustomExerciseForm({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('upper');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [inputType, setInputType] = useState('reps');
  const [difficulty, setDifficulty] = useState('beginner');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Exercise name is required');
      return;
    }
    if (!muscleGroup.trim()) {
      setError('Muscle group is required');
      return;
    }

    try {
      const id = await db.exercises.add({
        name: name.trim(),
        category,
        muscleGroup: muscleGroup.trim(),
        inputType,
        difficulty,
        isCustom: true,
      });

      // Reset form
      setName('');
      setMuscleGroup('');
      setCategory('upper');
      setInputType('reps');
      setDifficulty('beginner');
      setError('');

      onCreated?.({ id, name: name.trim(), category, muscleGroup: muscleGroup.trim(), inputType, difficulty, isCustom: true });
      onClose();
    } catch (err) {
      setError('Failed to create exercise');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="custom-exercise-overlay" onClick={onClose}>
      <div className="custom-exercise-form" onClick={(e) => e.stopPropagation()}>
        <div className="custom-exercise-form__handle" />

        <div className="custom-exercise-form__header">
          <h2 className="custom-exercise-form__title">CREATE EXERCISE</h2>
          <button className="custom-exercise-form__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Name */}
        <div className="custom-exercise-form__field">
          <label className="custom-exercise-form__label">EXERCISE NAME</label>
          <input
            className="custom-exercise-form__input"
            type="text"
            placeholder="e.g. Hindu Pushup"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            autoFocus
          />
        </div>

        {/* Muscle Group */}
        <div className="custom-exercise-form__field">
          <label className="custom-exercise-form__label">MUSCLE GROUP</label>
          <input
            className="custom-exercise-form__input"
            type="text"
            placeholder="e.g. Chest, Core, Quads..."
            value={muscleGroup}
            onChange={(e) => { setMuscleGroup(e.target.value); setError(''); }}
          />
        </div>

        {/* Category */}
        <div className="custom-exercise-form__field">
          <label className="custom-exercise-form__label">BODY AREA</label>
          <div className="custom-exercise-form__pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`custom-exercise-form__pill ${category === cat.value ? 'custom-exercise-form__pill--active' : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Type */}
        <div className="custom-exercise-form__field">
          <label className="custom-exercise-form__label">TRACKING</label>
          <div className="custom-exercise-form__pills">
            {INPUT_TYPES.map(it => (
              <button
                key={it.value}
                className={`custom-exercise-form__pill ${inputType === it.value ? 'custom-exercise-form__pill--active' : ''}`}
                onClick={() => setInputType(it.value)}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="custom-exercise-form__field">
          <label className="custom-exercise-form__label">DIFFICULTY</label>
          <div className="custom-exercise-form__pills">
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                className={`custom-exercise-form__pill ${difficulty === d.value ? 'custom-exercise-form__pill--active' : ''}`}
                onClick={() => setDifficulty(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p className="custom-exercise-form__error">{error}</p>}

        {/* Submit */}
        <button className="custom-exercise-form__submit" onClick={handleSubmit}>
          CREATE EXERCISE
        </button>
      </div>
    </div>
  );
}
