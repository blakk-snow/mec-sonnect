// src/db.ts
import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

import type { DBSchema, Teacher, Student } from '../types/index';

// Initialize the database
export const initDB = async (): Promise<IDBPDatabase<DBSchema>> => {
  return openDB<DBSchema>('EducationDB', 1, {
    upgrade(db) {
      // Create teachers store if it doesn't exist
      if (!db.objectStoreNames.contains('teachers')) {
        const teacherStore = db.createObjectStore('teachers', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        teacherStore.createIndex('byClassName', 'className', { unique: false });
        teacherStore.createIndex('byTaCode', 'taCode', { unique: true });
      }

      // Create students store if it doesn't exist
      if (!db.objectStoreNames.contains('students')) {
        const studentStore = db.createObjectStore('students', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        studentStore.createIndex('byClassName', 'className', { unique: false });
      }
    }
  });
};

// Generic function to get a record by ID
export const getById = async <T>(
  db: IDBPDatabase<DBSchema>, 
  storeName: keyof DBSchema, 
  id: string
): Promise<T | undefined> => {
  return db.get(storeName, id);
};

// Generic function to get all records from a store
export const getAll = async <T>(
  db: IDBPDatabase<DBSchema>, 
  storeName: keyof DBSchema
): Promise<T[]> => {
  return db.getAll(storeName);
};

// Generic function to add a record
export const add = async <T>(
  db: IDBPDatabase<DBSchema>,
  storeName: keyof DBSchema,
  item: T
): Promise<string> => {
  const tx = db.transaction(storeName, 'readwrite');
  const id = await tx.store.add(item);
  await tx.done;
  return id.toString();
};

// Generic function to update a record
export const update = async <T extends { id?: string }>(
  db: IDBPDatabase<DBSchema>,
  storeName: keyof DBSchema,
  item: T
): Promise<void> => {
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.put(item);
  await tx.done;
};

// Generic function to delete a record
export const remove = async (
  db: IDBPDatabase<DBSchema>,
  storeName: keyof DBSchema,
  id: string
): Promise<void> => {
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
};

// Teacher-specific CRUD operations
export const addTeacher = async (
  db: IDBPDatabase<DBSchema>, 
  teacher: Teacher
): Promise<string> => {
  return add<Teacher>(db, 'teachers', teacher);
};

export const getTeacher = async (
  db: IDBPDatabase<DBSchema>, 
  id: string
): Promise<Teacher | undefined> => {
  return getById<Teacher>(db, 'teachers', id);
};

export const getAllTeachers = async (
  db: IDBPDatabase<DBSchema>
): Promise<Teacher[]> => {
  return getAll<Teacher>(db, 'teachers');
};

export const updateTeacher = async (
  db: IDBPDatabase<DBSchema>, 
  teacher: Teacher
): Promise<void> => {
  if (!teacher.id) {
    throw new Error('Teacher ID is required for update');
  }
  return update<Teacher>(db, 'teachers', teacher);
};

export const deleteTeacher = async (
  db: IDBPDatabase<DBSchema>, 
  id: string
): Promise<void> => {
  return remove(db, 'teachers', id);
};

// Student-specific CRUD operations
export const addStudent = async (
  db: IDBPDatabase<DBSchema>, 
  student: Student
): Promise<string> => {
  return add<Student>(db, 'students', student);
};

export const getStudent = async (
  db: IDBPDatabase<DBSchema>, 
  id: string
): Promise<Student | undefined> => {
  return getById<Student>(db, 'students', id);
};

export const getAllStudents = async (
  db: IDBPDatabase<DBSchema>
): Promise<Student[]> => {
  return getAll<Student>(db, 'students');
};

export const updateStudent = async (
  db: IDBPDatabase<DBSchema>, 
  student: Student
): Promise<void> => {
  if (!student.id) {
    throw new Error('Student ID is required for update');
  }
  return update<Student>(db, 'students', student);
};

export const deleteStudent = async (
  db: IDBPDatabase<DBSchema>, 
  id: string
): Promise<void> => {
  return remove(db, 'students', id);
};

// Additional relevant functions

// Get students by className
export const getStudentsByClass = async (
  db: IDBPDatabase<DBSchema>, 
  className: string
): Promise<Student[]> => {
  const tx = db.transaction('students', 'readonly');
  const index = tx.store.index('byClassName');
  return index.getAll(className);
};

// Get teachers by className
export const getTeachersByClass = async (
  db: IDBPDatabase<DBSchema>, 
  className: string
): Promise<Teacher[]> => {
  const tx = db.transaction('teachers', 'readonly');
  const index = tx.store.index('byClassName');
  return index.getAll(className);
};

// Get teacher by TA code
export const getTeacherByTaCode = async (
  db: IDBPDatabase<DBSchema>, 
  taCode: string
): Promise<Teacher | undefined> => {
  const tx = db.transaction('teachers', 'readonly');
  const index = tx.store.index('byTaCode');
  return index.get(taCode);
};


export const getTeacherById = async (
  db: IDBPDatabase<DBSchema>,
  id: string 
): Promise<Teacher | undefined> => {
  return getById<Teacher>(db, 'teachers', id);
};



// Count students in a class
export const countStudentsInClass = async (
  db: IDBPDatabase<DBSchema>, 
  className: string
): Promise<number> => {
  const tx = db.transaction('students', 'readonly');
  const index = tx.store.index('byClassName');
  const students = await index.getAll(className);
  return students.length;
};

// Check if a class exists
export const classExists = async (
  db: IDBPDatabase<DBSchema>, 
  className: string
): Promise<boolean> => {
  const tx = db.transaction('teachers', 'readonly');
  const index = tx.store.index('byClassName');
  const teachers = await index.getAll(className);
  return teachers.length > 0;
};

// Delete all data related to a specific class
export const deleteClassData = async (
  db: IDBPDatabase<DBSchema>, 
  className: string
): Promise<void> => {
  // Get all teachers for this class
  const teachersTx = db.transaction('teachers', 'readwrite');
  const teacherIndex = teachersTx.store.index('byClassName');
  const teacherKeys = await teacherIndex.getAllKeys(className);
  
  // Delete each teacher
  for (const key of teacherKeys) {
    await teachersTx.store.delete(key);
  }
  await teachersTx.done;
  
  // Get all students for this class
  const studentsTx = db.transaction('students', 'readwrite');
  const studentIndex = studentsTx.store.index('byClassName');
  const studentKeys = await studentIndex.getAllKeys(className);
  
  // Delete each student
  for (const key of studentKeys) {
    await studentsTx.store.delete(key);
  }
  await studentsTx.done;
};


// Find how to fetch all student with pagination
export const getStudentsWithPagination = async (
  db: IDBPDatabase<DBSchema>,
  page: number,
  pageSize: number
): Promise<Student[]> => {
  const tx = db.transaction('students', 'readonly');
  const allStudents = await tx.store.getAll();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return allStudents.slice(start, end);
};

// Find how to fetch all teachers with pagination
export const getTeachersWithPagination = async (
  db: IDBPDatabase<DBSchema>,
  page: number,
  pageSize: number
): Promise<Teacher[]> => {
  const tx = db.transaction('teachers','readonly');
  const allTeachers = await tx.store.getAll();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return allTeachers.slice(start, end);
};