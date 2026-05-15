/**
 * Pre-seeded exercise library — ~30 bodyweight exercises.
 * From design_system.md Section 11.
 * Custom exercises deferred to Phase 2.
 */

export const SEED_EXERCISES = [
  // ── UPPER BODY — Chest ──
  { name: 'Regular Pushup',       category: 'upper', muscleGroup: 'Chest',     inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Wide Pushup',          category: 'upper', muscleGroup: 'Chest',     inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Diamond Pushup',       category: 'upper', muscleGroup: 'Chest',     inputType: 'reps', difficulty: 'intermediate', isCustom: false },
  { name: 'Decline Pushup',       category: 'upper', muscleGroup: 'Chest',     inputType: 'reps', difficulty: 'intermediate', isCustom: false },
  { name: 'Incline Pushup',       category: 'upper', muscleGroup: 'Chest',     inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Pike Pushup',          category: 'upper', muscleGroup: 'Shoulders', inputType: 'reps', difficulty: 'intermediate', isCustom: false },
  { name: 'Archer Pushup',        category: 'upper', muscleGroup: 'Chest',     inputType: 'reps', difficulty: 'advanced',     isCustom: false },

  // ── UPPER BODY — Back ──
  { name: 'Pullup',               category: 'upper', muscleGroup: 'Back',      inputType: 'reps', difficulty: 'advanced',     isCustom: false },
  { name: 'Chinup',               category: 'upper', muscleGroup: 'Back',      inputType: 'reps', difficulty: 'intermediate', isCustom: false },
  { name: 'Australian Row',       category: 'upper', muscleGroup: 'Back',      inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Negative Pullup',      category: 'upper', muscleGroup: 'Back',      inputType: 'reps', difficulty: 'intermediate', isCustom: false },

  // ── UPPER BODY — Shoulders ──
  { name: 'Handstand Hold',       category: 'upper', muscleGroup: 'Shoulders', inputType: 'time', difficulty: 'advanced',     isCustom: false },
  { name: 'Lateral Raise',        category: 'upper', muscleGroup: 'Shoulders', inputType: 'reps', difficulty: 'beginner',     isCustom: false },

  // ── UPPER BODY — Triceps ──
  { name: 'Chair Dip',            category: 'upper', muscleGroup: 'Triceps',   inputType: 'reps', difficulty: 'beginner',     isCustom: false },

  // ── CORE ──
  { name: 'Plank',                category: 'core',  muscleGroup: 'Core',      inputType: 'time', difficulty: 'beginner',     isCustom: false },
  { name: 'Side Plank',           category: 'core',  muscleGroup: 'Core',      inputType: 'time', difficulty: 'beginner',     isCustom: false },
  { name: 'Crunches',             category: 'core',  muscleGroup: 'Core',      inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Leg Raises',           category: 'core',  muscleGroup: 'Core',      inputType: 'reps', difficulty: 'intermediate', isCustom: false },
  { name: 'V-Sits',               category: 'core',  muscleGroup: 'Core',      inputType: 'reps', difficulty: 'intermediate', isCustom: false },
  { name: 'Russian Twists',       category: 'core',  muscleGroup: 'Core',      inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Hollow Body Hold',     category: 'core',  muscleGroup: 'Core',      inputType: 'time', difficulty: 'intermediate', isCustom: false },

  // ── LOWER BODY ──
  { name: 'Regular Squat',        category: 'lower', muscleGroup: 'Quads',     inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Sumo Squat',           category: 'lower', muscleGroup: 'Quads',     inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Jump Squat',           category: 'lower', muscleGroup: 'Quads',     inputType: 'reps', difficulty: 'intermediate', isCustom: false },
  { name: 'Bulgarian Split Squat',category: 'lower', muscleGroup: 'Quads',     inputType: 'reps', difficulty: 'advanced',     isCustom: false },
  { name: 'Pistol Squat Assisted',category: 'lower', muscleGroup: 'Quads',     inputType: 'reps', difficulty: 'advanced',     isCustom: false },
  { name: 'Lunge',                category: 'lower', muscleGroup: 'Quads',     inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Reverse Lunge',        category: 'lower', muscleGroup: 'Quads',     inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Glute Bridge',         category: 'lower', muscleGroup: 'Glutes',    inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Hip Thrust',           category: 'lower', muscleGroup: 'Glutes',    inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Donkey Kicks',         category: 'lower', muscleGroup: 'Glutes',    inputType: 'reps', difficulty: 'beginner',     isCustom: false },
  { name: 'Calf Raise',           category: 'lower', muscleGroup: 'Calves',    inputType: 'reps', difficulty: 'beginner',     isCustom: false },
];

/**
 * Seeds the database with exercises if empty.
 * Called once on app startup.
 */
export async function seedExercises(db) {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.exercises.bulkAdd(SEED_EXERCISES);
    console.log(`[BeatYesterday] Seeded ${SEED_EXERCISES.length} exercises`);
  }
}
