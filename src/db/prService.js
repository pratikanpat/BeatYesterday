import db from './db.js';

/**
 * PR Detection — checks if a new value beats the existing PR for an exercise.
 * If yes, updates the PR record and returns true (triggers celebration).
 * If no existing PR, the first logged value becomes the PR.
 */
export async function checkAndUpdatePR(exerciseId, newValue) {
  if (!newValue || newValue <= 0) return false;

  const existing = await db.prs
    .where('exerciseId')
    .equals(exerciseId)
    .first();

  if (!existing || newValue > existing.value) {
    if (existing) {
      // Update existing PR
      await db.prs.update(existing.id, {
        value: newValue,
        achievedAt: new Date(),
      });
    } else {
      // First PR for this exercise
      await db.prs.add({
        exerciseId,
        value: newValue,
        achievedAt: new Date(),
      });
    }
    return true; // Show celebration
  }
  return false;
}

/**
 * Get the current PR for a specific exercise.
 */
export async function getPR(exerciseId) {
  return db.prs
    .where('exerciseId')
    .equals(exerciseId)
    .first();
}

/**
 * Get all PRs mapped by exerciseId for quick lookup.
 */
export async function getAllPRs() {
  const prs = await db.prs.toArray();
  const map = {};
  for (const pr of prs) {
    map[pr.exerciseId] = pr;
  }
  return map;
}

/**
 * Get the most recent log value for an exercise (for delta display).
 */
export async function getLastLogValue(exerciseId) {
  const logs = await db.logs
    .where('exerciseId')
    .equals(exerciseId)
    .sortBy('timestamp');

  if (logs.length < 1) return null;

  const lastLog = logs[logs.length - 1];
  return lastLog.reps ?? lastLog.durationSec ?? null;
}

/**
 * Get recent log values for sparkline chart (last N sessions for an exercise).
 */
export async function getRecentLogs(exerciseId, limit = 14) {
  const logs = await db.logs
    .where('exerciseId')
    .equals(exerciseId)
    .sortBy('timestamp');

  return logs.slice(-limit).map(log => ({
    value: log.reps ?? log.durationSec ?? 0,
    date: log.timestamp,
  }));
}
