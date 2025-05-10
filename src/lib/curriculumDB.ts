// src/db.ts
import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

import type { 
  Subject, 
  Strand, 
  SubStrand, 
  Indicator, 
  LessonPlan 
} from '../types/index';

interface CurriculumDB {
  subjects: {
    key: number;
    value: Subject;
    indexes: { 'byName': string };
  };
  strands: {
    key: number;
    value: Strand;
    indexes: { 
      'bySubjectId': number;
      'byName': string;
    };
  };
  subStrands: {
    key: number;
    value: SubStrand;
    indexes: { 
      'byStrandId': number;
      'byName': string;
    };
  };
  indicators: {
    key: number;
    value: Indicator;
    indexes: { 
      'bySubStrandId': number;
      'byCode': string;
    };
  };
  lessonPlans: {
    key: number;
    value: LessonPlan;
    indexes: { 
      'byWeek': string;
      'bySubjectId': number;
      'byStrandId': number;
      'bySubStrandId': number;
      'byIndicatorId': number;
    };
  };
}

// Initialize the database
export const initDB = async (): Promise<IDBPDatabase<CurriculumDB>> => {
  return openDB<CurriculumDB>('CurriculumDB', 1, {
    upgrade(db) {
      // Create subjects store
      if (!db.objectStoreNames.contains('subjects')) {
        const subjectStore = db.createObjectStore('subjects', {
          keyPath: 'id',
          autoIncrement: true
        });
        subjectStore.createIndex('byName', 'name', { unique: true });
      }

      // Create strands store
      if (!db.objectStoreNames.contains('strands')) {
        const strandStore = db.createObjectStore('strands', {
          keyPath: 'id',
          autoIncrement: true
        });
        strandStore.createIndex('bySubjectId', 'subject_id', { unique: false });
        strandStore.createIndex('byName', 'name', { unique: false });
      }

      // Create subStrands store
      if (!db.objectStoreNames.contains('subStrands')) {
        const subStrandStore = db.createObjectStore('subStrands', {
          keyPath: 'id',
          autoIncrement: true
        });
        subStrandStore.createIndex('byStrandId', 'strand_id', { unique: false });
        subStrandStore.createIndex('byName', 'name', { unique: false });
      }

      // Create indicators store
      if (!db.objectStoreNames.contains('indicators')) {
        const indicatorStore = db.createObjectStore('indicators', {
          keyPath: 'id',
          autoIncrement: true
        });
        indicatorStore.createIndex('bySubStrandId', 'sub_strand_id', { unique: false });
        indicatorStore.createIndex('byCode', 'code', { unique: true });
      }

      // Create lessonPlans store
      if (!db.objectStoreNames.contains('lessonPlans')) {
        const lessonPlanStore = db.createObjectStore('lessonPlans', {
          keyPath: 'id',
          autoIncrement: true
        });
        lessonPlanStore.createIndex('byWeek', 'week', { unique: false });
        lessonPlanStore.createIndex('bySubjectId', 'subject_id', { unique: false });
        lessonPlanStore.createIndex('byStrandId', 'strand_id', { unique: false });
        lessonPlanStore.createIndex('bySubStrandId', 'sub_strand_id', { unique: false });
        lessonPlanStore.createIndex('byIndicatorId', 'indicator_id', { unique: false });
      }
    }
  });
};

// Generic CRUD operations
export const getById = async <T>(
  db: IDBPDatabase<CurriculumDB>,
  storeName: keyof CurriculumDB,
  id: number
): Promise<T | undefined> => {
  return db.get(storeName, id);
};

export const getAll = async <T>(
  db: IDBPDatabase<CurriculumDB>,
  storeName: keyof CurriculumDB
): Promise<T[]> => {
  return db.getAll(storeName);
};

