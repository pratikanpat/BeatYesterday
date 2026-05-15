import db from './db.js';

/**
 * Notification Service — Phase 3
 *
 * Minimal, respectful notifications. NOT a spam engine.
 * Only:
 *   - Sunday weekly recap
 *   - PR achievement reminder (next day)
 *   - Optional challenge reminder (evening)
 */

/**
 * Request notification permission.
 * Returns true if granted.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Check if notifications are available and permitted.
 */
export function canNotify() {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Schedule a local notification.
 * Uses the service worker registration for persistent notifications.
 */
async function showNotification(title, body, tag) {
  if (!canNotify()) return;

  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, {
        body,
        tag, // Prevents duplicate notifications
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [100],
        silent: false,
      });
    } else {
      // Fallback to basic notification
      new Notification(title, { body, tag, icon: '/favicon.svg' });
    }
  } catch (e) {
    console.warn('[Notifications] Failed to show:', e);
  }
}

/**
 * Check and send Sunday weekly recap notification.
 * Call this on app open — if it's Sunday and no recap sent today, fire it.
 */
export async function checkSundayRecap() {
  if (!canNotify()) return;

  const now = new Date();
  if (now.getDay() !== 0) return; // Not Sunday

  const today = now.toISOString().split('T')[0];
  const lastRecap = localStorage.getItem('by_last_recap');
  if (lastRecap === today) return; // Already sent today

  // Count this week's sessions
  const monday = new Date(now);
  monday.setDate(now.getDate() - 6);
  const mondayStr = monday.toISOString().split('T')[0];

  const sessions = await db.sessions
    .filter(s => s.date >= mondayStr && s.date <= today)
    .count();

  let message;
  if (sessions === 0) {
    message = 'Fresh week ahead. One workout is all it takes.';
  } else if (sessions >= 5) {
    message = `${sessions} sessions this week. Absolutely relentless. 🔥`;
  } else if (sessions >= 3) {
    message = `${sessions} sessions this week. Solid consistency.`;
  } else {
    message = `${sessions} session${sessions > 1 ? 's' : ''} this week. Still showed up.`;
  }

  await showNotification('Weekly Recap', message, 'weekly-recap');
  localStorage.setItem('by_last_recap', today);
}

/**
 * Send a PR achievement reminder the day after a PR.
 * "You set a new Pushup PR yesterday. Can you beat it?"
 */
export async function checkPRReminder() {
  if (!canNotify()) return;

  const today = new Date().toISOString().split('T')[0];
  const lastReminder = localStorage.getItem('by_last_pr_reminder');
  if (lastReminder === today) return;

  // Check if any PRs were set yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const recentPRs = await db.prs
    .filter(pr => {
      if (!pr.achievedAt) return false;
      return new Date(pr.achievedAt).toISOString().split('T')[0] === yesterdayStr;
    })
    .toArray();

  if (recentPRs.length === 0) return;

  const exercises = await db.exercises.toArray();
  const exerciseMap = {};
  for (const ex of exercises) exerciseMap[ex.id] = ex;

  const prName = exerciseMap[recentPRs[0].exerciseId]?.name || 'an exercise';

  await showNotification(
    'PR Set Yesterday 🔥',
    `New ${prName} record. Open the app to see your streak.`,
    'pr-reminder'
  );
  localStorage.setItem('by_last_pr_reminder', today);
}

/**
 * Send an optional challenge reminder in the evening.
 * Only if the user has an active challenge and hasn't done it today.
 */
export async function checkChallengeReminder() {
  if (!canNotify()) return;

  const now = new Date();
  if (now.getHours() < 18) return; // Only after 6 PM

  const today = now.toISOString().split('T')[0];
  const lastReminder = localStorage.getItem('by_last_challenge_reminder');
  if (lastReminder === today) return;

  const challenges = await db.challenges
    .where('isActive')
    .equals(1)
    .toArray();

  if (challenges.length === 0) return;

  // Check if any challenge is incomplete today
  for (const challenge of challenges) {
    if (today < challenge.startDate || today > challenge.endDate) continue;

    const todayLog = await db.challengeLogs
      .where('challengeId')
      .equals(challenge.id)
      .filter(l => l.date === today)
      .first();

    if (!todayLog || todayLog.value < challenge.targetValue) {
      await showNotification(
        challenge.name,
        `Today's target: ${challenge.targetValue}. Not done yet.`,
        'challenge-reminder'
      );
      localStorage.setItem('by_last_challenge_reminder', today);
      return; // Only one reminder per day
    }
  }
}

/**
 * Run all notification checks on app open.
 */
export async function runNotificationChecks() {
  try {
    await checkSundayRecap();
    await checkPRReminder();
    await checkChallengeReminder();
  } catch (e) {
    console.warn('[Notifications] Check failed:', e);
  }
}
