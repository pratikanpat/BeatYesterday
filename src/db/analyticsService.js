import db from './db.js';

/**
 * Analytics Service — Phase 3.5
 *
 * Advanced analytics: exercise trends, moving averages,
 * sleep/energy correlation analysis.
 */

/**
 * Get exercise trend data for the last N days
 * Returns data points + trend direction
 */
export async function getExerciseTrend(exerciseId, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const logs = await db.logs
    .where('exerciseId')
    .equals(exerciseId)
    .toArray();

  // Filter by date and sort
  const sessions = await db.sessions.toArray();
  const sessionDateMap = {};
  for (const s of sessions) {
    sessionDateMap[s.id] = s.date;
  }

  const dataPoints = logs
    .filter(log => {
      const date = sessionDateMap[log.sessionId];
      return date && new Date(date) >= cutoff;
    })
    .map(log => ({
      date: sessionDateMap[log.sessionId],
      value: log.reps ?? log.durationSec ?? 0,
      timestamp: log.timestamp,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate 7-day moving average
  const withMA = dataPoints.map((point, i) => {
    const window = dataPoints.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    return {
      ...point,
      movingAvg: Math.round(avg * 10) / 10,
    };
  });

  // Determine trend direction
  let trend = 'stable';
  if (withMA.length >= 3) {
    const recent = withMA.slice(-3);
    const first = recent[0].movingAvg;
    const last = recent[recent.length - 1].movingAvg;
    const change = ((last - first) / first) * 100;

    if (change > 3) trend = 'improving';
    else if (change < -3) trend = 'declining';
  }

  return {
    data: withMA,
    trend,
    totalSessions: dataPoints.length,
  };
}

/**
 * Get sleep/energy correlation data
 * Groups sessions by energy level and calculates average performance
 */
export async function getSleepEnergyCorrelation() {
  const checkins = await db.checkins.toArray();

  if (checkins.length < 5) {
    return { hasEnoughData: false, data: [], checkinCount: checkins.length };
  }

  // Get sessions that have checkins
  const sessionIds = checkins.map(c => c.sessionId).filter(Boolean);
  const sessions = await db.sessions.toArray();
  const sessionMap = {};
  for (const s of sessions) {
    sessionMap[s.id] = s;
  }

  // Get all logs for these sessions
  const logs = await db.logs.toArray();
  const exercises = await db.exercises.toArray();
  const exerciseMap = {};
  for (const ex of exercises) {
    exerciseMap[ex.id] = ex;
  }

  // Group performance by energy level
  const energyBuckets = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const sleepBuckets = { 1: [], 2: [], 3: [], 4: [], 5: [] };

  for (const checkin of checkins) {
    const sessionLogs = logs.filter(l => l.sessionId === checkin.sessionId);
    if (sessionLogs.length === 0) continue;

    // Calculate total volume for the session (sum of all reps/secs)
    const totalVolume = sessionLogs.reduce((sum, log) => {
      return sum + (log.reps ?? log.durationSec ?? 0);
    }, 0);

    const exerciseCount = sessionLogs.length;

    if (checkin.energyLevel && energyBuckets[checkin.energyLevel]) {
      energyBuckets[checkin.energyLevel].push({ totalVolume, exerciseCount });
    }
    if (checkin.sleepQuality && sleepBuckets[checkin.sleepQuality]) {
      sleepBuckets[checkin.sleepQuality].push({ totalVolume, exerciseCount });
    }
  }

  // Calculate averages per energy level
  const energyData = Object.entries(energyBuckets).map(([level, sessions]) => {
    const avgVolume = sessions.length > 0
      ? Math.round(sessions.reduce((s, v) => s + v.totalVolume, 0) / sessions.length)
      : 0;
    const avgExercises = sessions.length > 0
      ? Math.round(sessions.reduce((s, v) => s + v.exerciseCount, 0) / sessions.length * 10) / 10
      : 0;
    return {
      level: Number(level),
      label: getEnergyLabel(Number(level)),
      sessions: sessions.length,
      avgVolume,
      avgExercises,
    };
  }).filter(d => d.sessions > 0);

  const sleepData = Object.entries(sleepBuckets).map(([level, sessions]) => {
    const avgVolume = sessions.length > 0
      ? Math.round(sessions.reduce((s, v) => s + v.totalVolume, 0) / sessions.length)
      : 0;
    return {
      level: Number(level),
      label: getSleepLabel(Number(level)),
      sessions: sessions.length,
      avgVolume,
    };
  }).filter(d => d.sessions > 0);

  return {
    hasEnoughData: true,
    energyData,
    sleepData,
    checkinCount: checkins.length,
  };
}

function getEnergyLabel(level) {
  const labels = { 1: 'Exhausted', 2: 'Low', 3: 'Average', 4: 'Good', 5: 'Peak' };
  return labels[level] || String(level);
}

function getSleepLabel(level) {
  const labels = { 1: 'Terrible', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Great' };
  return labels[level] || String(level);
}
