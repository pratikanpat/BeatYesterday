import db from './db.js';

/**
 * Routines Service — Phase 2
 *
 * Save and load workout templates.
 * A routine = a named list of exercises that can be loaded into a session.
 */

/**
 * Save current exercises as a new routine.
 * @param {string} name - Routine name (e.g., "Upper Body Day")
 * @param {Array<{exerciseId: number}>} exercises - Exercise IDs in order
 * @returns {number} The new routine ID
 */
export async function saveRoutine(name, exercises) {
  const routineId = await db.routines.add({
    name,
    createdAt: new Date(),
  });

  const routineExercises = exercises.map((ex, index) => ({
    routineId,
    exerciseId: ex.exerciseId,
    order: index,
  }));

  await db.routineExercises.bulkAdd(routineExercises);
  return routineId;
}

/**
 * Get all saved routines with their exercise details.
 */
export async function getAllRoutines() {
  const routines = await db.routines.orderBy('createdAt').reverse().toArray();
  const exercises = await db.exercises.toArray();
  const exerciseMap = {};
  for (const ex of exercises) {
    exerciseMap[ex.id] = ex;
  }

  const routinesWithExercises = await Promise.all(
    routines.map(async (routine) => {
      const routineExs = await db.routineExercises
        .where('routineId')
        .equals(routine.id)
        .sortBy('order');

      return {
        ...routine,
        exercises: routineExs
          .map(re => exerciseMap[re.exerciseId])
          .filter(Boolean),
      };
    })
  );

  return routinesWithExercises;
}

/**
 * Delete a routine and its exercises.
 */
export async function deleteRoutine(routineId) {
  await db.routineExercises
    .where('routineId')
    .equals(routineId)
    .delete();
  await db.routines.delete(routineId);
}

/**
 * Get a single routine with exercises.
 */
export async function getRoutine(routineId) {
  const routine = await db.routines.get(routineId);
  if (!routine) return null;

  const exercises = await db.exercises.toArray();
  const exerciseMap = {};
  for (const ex of exercises) {
    exerciseMap[ex.id] = ex;
  }

  const routineExs = await db.routineExercises
    .where('routineId')
    .equals(routineId)
    .sortBy('order');

  return {
    ...routine,
    exercises: routineExs
      .map(re => exerciseMap[re.exerciseId])
      .filter(Boolean),
  };
}