export const add = async <T>(
  db: IDBPDatabase<CurriculumDB>,
  storeName: keyof CurriculumDB,
  item: Omit<T, 'id'>
): Promise<number> => {
  const tx = db.transaction(storeName, 'readwrite');
  const id = await tx.store.add(item as unknown as CurriculumDB[typeof storeName]['value']);
  await tx.done;
  return id as number;
};

export const update = async <T extends { id: number }>(
  db: IDBPDatabase<CurriculumDB>,
  storeName: keyof CurriculumDB,
  item: T
): Promise<void> => {
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.put(item);
  await tx.done;
};

export const remove = async (
  db: IDBPDatabase<CurriculumDB>,
  storeName: keyof CurriculumDB,
  id: number
): Promise<void> => {
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
};

// Subject-specific operations
export const addSubject = async (
  db: IDBPDatabase<CurriculumDB>,
  subject: Omit<Subject, 'id'>
): Promise<number> => {
  return add<Subject>(db, 'subjects', subject);
};

export const getSubject = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<Subject | undefined> => {
  return getById<Subject>(db, 'subjects', id);
};

export const getSubjectByName = async (
  db: IDBPDatabase<CurriculumDB>,
  name: string
): Promise<Subject | undefined> => {
  const tx = db.transaction('subjects', 'readonly');
  const index = tx.store.index('byName');
  return index.get(name);
};

export const getAllSubjects = async (
  db: IDBPDatabase<CurriculumDB>
): Promise<Subject[]> => {
  return getAll<Subject>(db, 'subjects');
};

export const updateSubject = async (
  db: IDBPDatabase<CurriculumDB>,
  subject: Subject
): Promise<void> => {
  return update<Subject>(db, 'subjects', subject);
};

export const deleteSubject = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<void> => {
  // First delete related strands
  const strands = await getStrandsBySubject(db, id);
  for (const strand of strands) {
    await deleteStrand(db, strand.id);
  }
  
  // Then delete the subject
  return remove(db, 'subjects', id);
};

// Strand-specific operations
export const addStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  strand: Omit<Strand, 'id'>
): Promise<number> => {
  return add<Strand>(db, 'strands', strand);
};

export const getStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<Strand | undefined> => {
  return getById<Strand>(db, 'strands', id);
};

export const getStrandsBySubject = async (
  db: IDBPDatabase<CurriculumDB>,
  subjectId: number
): Promise<Strand[]> => {
  const tx = db.transaction('strands', 'readonly');
  const index = tx.store.index('bySubjectId');
  return index.getAll(subjectId);
};

export const getAllStrands = async (
  db: IDBPDatabase<CurriculumDB>
): Promise<Strand[]> => {
  return getAll<Strand>(db, 'strands');
};

export const updateStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  strand: Strand
): Promise<void> => {
  return update<Strand>(db, 'strands', strand);
};

export const deleteStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<void> => {
  // First delete related sub-strands
  const subStrands = await getSubStrandsByStrand(db, id);
  for (const subStrand of subStrands) {
    await deleteSubStrand(db, subStrand.id);
  }
  
  // Then delete the strand
  return remove(db, 'strands', id);
};

// SubStrand-specific operations
export const addSubStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  subStrand: Omit<SubStrand, 'id'>
): Promise<number> => {
  return add<SubStrand>(db, 'subStrands', subStrand);
};

export const getSubStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<SubStrand | undefined> => {
  return getById<SubStrand>(db, 'subStrands', id);
};

export const getSubStrandsByStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  strandId: number
): Promise<SubStrand[]> => {
  const tx = db.transaction('subStrands', 'readonly');
  const index = tx.store.index('byStrandId');
  return index.getAll(strandId);
};

export const getAllSubStrands = async (
  db: IDBPDatabase<CurriculumDB>
): Promise<SubStrand[]> => {
  return getAll<SubStrand>(db, 'subStrands');
};

export const updateSubStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  subStrand: SubStrand
): Promise<void> => {
  return update<SubStrand>(db, 'subStrands', subStrand);
};

