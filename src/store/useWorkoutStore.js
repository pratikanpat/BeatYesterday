import { create } from 'zustand';
import db from '../db/db.js';
import { checkAndUpdatePR } from '../db/prService.js';

const useWorkoutStore = create((set, get) => ({
  // ── Today's in-progress session ──
  activeSession: {
    logs: [],
    // Each log: { exerciseId, exerciseName, inputType, value, category, muscleGroup }
  },

  // ── UI state ──
  celebrationData: null, // { exerciseId, exerciseName, newValue, previousBest, delta }
  activeTab: 'today', // 'today' | 'history' | 'prs'

  // ── Navigation ──
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Session management ──
  addExerciseToSession: (exercise) => {
    const { activeSession } = get();
    // Don't add duplicates
    if (activeSession.logs.find(l => l.exerciseId === exercise.id)) return;

    set({
      activeSession: {
        ...activeSession,
        logs: [
          ...activeSession.logs,
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            inputType: exercise.inputType,
            value: '',
            category: exercise.category,
            muscleGroup: exercise.muscleGroup,
          },
        ],
      },
    });
  },

  updateLogValue: (exerciseId, value) => {
    const { activeSession } = get();
    set({
      activeSession: {
        ...activeSession,
        logs: activeSession.logs.map(log =>
          log.exerciseId === exerciseId
            ? { ...log, value }
            : log
        ),
      },
    });
  },

  removeExerciseFromSession: (exerciseId) => {
    const { activeSession } = get();
    set({
      activeSession: {
        ...activeSession,
        logs: activeSession.logs.filter(l => l.exerciseId !== exerciseId),
      },
    });
  },

  /**
   * Save the current session to IndexedDB.
   * Returns array of exerciseIds that achieved new PRs.
   */
  saveSession: async () => {
    const { activeSession } = get();
    const logsWithValues = activeSession.logs.filter(
      l => l.value !== '' && l.value !== null && l.value !== undefined && Number(l.value) > 0
    );

    if (logsWithValues.length === 0) return { prs: [] };

    const today = new Date().toISOString().split('T')[0];

    // Create session record
    const sessionId = await db.sessions.add({
      date: today,
      durationMin: null,
    });

    // Save each exercise log
    const prResults = [];

    for (const log of logsWithValues) {
      const numValue = Number(log.value);

      await db.logs.add({
        sessionId,
        exerciseId: log.exerciseId,
        reps: log.inputType === 'reps' ? numValue : null,
        durationSec: log.inputType === 'time' ? numValue : null,
        sets: 1,
        timestamp: new Date(),
      });

      // Check for PR
      const isPR = await checkAndUpdatePR(log.exerciseId, numValue);
      if (isPR) {
        prResults.push({
          exerciseId: log.exerciseId,
          exerciseName: log.exerciseName,
          newValue: numValue,
          inputType: log.inputType,
        });
      }
    }

    // Clear the session
    set({
      activeSession: { logs: [] },
    });

    return { prs: prResults };
  },

  clearSession: () => set({ activeSession: { logs: [] } }),

  // ── Celebration ──
  setCelebration: (data) => set({ celebrationData: data }),
  clearCelebration: () => set({ celebrationData: null }),
}));

export default useWorkoutStore;
