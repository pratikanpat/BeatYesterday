import Dexie from 'dexie';

const db = new Dexie('BeatYesterdayDB');

db.version(1).stores({
  exercises: '++id, name, category, muscleGroup, inputType, isCustom',
  sessions:  '++id, date, durationMin',
  logs:      '++id, sessionId, exerciseId, reps, durationSec, sets, timestamp',
  prs:       '++id, exerciseId, value, achievedAt',
});

export default db;
