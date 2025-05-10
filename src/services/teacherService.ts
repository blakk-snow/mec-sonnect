// src/services/teacherService.ts
import { Teacher } from '../types';
import { preconfiguredTeachers } from '../pages/teachers/preconfiguredTeachers';

/**
 * Fetches a teacher by their ID
 * @param teacherId The ID of the teacher to fetch
 * @returns A Promise resolving to a Teacher object
 */
export const getTeacherById = async (teacherId: string): Promise<Teacher> => {
  // In a real application, this would be an API call
  // For now, we're using the preconfigured teachers to simulate a backend
  return new Promise((resolve, reject) => {
    try {
      // Simulate network delay
      setTimeout(() => {
        const apiTeacher = preconfiguredTeachers.find(t => t.id === teacherId);
        
        if (!apiTeacher) {
          throw new Error('Teacher not found');
        }
        
        // Transform the data to match the Teacher type
        const teacherData: Teacher = {
          id: apiTeacher.id,
          teacherName: apiTeacher.name,
          className: apiTeacher.classLevel,
          subjects: apiTeacher.subjects,
          taCode: apiTeacher.taCode
        };
        
        resolve(teacherData);
      }, 500); // Simulate 500ms network delay
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get students for a specific teacher
 * @param teacherId The ID of the teacher
 * @returns A Promise resolving to an array of student objects
 */
export const getTeacherStudents = async (teacherId: string) => {
  // This would be an API call in a real application
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock student data
      resolve({
        students: [
          { id: 's1', name: 'John Doe', gender: 'Male', age: 12 },
          { id: 's2', name: 'Jane Smith', gender: 'Female', age: 13 },
          // More students would be fetched from the API
        ],
        total: 28
      });
    }, 700);
  });
};

/**
 * Get attendance statistics for a teacher's class
 * @param teacherId The ID of the teacher
 * @returns A Promise resolving to attendance statistics
 */
export const getAttendanceStats = async (teacherId: string) => {
  // This would be an API call in a real application
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        percentage: 94,
        present: 26,
        absent: 2,
        total: 28
      });
    }, 600);
  });
};

/**
 * Get counts of teaching materials
 * @param teacherId The ID of the teacher
 * @returns A Promise resolving to counts of different materials
 */
export const getTeachingMaterialCounts = async (teacherId: string) => {
  // This would be an API call in a real application
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        lessonPlans: 12,
        notes: 8
      });
    }, 500);
  });
};

/**
 * Get upcoming events for a teacher
 * @param teacherId The ID of the teacher
 * @returns A Promise resolving to an array of event objects
 */
export const getUpcomingEvents = async (teacherId: string) => {
  // This would be an API call in a real application
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { title: 'Staff Meeting', date: 'Today, 2:00 PM', subject: 'Weekly Review' },
        { title: 'End of Term Exam', date: 'Next Week', subject: 'All Subjects' }
      ]);
    }, 800);
  });
};

/**
 * Get recent activities for a teacher
 * @param teacherId The ID of the teacher
 * @returns A Promise resolving to an array of activity objects
 */
export const getRecentActivities = async (teacherId: string) => {
  // This would be an API call in a real application
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { title: 'Marked attendance for Basic 5', timestamp: '9:15 AM Today', type: 'attendance' },
        { title: 'Created new science note', timestamp: 'Yesterday', type: 'note' },
        { title: 'Added new lesson plan for Mathematics', timestamp: '2 days ago', type: 'lessonPlan' },
        { title: 'Updated student records', timestamp: '3 days ago', type: 'student' }
      ]);
    }, 700);
  });
};