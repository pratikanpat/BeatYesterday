import { useState, useEffect } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import db from '../../db/db.js';
import './Onboarding.css';

/**
 * Minimal Onboarding — Phase 3
 *
 * First launch only. Pick 3-5 exercises → done.
 * No fluff. No 12-step wizards. No personality quizzes.
 */
export default function Onboarding({ onComplete }) {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    db.exercises.toArray().then(setExercises);
  }, []);

  const toggleExercise = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDone = async () => {
    try {
      const profile = await db.userProfile.toCollection().first();
      if (profile) {
        await db.userProfile.update(profile.id, {
          onboardingComplete: true,
          favoriteExercises: Array.from(selected),
        });
      } else {
        await db.userProfile.add({
          grindMode: null,
          onboardingComplete: true,
          favoriteExercises: Array.from(selected),
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.error('[Onboarding] Save failed:', e);
    }
    onComplete();
  };

  // Group by category
  const grouped = { upper: [], core: [], lower: [] };
  for (const ex of exercises) {
    if (grouped[ex.category]) {
      grouped[ex.category].push(ex);
    }
  }

  const categoryLabels = { upper: 'UPPER BODY', core: 'CORE', lower: 'LOWER BODY' };

  return (
    <div className="onboarding" id="onboarding">
      <div className="onboarding__content">
        {/* Logo / branding */}
        <div className="onboarding__hero">
          <h1 className="onboarding__brand">BEAT<br />YESTERDAY</h1>
          <p className="onboarding__tagline">Half an hour still counts.</p>
        </div>

        {/* Pick exercises */}
        <div className="onboarding__picker">
          <p className="onboarding__picker-label">
            Pick exercises you actually do.
          </p>
          <p className="onboarding__picker-sub">
            {selected.size === 0
              ? 'Tap to select. Skip if unsure.'
              : `${selected.size} selected`}
          </p>

          <div className="onboarding__categories">
            {Object.entries(grouped).map(([category, exList]) => (
              <div key={category} className="onboarding__category">
                <span className="onboarding__category-label">
                  {categoryLabels[category]}
                </span>
                <div className="onboarding__exercise-grid">
                  {exList.map(ex => (
                    <button
                      key={ex.id}
                      className={`onboarding__exercise ${selected.has(ex.id) ? 'onboarding__exercise--selected' : ''}`}
                      onClick={() => toggleExercise(ex.id)}
                    >
                      <span className="onboarding__exercise-name">{ex.name}</span>
                      {selected.has(ex.id) && (
                        <Check size={14} className="onboarding__exercise-check" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="onboarding__footer">
        <button className="onboarding__cta" onClick={handleDone}>
          {selected.size > 0 ? "LET'S GO" : 'SKIP FOR NOW'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
