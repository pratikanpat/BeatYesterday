import { useState, useEffect, useCallback } from 'react';
import { Plus, BookmarkPlus, FolderOpen } from 'lucide-react';
import useWorkoutStore from '../../store/useWorkoutStore.js';
import { getAllPRs } from '../../db/prService.js';
import { getMicroWin, getBeatTarget, getSessionMicroWins } from '../../db/microWinsService.js';
import { saveRoutine } from '../../db/routinesService.js';
import ExerciseRow from '../../components/ExerciseRow/ExerciseRow.jsx';
import BottomSheet from '../../components/BottomSheet/BottomSheet.jsx';
import CheckIn from '../../components/CheckIn/CheckIn.jsx';
import RoutinePicker from '../../components/RoutinePicker/RoutinePicker.jsx';
import MicroWinBanner from '../../components/MicroWinBanner/MicroWinBanner.jsx';
import './TodayScreen.css';

/**
 * Screen 1: TODAY — Phase 2 Enhanced
 *
 * Added: Check-in flow, micro wins, beat targets, routine save/load.
 */
export default function TodayScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [routinePickerOpen, setRoutinePickerOpen] = useState(false);
  const [prMap, setPrMap] = useState({});
  const [beatTargets, setBeatTargets] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveRoutineModal, setSaveRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [sessionWins, setSessionWins] = useState([]);

  const activeSession = useWorkoutStore(s => s.activeSession);
  const addExerciseToSession = useWorkoutStore(s => s.addExerciseToSession);
  const updateLogValue = useWorkoutStore(s => s.updateLogValue);
  const setMicroWin = useWorkoutStore(s => s.setMicroWin);
  const removeExerciseFromSession = useWorkoutStore(s => s.removeExerciseFromSession);
  const saveSession = useWorkoutStore(s => s.saveSession);
  const setCelebration = useWorkoutStore(s => s.setCelebration);
  const loadRoutine = useWorkoutStore(s => s.loadRoutine);
  const showCheckin = useWorkoutStore(s => s.showCheckin);
  const setShowCheckin = useWorkoutStore(s => s.setShowCheckin);
  const setCheckinData = useWorkoutStore(s => s.setCheckinData);
  const skipCheckin = useWorkoutStore(s => s.skipCheckin);

  // Load PR map for delta display
  useEffect(() => {
    getAllPRs().then(setPrMap);
  }, []);

  // Load beat targets when exercises change
  useEffect(() => {
    const loadTargets = async () => {
      const targets = {};
      for (const log of activeSession.logs) {
        const target = await getBeatTarget(log.exerciseId, log.inputType);
        if (target) targets[log.exerciseId] = target;
      }
      setBeatTargets(targets);
    };
    if (activeSession.logs.length > 0) {
      loadTargets();
    }
  }, [activeSession.logs.length]);

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

  // Handle value change with micro win detection
  const handleValueChange = useCallback(async (exerciseId, value, inputType) => {
    updateLogValue(exerciseId, value);

    const numVal = Number(value);
    if (numVal > 0) {
      const win = await getMicroWin(exerciseId, numVal, inputType);
      setMicroWin(exerciseId, win);
    } else {
      setMicroWin(exerciseId, null);
    }
  }, [updateLogValue, setMicroWin]);

  const handleSave = async () => {
    if (!hasValues || saving) return;
    setSaving(true);

    try {
      const result = await saveSession();

      // Get session-level wins
      const wins = await getSessionMicroWins();
      setSessionWins(wins);

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

  const handleSaveRoutine = async () => {
    if (!routineName.trim() || activeSession.logs.length === 0) return;

    await saveRoutine(
      routineName.trim(),
      activeSession.logs.map(l => ({ exerciseId: l.exerciseId }))
    );

    setSaveRoutineModal(false);
    setRoutineName('');
  };

  // Show check-in when first exercise is added (if no check-in done yet)
  const handleAddFirstExercise = (exercise) => {
    addExerciseToSession(exercise);
  };

  // Check-in flow
  if (showCheckin) {
    return (
      <div className="today-screen" id="today-screen">
        <CheckIn
          onComplete={(data) => setCheckinData(data)}
          onSkip={skipCheckin}
        />
      </div>
    );
  }

  return (
    <div className="today-screen" id="today-screen">
      {/* Header */}
      <header className="today-screen__header">
        <h1 className="today-screen__title">TODAY</h1>
        <span className="today-screen__date">{dayName} {dayNum} {monthName}</span>
      </header>

      {/* Session micro wins (after saving) */}
      {sessionWins.length > 0 && (
        <div className="today-screen__session-wins">
          {sessionWins.map((win, i) => (
            <div key={i} className="today-screen__session-win">
              {win.message}
            </div>
          ))}
        </div>
      )}

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
                  const target = beatTargets[log.exerciseId];
                  return (
                    <div key={log.exerciseId}>
                      <ExerciseRow
                        exerciseName={log.exerciseName}
                        muscleGroup={log.muscleGroup}
                        inputType={log.inputType}
                        value={log.value}
                        previousBest={pr?.value ?? null}
                        isPR={isPRNow}
                        beatTarget={target?.target ?? null}
                        onValueChange={(val) => handleValueChange(log.exerciseId, val, log.inputType)}
                        onRemove={() => removeExerciseFromSession(log.exerciseId)}
                      />
                      {/* Micro win banner */}
                      {log.microWin && (
                        <MicroWinBanner message={log.microWin.message} type={log.microWin.type} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Action buttons row */}
        <div className="today-screen__actions">
          <button
            className="today-screen__add-btn"
            onClick={() => setSheetOpen(true)}
            id="add-exercise-btn"
          >
            <Plus size={20} />
            ADD EXERCISE
          </button>

          <div className="today-screen__action-row">
            <button
              className="today-screen__action-sm"
              onClick={() => setRoutinePickerOpen(true)}
              id="load-routine-btn"
            >
              <FolderOpen size={16} />
              LOAD ROUTINE
            </button>
            {hasLogs && (
              <button
                className="today-screen__action-sm"
                onClick={() => setSaveRoutineModal(true)}
                id="save-routine-btn"
              >
                <BookmarkPlus size={16} />
                SAVE AS ROUTINE
              </button>
            )}
          </div>
        </div>
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

      {/* Bottom Sheet — Add Exercise */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectExercise={handleAddFirstExercise}
        addedExerciseIds={activeSession.logs.map(l => l.exerciseId)}
      />

      {/* Routine Picker */}
      <RoutinePicker
        isOpen={routinePickerOpen}
        onClose={() => setRoutinePickerOpen(false)}
        onLoadRoutine={loadRoutine}
      />

      {/* Save Routine Modal */}
      {saveRoutineModal && (
        <div className="today-screen__routine-modal-overlay" onClick={() => setSaveRoutineModal(false)}>
          <div className="today-screen__routine-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="today-screen__routine-modal-title">SAVE ROUTINE</h3>
            <input
              className="today-screen__routine-modal-input"
              type="text"
              placeholder="Routine name (e.g. Upper Body Day)"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              autoFocus
            />
            <div className="today-screen__routine-modal-actions">
              <button
                className="today-screen__routine-modal-cancel"
                onClick={() => setSaveRoutineModal(false)}
              >
                CANCEL
              </button>
              <button
                className="today-screen__routine-modal-save"
                onClick={handleSaveRoutine}
                disabled={!routineName.trim()}
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