export const deleteSubStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<void> => {
  // First delete related indicators
  const indicators = await getIndicatorsBySubStrand(db, id);
  for (const indicator of indicators) {
    await deleteIndicator(db, indicator.id);
  }
  
  // Then delete the sub-strand
  return remove(db, 'subStrands', id);
};

// Indicator-specific operations
export const addIndicator = async (
  db: IDBPDatabase<CurriculumDB>,
  indicator: Omit<Indicator, 'id'>
): Promise<number> => {
  return add<Indicator>(db, 'indicators', indicator);
};

export const getIndicator = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<Indicator | undefined> => {
  return getById<Indicator>(db, 'indicators', id);
};

export const getIndicatorByCode = async (
  db: IDBPDatabase<CurriculumDB>,
  code: string
): Promise<Indicator | undefined> => {
  const tx = db.transaction('indicators', 'readonly');
  const index = tx.store.index('byCode');
  return index.get(code);
};

export const getIndicatorsBySubStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  subStrandId: number
): Promise<Indicator[]> => {
  const tx = db.transaction('indicators', 'readonly');
  const index = tx.store.index('bySubStrandId');
  return index.getAll(subStrandId);
};

export const getAllIndicators = async (
  db: IDBPDatabase<CurriculumDB>
): Promise<Indicator[]> => {
  return getAll<Indicator>(db, 'indicators');
};

export const updateIndicator = async (
  db: IDBPDatabase<CurriculumDB>,
  indicator: Indicator
): Promise<void> => {
  return update<Indicator>(db, 'indicators', indicator);
};

export const deleteIndicator = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<void> => {
  // First delete related lesson plans
  const lessonPlans = await getLessonPlansByIndicator(db, id);
  for (const lessonPlan of lessonPlans) {
    await deleteLessonPlan(db, lessonPlan.id);
  }
  
  // Then delete the indicator
  return remove(db, 'indicators', id);
};

// LessonPlan-specific operations
export const addLessonPlan = async (
  db: IDBPDatabase<CurriculumDB>,
  lessonPlan: Omit<LessonPlan, 'id' | 'created_at'>
): Promise<number> => {
  const completeLessonPlan = {
    ...lessonPlan,
    created_at: new Date().toISOString()
  };
  return add<LessonPlan>(db, 'lessonPlans', completeLessonPlan);
};

export const getLessonPlan = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<LessonPlan | undefined> => {
  return getById<LessonPlan>(db, 'lessonPlans', id);
};

export const getLessonPlansByWeek = async (
  db: IDBPDatabase<CurriculumDB>,
  week: string
): Promise<LessonPlan[]> => {
  const tx = db.transaction('lessonPlans', 'readonly');
  const index = tx.store.index('byWeek');
  return index.getAll(week);
};

export const getLessonPlansBySubject = async (
  db: IDBPDatabase<CurriculumDB>,
  subjectId: number
): Promise<LessonPlan[]> => {
  const tx = db.transaction('lessonPlans', 'readonly');
  const index = tx.store.index('bySubjectId');
  return index.getAll(subjectId);
};

export const getLessonPlansByStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  strandId: number
): Promise<LessonPlan[]> => {
  const tx = db.transaction('lessonPlans', 'readonly');
  const index = tx.store.index('byStrandId');
  return index.getAll(strandId);
};

export const getLessonPlansBySubStrand = async (
  db: IDBPDatabase<CurriculumDB>,
  subStrandId: number
): Promise<LessonPlan[]> => {
  const tx = db.transaction('lessonPlans', 'readonly');
  const index = tx.store.index('bySubStrandId');
  return index.getAll(subStrandId);
};

export const getLessonPlansByIndicator = async (
  db: IDBPDatabase<CurriculumDB>,
  indicatorId: number
): Promise<LessonPlan[]> => {
  const tx = db.transaction('lessonPlans', 'readonly');
  const index = tx.store.index('byIndicatorId');
  return index.getAll(indicatorId);
};

