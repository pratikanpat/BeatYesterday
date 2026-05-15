import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import useWorkoutStore from '../../store/useWorkoutStore.js';
import { getAllPRs } from '../../db/prService.js';
import ExerciseRow from '../../components/ExerciseRow/ExerciseRow.jsx';
import BottomSheet from '../../components/BottomSheet/BottomSheet.jsx';
import './TodayScreen.css';

/**
 * Screen 1: TODAY
 * Design System §8, Screen 1
 *
 * The core of the app. Log reps, see deltas, hit "DONE".
 */
export default function TodayScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prMap, setPrMap] = useState({});
  const [saving, setSaving] = useState(false);

  const activeSession = useWorkoutStore(s => s.activeSession);
  const addExerciseToSession = useWorkoutStore(s => s.addExerciseToSession);
  const updateLogValue = useWorkoutStore(s => s.updateLogValue);
  const removeExerciseFromSession = useWorkoutStore(s => s.removeExerciseFromSession);
  const saveSession = useWorkoutStore(s => s.saveSession);
  const setCelebration = useWorkoutStore(s => s.setCelebration);

  // Load PR map for delta display
  useEffect(() => {
    getAllPRs().then(setPrMap);
  }, []);

  // Format today's date
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = today.getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  // Group logs by category
  const grouped = {};
  for (const log of activeSession.logs) {
    const cat = log.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(log);
  }

  const categoryOrder = ['upper', 'core', 'lower', 'other'];
  const categoryLabels = { upper: 'UPPER BODY', core: 'CORE', lower: 'LOWER BODY', other: 'OTHER' };

  const hasLogs = activeSession.logs.length > 0;
  const hasValues = activeSession.logs.some(l => l.value !== '' && Number(l.value) > 0);

  const handleSave = async () => {
    if (!hasValues || saving) return;
    setSaving(true);

    try {
      const result = await saveSession();

      // Show celebration for the first PR
      if (result.prs.length > 0) {
        const firstPR = result.prs[0];
        const previousBest = prMap[firstPR.exerciseId]?.value ?? null;
        setCelebration({
          exerciseId: firstPR.exerciseId,
          exerciseName: firstPR.exerciseName,
          newValue: firstPR.newValue,
          inputType: firstPR.inputType,
          previousBest,
        });
      }

      // Refresh PR map
      getAllPRs().then(setPrMap);
    } catch (err) {
      console.error('[BeatYesterday] Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="today-screen" id="today-screen">
      {/* Header */}
      <header className="today-screen__header">
        <h1 className="today-screen__title">TODAY</h1>
        <span className="today-screen__date">{dayName} {dayNum} {monthName}</span>
      </header>

      {/* Scrollable content */}
      <div className="today-screen__content">
        {!hasLogs && (
          <div className="today-screen__empty">
            <p className="today-screen__empty-text">No exercises yet.</p>
            <p className="today-screen__empty-sub">Tap below to start your session.</p>
          </div>
        )}

        {categoryOrder.map(cat => {
          const logs = grouped[cat];
          if (!logs || logs.length === 0) return null;
          return (
            <div key={cat} className="today-screen__section">
              <span className="today-screen__section-label">── {categoryLabels[cat]} ──</span>
              <div className="today-screen__exercises">
                {logs.map(log => {
                  const pr = prMap[log.exerciseId];
                  const numVal = Number(log.value);
                  const isPRNow = pr && numVal > 0 && numVal > pr.value;
                  return (
                    <ExerciseRow
                      key={log.exerciseId}
                      exerciseName={log.exerciseName}
                      muscleGroup={log.muscleGroup}
                      inputType={log.inputType}
                      value={log.value}
                      previousBest={pr?.value ?? null}
                      isPR={isPRNow}
                      onValueChange={(val) => updateLogValue(log.exerciseId, val)}
                      onRemove={() => removeExerciseFromSession(log.exerciseId)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add Exercise Button */}
        <button
          className="today-screen__add-btn"
          onClick={() => setSheetOpen(true)}
          id="add-exercise-btn"
        >
          <Plus size={20} />
          ADD EXERCISE
        </button>
      </div>

      {/* Fixed CTA */}
      {hasLogs && (
        <div className="today-screen__footer">
          <button
            className={`today-screen__save-btn ${!hasValues ? 'today-screen__save-btn--disabled' : ''}`}
            onClick={handleSave}
            disabled={!hasValues || saving}
            id="save-session-btn"
          >
            {saving ? 'SAVING...' : 'DONE — SAVE SESSION'}
          </button>
        </div>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectExercise={addExerciseToSession}
        addedExerciseIds={activeSession.logs.map(l => l.exerciseId)}
      />
    </div>
  );
}
