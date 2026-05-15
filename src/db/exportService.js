import db from './db.js';

/**
 * Export Service — Phase 3.5
 *
 * Exports all workout data as CSV.
 * Format: Date, Exercise, Value, Unit, PR
 */

/**
 * Generate CSV string of all session data
 */
export async function exportAllDataCSV() {
  const sessions = await db.sessions.orderBy('date').toArray();
  const logs = await db.logs.toArray();
  const exercises = await db.exercises.toArray();
  const prs = await db.prs.toArray();

  // Build lookup maps
  const exerciseMap = {};
  for (const ex of exercises) {
    exerciseMap[ex.id] = ex;
  }

  const prMap = {};
  for (const pr of prs) {
    prMap[pr.exerciseId] = pr.value;
  }

  // Group logs by session
  const logsBySession = {};
  for (const log of logs) {
    if (!logsBySession[log.sessionId]) {
      logsBySession[log.sessionId] = [];
    }
    logsBySession[log.sessionId].push(log);
  }

  // CSV header
  const rows = ['Date,Exercise,Value,Unit,Is PR,Category,Muscle Group'];

  for (const session of sessions) {
    const sessionLogs = logsBySession[session.id] || [];

    for (const log of sessionLogs) {
      const exercise = exerciseMap[log.exerciseId];
      if (!exercise) continue;

      const value = log.reps ?? log.durationSec ?? 0;
      const unit = exercise.inputType === 'time' ? 'seconds' : 'reps';
      const isPR = prMap[log.exerciseId] === value ? 'Yes' : 'No';

      // Escape commas in exercise name
      const name = exercise.name.includes(',')
        ? `"${exercise.name}"`
        : exercise.name;

      rows.push(
        `${session.date},${name},${value},${unit},${isPR},${exercise.category},${exercise.muscleGroup}`
      );
    }
  }

  return rows.join('\n');
}

/**
 * Trigger CSV download
 */
export async function downloadCSV() {
  const csv = await exportAllDataCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `beatyesterday-export-${date}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