export const getAllLessonPlans = async (
  db: IDBPDatabase<CurriculumDB>
): Promise<LessonPlan[]> => {
  return getAll<LessonPlan>(db, 'lessonPlans');
};

export const updateLessonPlan = async (
  db: IDBPDatabase<CurriculumDB>,
  lessonPlan: LessonPlan
): Promise<void> => {
  return update<LessonPlan>(db, 'lessonPlans', lessonPlan);
};

export const deleteLessonPlan = async (
  db: IDBPDatabase<CurriculumDB>,
  id: number
): Promise<void> => {
  return remove(db, 'lessonPlans', id);
};

// Utility functions
export const getFullCurriculumPath = async (
  db: IDBPDatabase<CurriculumDB>,
  lessonPlanId: number
): Promise<{
  subject: Subject | undefined;
  strand: Strand | undefined;
  subStrand: SubStrand | undefined;
  indicator: Indicator | undefined;
  lessonPlan: LessonPlan | undefined;
}> => {
  const lessonPlan = await getLessonPlan(db, lessonPlanId);
  if (!lessonPlan) {
    return {
      subject: undefined,
      strand: undefined,
      subStrand: undefined,
      indicator: undefined,
      lessonPlan: undefined
    };
  }

  const [subject, strand, subStrand, indicator] = await Promise.all([
    getSubject(db, lessonPlan.subject_id),
    getStrand(db, lessonPlan.strand_id),
    getSubStrand(db, lessonPlan.sub_strand_id),
    getIndicator(db, lessonPlan.indicator_id)
  ]);

  return { subject, strand, subStrand, indicator, lessonPlan };
};

export const getLessonPlansWithDetails = async (
  db: IDBPDatabase<CurriculumDB>,
  page: number,
  pageSize: number
): Promise<Array<{
  lessonPlan: LessonPlan;
  subject: Subject | undefined;
  strand: Strand | undefined;
  subStrand: SubStrand | undefined;
  indicator: Indicator | undefined;
}>> => {
  const tx = db.transaction(['lessonPlans', 'subjects', 'strands', 'subStrands', 'indicators'], 'readonly');
  
  // Get paginated lesson plans
  const allLessonPlans = await tx.objectStore('lessonPlans').getAll();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const lessonPlans = allLessonPlans.slice(start, end);

  // Get all related data in parallel
  const results = await Promise.all(lessonPlans.map(async (lessonPlan) => {
    const [subject, strand, subStrand, indicator] = await Promise.all([
      tx.objectStore('subjects').get(lessonPlan.subject_id),
      tx.objectStore('strands').get(lessonPlan.strand_id),
      tx.objectStore('subStrands').get(lessonPlan.sub_strand_id),
      tx.objectStore('indicators').get(lessonPlan.indicator_id)
    ]);
    
    return { lessonPlan, subject, strand, subStrand, indicator };
  }));

  await tx.done;
  return results;
};


// How to use
// you would ideally fetch data into dropdowns and from them, then pass the IDs to the functions above
// const db = await initDB();

// // Add a subject
// const subjectId = await addSubject(db, { name: 'Mathematics' });

// // Add a strand to that subject
// const strandId = await addStrand(db, { subject_id: subjectId, name: 'Number' });
// // Add a sub-strand to that strand
// const subStrandId = await addSubStrand(db, { strand_id: strandId, name: 'Algebra' });

// // Add an indicator to that sub-strand
// const indicatorId = await addIndicator(db, { sub_strand_id: subStrandId, name: 'Addition' });

// // Add a lesson plan for that indicator
// const lessonPlanId = await addLessonPlan(db, {
//   sub_strand_id: subStrandId,
//   indicator_id: indicatorId,
//   week: 'Week 1',
//   content: 'Learn addition of two numbers'
// });

// // Now you can get the full curriculum path for that lesson plan
// const curriculumPath = await getFullCurriculumPath(db, lessonPlanId);
// console.log(curriculumPath);
// // And so on...