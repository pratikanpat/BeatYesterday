import db from './db.js';

/**
 * Consistency Service — Phase 2
 *
 * Rolling 30-day consistency score.
 * "Trained 60% of days this month" — no streaks, no guilt.
 */

/**
 * Get consistency stats for the last N days.
 * @param {number} days - Window size (default 30)
 * @returns {Object} Consistency data
 */
export async function getConsistencyScore(days = 30) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);

  const allSessions = await db.sessions.toArray();

  // Get unique training dates within window
  const trainingDates = new Set();
  const allDates = new Set();

  for (const session of allSessions) {
    const sessionDate = new Date(session.date + 'T00:00:00');
    if (sessionDate >= startDate) {
      trainingDates.add(session.date);
    }
    allDates.add(session.date);
  }

  const daysActive = trainingDates.size;
  const percentage = Math.round((daysActive / days) * 100);

  // Generate heatmap data (last 30 days with activity marker)
  const heatmapData = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    heatmapData.push({
      date: dateStr,
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: date.getDate(),
      active: trainingDates.has(dateStr),
    });
  }

  // Weekly breakdown
  const weeklyData = [];
  for (let w = 0; w < Math.ceil(days / 7); w++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + w * 7);
    let weekActive = 0;
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      if (trainingDates.has(dateStr)) weekActive++;
    }
    weeklyData.push({ weekNum: w + 1, daysActive: weekActive });
  }

  // Determine message
  let message;
  if (percentage >= 80) message = 'Machine mode. 🔥';
  else if (percentage >= 60) message = 'Solid consistency.';
  else if (percentage >= 40) message = 'Building momentum.';
  else if (percentage >= 20) message = "Still showing up. That counts.";
  else if (percentage > 0) message = "You're still moving.";
  else message = 'Start fresh today.';

  return {
    days,
    daysActive,
    percentage,
    heatmapData,
    weeklyData,
    totalAllTime: allDates.size,
    message,
  };
}

/**
 * Get muscle group coverage for the last N days.
 * Returns how many times each body area was trained.
 */
export async function getMuscleGroupCoverage(days = 14) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);

  const exercises = await db.exercises.toArray();
  const exerciseMap = {};
  for (const ex of exercises) {
    exerciseMap[ex.id] = ex;
  }

  // Get all logs from recent sessions
  const sessions = await db.sessions.toArray();
  const recentSessionIds = sessions
    .filter(s => new Date(s.date + 'T00:00:00') >= startDate)
    .map(s => s.id);

  const logs = await db.logs.toArray();
  const recentLogs = logs.filter(l => recentSessionIds.includes(l.sessionId));

  // Count by muscle group
  const coverage = {};
  for (const log of recentLogs) {
    const ex = exerciseMap[log.exerciseId];
    if (!ex) continue;
    const group = ex.muscleGroup;
    if (!coverage[group]) {
      coverage[group] = { count: 0, category: ex.category };
    }
    coverage[group].count++;
  }

  // Count by category
  const categoryCount = { upper: 0, core: 0, lower: 0 };
  for (const [, data] of Object.entries(coverage)) {
    if (categoryCount[data.category] !== undefined) {
      categoryCount[data.category] += data.count;
    }
  }

  return { coverage, categoryCount, days };
}
