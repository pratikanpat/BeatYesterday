import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import db from '../../db/db.js';
import './HistoryScreen.css';

/**
 * Screen 2: HISTORY
 * Design System §8, Screen 2
 *
 * List of past sessions, expandable to show full log.
 */
export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [exerciseMap, setExerciseMap] = useState({});
  const [prExerciseIds, setPrExerciseIds] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load all exercises for name lookup
    const exercises = await db.exercises.toArray();
    const exMap = {};
    for (const ex of exercises) {
      exMap[ex.id] = ex;
    }
    setExerciseMap(exMap);

    // Load all sessions (newest first)
    const allSessions = await db.sessions.orderBy('id').reverse().toArray();

    // Load logs for each session
    const sessionsWithLogs = await Promise.all(
      allSessions.map(async (session) => {
        const logs = await db.logs
          .where('sessionId')
          .equals(session.id)
          .toArray();
        return { ...session, logs };
      })
    );

    setSessions(sessionsWithLogs);

    // Load PRs to detect which sessions had PRs
    const prs = await db.prs.toArray();
    const prIds = new Set(prs.map(pr => pr.exerciseId));
    setPrExerciseIds(prIds);
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const num = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `${day} ${num} ${month}`;
  };

  const formatValue = (log, exercise) => {
    if (!exercise) return '';
    if (exercise.inputType === 'time') {
      const secs = log.durationSec || 0;
      const mins = Math.floor(secs / 60);
      const remaining = secs % 60;
      if (mins > 0) return `${mins}:${String(remaining).padStart(2, '0')}`;
      return `${secs}s`;
    }
    return `${log.reps || 0} reps`;
  };

  return (
    <div className="history-screen" id="history-screen">
      <header className="history-screen__header">
        <h1 className="history-screen__title">HISTORY</h1>
      </header>

      <div className="history-screen__content">
        {sessions.length === 0 && (
          <div className="history-screen__empty">
            <p className="history-screen__empty-text">No sessions yet.</p>
            <p className="history-screen__empty-sub">
              Log your first workout on Today.
            </p>
          </div>
        )}

        {sessions.map(session => {
          const isExpanded = expandedId === session.id;
          const exerciseNames = session.logs
            .map(l => exerciseMap[l.exerciseId]?.name || 'Unknown')
            .filter((v, i, a) => a.indexOf(v) === i); // unique
          const hasPR = session.logs.some(l => prExerciseIds.has(l.exerciseId));

          return (
            <button
              key={session.id}
              className={`history-card ${isExpanded ? 'history-card--expanded' : ''}`}
              onClick={() => setExpandedId(isExpanded ? null : session.id)}
            >
              <div className="history-card__header">
                <div className="history-card__header-left">
                  <span className="history-card__date">{formatDate(session.date)}</span>
                  {hasPR && <span className="history-card__pr-badge">PR 🔥</span>}
                </div>
                <div className="history-card__header-right">
                  <span className="history-card__count">{session.logs.length} exercise{session.logs.length !== 1 ? 's' : ''}</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {!isExpanded && (
                <p className="history-card__summary">
                  {exerciseNames.join(' · ')}
                </p>
              )}

              {isExpanded && (
                <div className="history-card__details">
                  {session.logs.map(log => {
                    const ex = exerciseMap[log.exerciseId];
                    return (
                      <div key={log.id} className="history-card__log-row">
                        <span className="history-card__log-name">{ex?.name || 'Unknown'}</span>
                        <span className="history-card__log-value">{formatValue(log, ex)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
