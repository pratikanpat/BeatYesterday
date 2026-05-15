import db from './db.js';

/**
 * Challenge Service — Phase 3
 *
 * 30-day solo challenges. Pre-built presets.
 * "50 Pushup Month", "Plank Builder", etc.
 */

/**
 * Pre-built challenge presets.
 * Each maps to a seeded exercise by name.
 */
export const CHALLENGE_PRESETS = [
  {
    id: 'pushup-month',
    name: '50 PUSHUP MONTH',
    exerciseName: 'Regular Pushup',
    targetValue: 50,
    description: '50 pushups every day for 30 days',
    inputType: 'reps',
    icon: '💪',
  },
  {
    id: 'plank-builder',
    name: 'PLANK BUILDER',
    exerciseName: 'Plank',
    targetValue: 60,
    description: '60-second plank daily, build to 2 min',
    inputType: 'time',
    icon: '🧘',
  },
  {
    id: 'daily-mobility',
    name: 'DAILY MOBILITY',
    exerciseName: 'Regular Squat',
    targetValue: 30,
    description: '30 squats every day. Open those hips.',
    inputType: 'reps',
    icon: '🦵',
  },
  {
    id: 'core-consistency',
    name: 'CORE CONSISTENCY',
    exerciseName: 'Crunches',
    targetValue: 40,
    description: '40 crunches daily for 30 days',
    inputType: 'reps',
    icon: '🔥',
  },
];

/**
 * Start a new 30-day challenge from a preset.
 */
export async function startChallenge(preset) {
  // Find the exercise by name
  const exercise = await db.exercises
    .where('name')
    .equals(preset.exerciseName)
    .first();

  if (!exercise) {
    console.error(`[Challenge] Exercise "${preset.exerciseName}" not found`);
    return null;
  }

  const now = new Date();
  const startDate = now.toISOString().split('T')[0];
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 29); // 30 days inclusive

  const id = await db.challenges.add({
    name: preset.name,
    exerciseId: exercise.id,
    targetValue: preset.targetValue,
    startDate,
    endDate: endDate.toISOString().split('T')[0],
    isActive: true,
    preset: preset.id,
  });

  return id;
}

/**
 * Get all active challenges with progress data.
 */
export async function getActiveChallenges() {
  const challenges = await db.challenges
    .where('isActive')
    .equals(1)
    .toArray();

  const exercises = await db.exercises.toArray();
  const exerciseMap = {};
  for (const ex of exercises) exerciseMap[ex.id] = ex;

  const today = new Date().toISOString().split('T')[0];

  const results = await Promise.all(
    challenges.map(async (challenge) => {
      const logs = await db.challengeLogs
        .where('challengeId')
        .equals(challenge.id)
        .toArray();

      const exercise = exerciseMap[challenge.exerciseId];

      // Count days where target was met
      const daysCompleted = logs.filter(l => l.value >= challenge.targetValue).length;

      // Total days in challenge
      const start = new Date(challenge.startDate + 'T00:00:00');
      const end = new Date(challenge.endDate + 'T00:00:00');
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      // Days elapsed
      const todayDate = new Date(today + 'T00:00:00');
      const daysElapsed = Math.min(
        Math.ceil((todayDate - start) / (1000 * 60 * 60 * 24)) + 1,
        totalDays
      );

      // Days remaining
      const daysRemaining = Math.max(0, totalDays - daysElapsed);

      // Check if challenge is expired
      const isExpired = todayDate > end;

      // Today's value
      const todayLog = logs.find(l => l.date === today);

      // Get preset info
      const preset = CHALLENGE_PRESETS.find(p => p.id === challenge.preset);

      return {
        ...challenge,
        exerciseName: exercise?.name || 'Unknown',
        inputType: exercise?.inputType || 'reps',
        daysCompleted,
        totalDays,
        daysElapsed,
        daysRemaining,
        isExpired,
        todayValue: todayLog?.value || 0,
        todayDone: todayLog ? todayLog.value >= challenge.targetValue : false,
        progress: Math.round((daysCompleted / totalDays) * 100),
        icon: preset?.icon || '🎯',
        description: preset?.description || '',
      };
    })
  );

  return results;
}

/**
 * Log progress for a challenge on a specific date.
 * Called automatically when a session is saved.
 */
export async function logChallengeProgress(challengeId, date, value) {
  // Check if already logged today
  const existing = await db.challengeLogs
    .where('challengeId')
    .equals(challengeId)
    .filter(l => l.date === date)
    .first();

  if (existing) {
    // Update with higher value
    if (value > existing.value) {
      await db.challengeLogs.update(existing.id, { value });
    }
  } else {
    await db.challengeLogs.add({
      challengeId,
      date,
      value,
    });
  }
}

/**
 * Check if any active challenges match logged exercises.
 * Called after saving a session.
 */
export async function updateChallengesFromSession(logs) {
  const activeChallenges = await db.challenges
    .where('isActive')
    .equals(1)
    .toArray();

  if (activeChallenges.length === 0) return;

  const today = new Date().toISOString().split('T')[0];

  for (const challenge of activeChallenges) {
    // Check if challenge is expired
    if (today > challenge.endDate) {
      await db.challenges.update(challenge.id, { isActive: false });
      continue;
    }

    // Find matching logs
    const matchingLogs = logs.filter(l => l.exerciseId === challenge.exerciseId);
    if (matchingLogs.length === 0) continue;

    // Sum all values for this exercise today
    const totalValue = matchingLogs.reduce((sum, l) => {
      const val = l.reps ?? l.durationSec ?? 0;
      return sum + val;
    }, 0);

    if (totalValue > 0) {
      await logChallengeProgress(challenge.id, today, totalValue);
    }
  }
}

/**
 * Get available presets (not already active).
 */
export async function getAvailablePresets() {
  const activeChallenges = await db.challenges
    .where('isActive')
    .equals(1)
    .toArray();

  const activePresetIds = new Set(activeChallenges.map(c => c.preset));

  return CHALLENGE_PRESETS.filter(p => !activePresetIds.has(p.id));
}

/**
 * Cancel/delete a challenge.
 */
export async function cancelChallenge(challengeId) {
  await db.challengeLogs
    .where('challengeId')
    .equals(challengeId)
    .delete();
  await db.challenges.delete(challengeId);
}
