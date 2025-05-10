import React, { createContext, useState, useEffect } from 'react';
import { IDBPDatabase } from 'idb';
import { Teacher, Student, DBSchema } from '../types';
import { 
  initDB, 
//   getAllStudents, 
  getAllTeachers, 
  addTeacher, 
  getTeacher, 
  updateTeacher,
  deleteTeacher,
  addStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass
} from '../lib/usersDB';

type AppContextType = {
  db: IDBPDatabase<DBSchema> | null;
  currentTeacher: Teacher | null;
  isSetup: boolean;
  students: Student[];
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
  
  // Teacher operations
  setupTeacher: (teacher: Teacher) => Promise<void>;
  updateCurrentTeacher: (teacher: Teacher) => Promise<void>;
  getAllTeachers: () => Promise<void>;
  getTeacherById: (id: string) => Promise<Teacher | undefined>;
  removeTeacher: (id: string) => Promise<void>;
  
  // Student operations
  addNewStudent: (student: Student) => Promise<void>;
  updateExistingStudent: (student: Student) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  loadStudentsByClass: (className: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<IDBPDatabase<DBSchema> | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isSetup, setIsSetup] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database connection
  useEffect(() => {
    const connectToDb = async () => {
      try {
        setLoading(true);
        const dbInstance = await initDB();
        setDb(dbInstance);
        
        // Load all teachers to check if any exist
        const allTeachers = await getAllTeachers(dbInstance);
        setTeachers(allTeachers);
        
        if (allTeachers.length > 0) {
          // For simplicity, set the first teacher as current
          // In a real app, you might store this preference in localStorage or in the DB
          setCurrentTeacher(allTeachers[0]);
          setIsSetup(true);
          
          // Load students for this teacher's class
          if (allTeachers[0].className) {
            const classStudents = await getStudentsByClass(dbInstance, allTeachers[0].className);
            setStudents(classStudents);
          }
        } else {
          setIsSetup(false);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError("Failed to connect to database");
      } finally {
        setLoading(false);
      }
    };
    
    connectToDb();
  }, []);

  // Teacher operations
  const setupTeacher = async (teacher: Teacher) => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // Add the teacher to the database
      const teacherId = await addTeacher(db, teacher);
      
      // Get the teacher with the generated ID
      const savedTeacher = await getTeacher(db, teacherId);
      
      if (savedTeacher) {
        setCurrentTeacher(savedTeacher);
        setIsSetup(true);
        
        // Update teachers list
        const updatedTeachers = await getAllTeachers(db);
        setTeachers(updatedTeachers);
        
        // Clear students as we're setting up a new teacher
        setStudents([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to setup teacher:", err);
      setError("Failed to setup teacher");
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentTeacher = async (teacher: Teacher) => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // Ensure teacher has an ID
      if (!teacher.id) {
        throw new Error("Teacher ID is required for update");
      }
      
      await updateTeacher(db, teacher);
      
      // Update local state
      setCurrentTeacher(teacher);
      
      // Update teachers list
      const updatedTeachers = await getAllTeachers(db);
      setTeachers(updatedTeachers);
      
      setError(null);
    } catch (err) {
      console.error("Failed to update teacher:", err);
      setError("Failed to update teacher");
    } finally {
      setLoading(false);
    }
  };

  const getAllTeachersData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const allTeachers = await getAllTeachers(db);
      setTeachers(allTeachers);
      setError(null);
    } catch (err) {
      console.error("Failed to get teachers:", err);
      setError("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const getTeacherById = async (id: string) => {
    if (!db) return undefined;
    
    try {
      return await getTeacher(db, id);
    } catch (err) {
      console.error(`Failed to get teacher with ID ${id}:`, err);
      setError(`Failed to get teacher`);
      return undefined;
    }
  };

  const removeTeacher = async (id: string) => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      await deleteTeacher(db, id);
      
      // If we deleted the current teacher, reset state
      if (currentTeacher && currentTeacher.id === id) {
        setCurrentTeacher(null);
        setIsSetup(false);
        setStudents([]);
      }
      
      // Update teachers list
      const updatedTeachers = await getAllTeachers(db);
      setTeachers(updatedTeachers);
      
      setError(null);
    } catch (err) {
      console.error("Failed to delete teacher:", err);
      setError("Failed to delete teacher");
    } finally {
      setLoading(false);
    }
  };

  // Student operations
  const addNewStudent = async (student: Student) => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // If not specified, use current teacher's class
      if (!student.className && currentTeacher) {
        student.className = currentTeacher.className;
      }
      
      // Add student to database
      const studentId = await addStudent(db, student);
      
      // Get the student with the generated ID
      const savedStudent = await getStudent(db, studentId);
      
      if (savedStudent) {
        // Update local state
        setStudents(prev => [...prev, savedStudent]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to add student:", err);
      setError("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const updateExistingStudent = async (student: Student) => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // Ensure student has an ID
      if (!student.id) {
        throw new Error("Student ID is required for update");
      }
      
      await updateStudent(db, student);
      
      // Update local state
      setStudents(prev => prev.map(s => s.id === student.id ? student : s));
      
      setError(null);
    } catch (err) {
      console.error("Failed to update student:", err);
      setError("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (id: string) => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      await deleteStudent(db, id);
      
      // Update local state
      setStudents(prev => prev.filter(s => s.id !== id));
      
      setError(null);
    } catch (err) {
      console.error("Failed to delete student:", err);
      setError("Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsByClass = async (className: string) => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      const classStudents = await getStudentsByClass(db, className);
      setStudents(classStudents);
      
      setError(null);
    } catch (err) {
      console.error(`Failed to load students for class ${className}:`, err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      db,
      currentTeacher,
      isSetup,
      students,
      teachers,
      loading,
      error,
      setupTeacher,
      updateCurrentTeacher,
      getAllTeachers: getAllTeachersData,
      getTeacherById,
      removeTeacher,
      addNewStudent,
      updateExistingStudent,
      removeStudent,
      loadStudentsByClass
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to access the context
// export const useApp = () => {
//   const context = useContext(AppContext);
//   if (context === undefined) {
//     throw new Error('useApp must be used within an AppProvider');
//   }
//   return context;
// };

// Signals received
// Fast refresh only works when a file only exports components. 
// Use a new file to share constants or functions between 
// components.eslint(react-refresh/only-export-components)


// Hook to access the context
// This is a custom hook that allows components to access the context easily
import { useContext } from 'react';
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Export the context for use in other components
export default AppContext;