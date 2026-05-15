import db from './db.js';

/**
 * Micro Wins Engine — Phase 2
 *
 * Generates short, honest encouragement messages after logging.
 * Never fake. Never generic. Always earned.
 *
 * Examples:
 * - "+2 pushups from last time"
 * - "Longest plank in 14 days"
 * - "4 sessions this week"
 * - "First time doing Pike Pushups!"
 */

/**
 * Get a micro win message for a specific exercise after logging.
 * Returns the most interesting insight, or null if nothing noteworthy.
 */
export async function getMicroWin(exerciseId, newValue, inputType) {
  if (!newValue || newValue <= 0) return null;

  const logs = await db.logs
    .where('exerciseId')
    .equals(exerciseId)
    .sortBy('timestamp');

  // First time ever doing this exercise
  if (logs.length === 0) {
    return { type: 'first', message: 'First time! 💪' };
  }

  const lastLog = logs[logs.length - 1];
  const lastValue = lastLog.reps ?? lastLog.durationSec ?? 0;

  // Compare to last time
  const diff = newValue - lastValue;

  // Check if this is the best in the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const recentLogs = logs.filter(l => new Date(l.timestamp) >= fourteenDaysAgo);
  const recentValues = recentLogs.map(l => l.reps ?? l.durationSec ?? 0);
  const recentBest = recentValues.length > 0 ? Math.max(...recentValues) : 0;
  const isBestRecent = newValue > recentBest && recentValues.length >= 2;

  // Check if coming back after a gap (> 7 days)
  const lastDate = new Date(lastLog.timestamp);
  const daysSinceLast = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  const isComeback = daysSinceLast >= 7;

  // Priority: best-in-14-days > comeback > positive delta > same > null
  if (isBestRecent) {
    const unit = inputType === 'time' ? 'sec' : 'reps';
    return {
      type: 'best-recent',
      message: `Best ${unit === 'sec' ? 'time' : 'count'} in ${recentLogs.length} sessions 🔥`,
    };
  }

  if (isComeback) {
    return {
      type: 'comeback',
      message: `Back after ${daysSinceLast} days. Still moving. 💪`,
    };
  }

  if (diff > 0) {
    const unit = inputType === 'time' ? 'sec' : '';
    return {
      type: 'improvement',
      message: `+${diff}${unit} from last time`,
    };
  }

  if (diff === 0) {
    return {
      type: 'match',
      message: 'Same as last time — consistent',
    };
  }

  // Negative diff — don't show anything negative
  return null;
}

/**
 * Get session-level micro wins (shown after saving a workout).
 * These are aggregate insights about the overall session.
 */
export async function getSessionMicroWins() {
  const wins = [];

  // Count sessions this week (Mon–Sun)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const allSessions = await db.sessions.toArray();
  const thisWeekSessions = allSessions.filter(s => {
    const sessionDate = new Date(s.date + 'T00:00:00');
    return sessionDate >= monday;
  });

  if (thisWeekSessions.length >= 3) {
    wins.push({
      type: 'weekly-count',
      message: `${thisWeekSessions.length} sessions this week 🔥`,
    });
  } else if (thisWeekSessions.length >= 1) {
    wins.push({
      type: 'weekly-count',
      message: `${thisWeekSessions.length} session${thisWeekSessions.length > 1 ? 's' : ''} this week`,
    });
  }

  // Total exercises logged today
  const todayStr = now.toISOString().split('T')[0];
  const todaySessions = allSessions.filter(s => s.date === todayStr);
  if (todaySessions.length > 1) {
    wins.push({
      type: 'multi-session',
      message: 'Second workout today — beast mode',
    });
  }

  // Total all-time sessions milestone
  const totalSessions = allSessions.length;
  const milestones = [10, 25, 50, 100, 200, 500];
  for (const milestone of milestones) {
    if (totalSessions === milestone) {
      wins.push({
        type: 'milestone',
        message: `${milestone} sessions logged. You're building a habit.`,
      });
      break;
    }
  }

  return wins;
}

/**
 * Get "What Should I Beat Today?" target for an exercise.
 * Returns a small, achievable increment over the last logged value.
 */
export async function getBeatTarget(exerciseId, inputType) {
  const logs = await db.logs
    .where('exerciseId')
    .equals(exerciseId)
    .sortBy('timestamp');

  if (logs.length === 0) return null;

  const lastLog = logs[logs.length - 1];
  const lastValue = lastLog.reps ?? lastLog.durationSec ?? 0;

  if (lastValue <= 0) return null;

  // Smart increment: +1–3 for reps, +5–10 for time
  let target;
  if (inputType === 'time') {
    // For time-based: add 5 seconds
    target = lastValue + 5;
  } else {
    // For reps: add 1–2 depending on the value
    if (lastValue < 10) {
      target = lastValue + 1;
    } else if (lastValue < 30) {
      target = lastValue + 2;
    } else {
      target = lastValue + 3;
    }
  }

  return { lastValue, target };
}
