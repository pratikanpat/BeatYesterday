import { useState, useEffect } from 'react';
import db from '../../db/db.js';
import './GrindModeSelector.css';

/**
 * Grind Mode Selector — Phase 3
 *
 * Student / Founder / Recovery — identity-based profiles
 * that adjust micro-copy tone and suggested exercises.
 */

const GRIND_MODES = [
  {
    id: 'student',
    label: 'STUDENT',
    emoji: '📚',
    description: 'Chaotic schedule, dorm rooms, exam weeks.',
    vibe: 'Still showed up despite exam week.',
  },
  {
    id: 'founder',
    label: 'FOUNDER',
    emoji: '🚀',
    description: 'Time-starved, desk-bound, shipping mode.',
    vibe: '30 min > 0 min. Ship it.',
  },
  {
    id: 'recovery',
    label: 'RECOVERY',
    emoji: '🌱',
    description: 'Coming back from injury or a break.',
    vibe: 'One rep is still a rep.',
  },
];

export default function GrindModeSelector() {
  const [activeMode, setActiveMode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await db.userProfile.toCollection().first();
      if (profile) {
        setActiveMode(profile.grindMode || null);
      }
    } catch (e) {
      // Table might not exist yet
    }
    setLoading(false);
  }

  async function selectMode(modeId) {
    setActiveMode(modeId);
    try {
      const profile = await db.userProfile.toCollection().first();
      if (profile) {
        await db.userProfile.update(profile.id, { grindMode: modeId });
      } else {
        await db.userProfile.add({
          grindMode: modeId,
          onboardingComplete: true,
          favoriteExercises: [],
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.error('[GrindMode] Save failed:', e);
    }
  }

  if (loading) return null;

  return (
    <div className="grind-mode" id="grind-mode-selector">
      <h3 className="grind-mode__title">GRIND MODE</h3>
      <p className="grind-mode__subtitle">
        {activeMode
          ? GRIND_MODES.find(m => m.id === activeMode)?.vibe
          : 'Pick your vibe. Adjusts copy and suggestions.'}
      </p>

      <div className="grind-mode__options">
        {GRIND_MODES.map(mode => (
          <button
            key={mode.id}
            className={`grind-mode__option ${activeMode === mode.id ? 'grind-mode__option--active' : ''}`}
            onClick={() => selectMode(mode.id)}
          >
            <span className="grind-mode__emoji">{mode.emoji}</span>
            <div className="grind-mode__option-info">
              <span className="grind-mode__option-label">{mode.label}</span>
              <span className="grind-mode__option-desc">{mode.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { GRIND_MODES };
