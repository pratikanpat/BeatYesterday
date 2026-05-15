import Dexie from 'dexie';

const db = new Dexie('BeatYesterdayDB');

// Version 1: Phase 1 tables
db.version(1).stores({
  exercises: '++id, name, category, muscleGroup, inputType, isCustom',
  sessions:  '++id, date, durationMin',
  logs:      '++id, sessionId, exerciseId, reps, durationSec, sets, timestamp',
  prs:       '++id, exerciseId, value, achievedAt',
});

// Version 2: Phase 2 — routines, check-ins, custom exercises
db.version(2).stores({
  exercises: '++id, name, category, muscleGroup, inputType, isCustom',
  sessions:  '++id, date, durationMin, checkinId',
  logs:      '++id, sessionId, exerciseId, reps, durationSec, sets, timestamp',
  prs:       '++id, exerciseId, value, achievedAt',
  routines:  '++id, name, createdAt',
  routineExercises: '++id, routineId, exerciseId, order',
  checkins:  '++id, sessionId, sleepQuality, energyLevel, timeAvailable, createdAt',
});

// Version 3: Phase 3 — challenges, grind modes
db.version(3).stores({
  exercises: '++id, name, category, muscleGroup, inputType, isCustom',
  sessions:  '++id, date, durationMin, checkinId',
  logs:      '++id, sessionId, exerciseId, reps, durationSec, sets, timestamp',
  prs:       '++id, exerciseId, value, achievedAt',
  routines:  '++id, name, createdAt',
  routineExercises: '++id, routineId, exerciseId, order',
  checkins:  '++id, sessionId, sleepQuality, energyLevel, timeAvailable, createdAt',
  challenges: '++id, name, exerciseId, targetValue, startDate, endDate, isActive, preset',
  challengeLogs: '++id, challengeId, date, value',
  userProfile: '++id, grindMode, onboardingComplete, favoriteExercises, createdAt',
});

export default db;
