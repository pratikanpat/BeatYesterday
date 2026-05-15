import db from './db.js';

/**
 * Heatmap Service — Phase 3
 *
 * Provides data for the GitHub-style year heatmap
 * and weekly recap component.
 */

/**
 * Get 365 days of activity data for the year heatmap.
 * Returns newest date last (scrolls to right edge on mobile).
 */
export async function getYearHeatmapData() {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 364); // 365 days including today
  startDate.setHours(0, 0, 0, 0);

  // Load all sessions
  const allSessions = await db.sessions.toArray();
  const allLogs = await db.logs.toArray();
  const allPRs = await db.prs.toArray();

  // Build session date map: date → { sessionCount, logIds[] }
  const sessionMap = {};
  for (const session of allSessions) {
    if (!sessionMap[session.date]) {
      sessionMap[session.date] = { sessionCount: 0, sessionIds: [] };
    }
    sessionMap[session.date].sessionCount++;
    sessionMap[session.date].sessionIds.push(session.id);
  }

  // Build log count per session date
  const logsBySession = {};
  for (const log of allLogs) {
    if (!logsBySession[log.sessionId]) logsBySession[log.sessionId] = 0;
    logsBySession[log.sessionId]++;
  }

  // Build PR dates
  const prDates = {};
  for (const pr of allPRs) {
    if (pr.achievedAt) {
      const prDate = new Date(pr.achievedAt).toISOString().split('T')[0];
      if (!prDates[prDate]) prDates[prDate] = 0;
      prDates[prDate]++;
    }
  }

  // Generate 365 days
  const days = [];
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const sessionData = sessionMap[dateStr] || { sessionCount: 0, sessionIds: [] };

    // Count exercises for this date
    let exerciseCount = 0;
    for (const sid of sessionData.sessionIds) {
      exerciseCount += logsBySession[sid] || 0;
    }

    const prCount = prDates[dateStr] || 0;

    // Calculate heat level
    let level = 0;
    if (sessionData.sessionCount > 0) {
      if (exerciseCount >= 8 || prCount >= 2) level = 4;
      else if (exerciseCount >= 5 || prCount >= 1) level = 3;
      else if (exerciseCount >= 3) level = 2;
      else level = 1;
    }

    days.push({
      date: dateStr,
      dayOfWeek: date.getDay(), // 0=Sun, 1=Mon, ...
      month: date.getMonth(),
      dayNum: date.getDate(),
      sessionCount: sessionData.sessionCount,
      exerciseCount,
      prCount,
      level,
    });
  }

  // Stats
  const totalActiveDays = days.filter(d => d.level > 0).length;
  const totalSessions = allSessions.length;
  const longestStreak = calculateLongestStreak(days);
  const currentStreak = calculateCurrentStreak(days);

  return {
    days,
    totalActiveDays,
    totalSessions,
    longestStreak,
    currentStreak,
  };
}

function calculateLongestStreak(days) {
  let max = 0;
  let current = 0;
  for (const day of days) {
    if (day.level > 0) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

function calculateCurrentStreak(days) {
  let streak = 0;
  // Walk backwards from today (last element)
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].level > 0) {
      streak++;
    } else {
      // Allow today to be missing (user might not have trained yet today)
      if (i === days.length - 1) continue;
      break;
    }
  }
  return streak;
}

/**
 * Get weekly recap data for the current week (Mon–Sun).
 */
export async function getWeeklyRecapData() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const allSessions = await db.sessions.toArray();
  const allLogs = await db.logs.toArray();
  const allPRs = await db.prs.toArray();
  const exercises = await db.exercises.toArray();
  const exerciseMap = {};
  for (const ex of exercises) exerciseMap[ex.id] = ex;

  // Build log counts per session
  const logsBySession = {};
  for (const log of allLogs) {
    if (!logsBySession[log.sessionId]) logsBySession[log.sessionId] = [];
    logsBySession[log.sessionId].push(log);
  }

  // Build day-by-day data for the week
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const weekDays = [];
  let totalExercises = 0;
  let totalPRs = 0;
  let totalSessions = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === now.toISOString().split('T')[0];
    const isFuture = date > now && !isToday;

    const daySessions = allSessions.filter(s => s.date === dateStr);
    let dayExercises = 0;
    for (const s of daySessions) {
      dayExercises += (logsBySession[s.id] || []).length;
    }

    const dayPRs = allPRs.filter(pr => {
      if (!pr.achievedAt) return false;
      return new Date(pr.achievedAt).toISOString().split('T')[0] === dateStr;
    }).length;

    totalSessions += daySessions.length;
    totalExercises += dayExercises;
    totalPRs += dayPRs;

    weekDays.push({
      label: dayLabels[i],
      date: dateStr,
      sessionCount: daySessions.length,
      exerciseCount: dayExercises,
      prCount: dayPRs,
      isToday,
      isFuture,
    });
  }

  // Compare to previous week
  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);
  const prevSunday = new Date(monday);
  prevSunday.setDate(monday.getDate() - 1);

  const prevWeekSessions = allSessions.filter(s => {
    const d = new Date(s.date + 'T00:00:00');
    return d >= prevMonday && d <= prevSunday;
  }).length;

  // Generate message
  let message;
  if (totalSessions === 0) {
    message = "Fresh week. Let's go.";
  } else if (totalSessions >= 5) {
    message = 'Machine mode. Unreal consistency. 🔥';
  } else if (totalSessions >= 3) {
    if (totalSessions > prevWeekSessions) {
      message = `${totalSessions} sessions — beating last week.`;
    } else {
      message = `${totalSessions} sessions this week. Solid.`;
    }
  } else if (totalSessions >= 1) {
    message = `${totalSessions} session${totalSessions > 1 ? 's' : ''}. Still moving.`;
  }

  return {
    weekDays,
    totalSessions,
    totalExercises,
    totalPRs,
    prevWeekSessions,
    message,
    weekStart: monday.toISOString().split('T')[0],
  };
}
