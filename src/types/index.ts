
// Teacher type
export interface Teacher {
    id?: string;
    teacherName: string;
    className: string;
    subjects: [],
    taCode: string; // Unique code for the teacher. E.g., "B1T-MM-2025"
  }


  export interface Subject {
    id: number;
    name: string;
  }
  
  export interface Strand {
    id: number;
    subject_id: number;
    name: string;
  }
  
  export interface SubStrand {
    id: number;
    strand_id: number;
    name: string;
  }
  
  export interface Indicator {
    id: number;
    sub_strand_id: number;
    code: string;
    description: string;
    exemplars: string;
  }
  
  export interface LessonPlan {
    id: number;
    week: string;
    subject_id: number;
    strand_id: number;
    sub_strand_id: number;
    indicator_id: number;
    notes: string;
    created_at: string;
  }


  export interface LessonPlanWithDetails extends LessonPlan {
    subject: Subject;
    strand: Strand;
    sub_strand: SubStrand;
    indicator: Indicator;
  }
  
  // Student type
  export interface Student {
    id?: string;
    studentName: string;
    className: string;
    gender: "Male" | "Female";
    teacherId: string;
  }
  
  // AppState type to manage local application state
  export type AppState = {
    currentTeacher: Teacher | null;
    isSetup: boolean;
  };
  
    // Function to generate a unique ID for students and teachers
    export const generateId = (): string => {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    };


    // Function to generate a unique TA code for teachers
    export const generateTaCode = (): string => {
        const prefix = "MEC-TAC-";
        const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
        return prefix + randomPart; 
    };


    export const generateStudentId = (): string => {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    };


  // Database schema type
  export interface DBSchema {
    teachers: Teacher;
    students: Student;
  }
  