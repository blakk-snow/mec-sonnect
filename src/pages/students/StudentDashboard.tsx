// src/pages/StudentDashboard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

interface Class {
  id: number;
  subject: string;
  teacher: string;
  time: string;
  room: string;
}

interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
}

interface Grade {
  id: number;
  subject: string;
  assignment: string;
  score: string;
  date: string;
}

const StudentDashboard: React.FC = () => {
  // Demo data - in a real app, this would come from an API
  const [upcomingClasses] = useState<Class[]>([
    { id: 1, subject: 'Mathematics', teacher: 'Ms. Johnson', time: '09:00 AM', room: 'Room 201' },
    { id: 2, subject: 'Physics', teacher: 'Mr. Rivera', time: '11:30 AM', room: 'Lab 3' },
    { id: 3, subject: 'Literature', teacher: 'Dr. Chen', time: '02:15 PM', room: 'Room 105' },
  ]);

  const [assignments] = useState<Assignment[]>([
    { id: 1, title: 'Algebra Quiz', subject: 'Mathematics', dueDate: 'Tomorrow', status: 'Not Started' },
    { id: 2, subject: 'Physics', title: 'Force & Motion Lab Report', dueDate: 'May 12', status: 'In Progress' },
    { id: 3, subject: 'Literature', title: 'Character Analysis Essay', dueDate: 'May 15', status: 'Submitted' },
  ]);
  
  const [grades] = useState<Grade[]>([
    { id: 1, subject: 'Mathematics', assignment: 'Trigonometry Test', score: '85%', date: 'May 2' },
    { id: 2, subject: 'Physics', assignment: 'Electric Circuits Quiz', score: '92%', date: 'Apr 28' },
    { id: 3, subject: 'Literature', assignment: 'Poetry Analysis', score: '88%', date: 'Apr 25' },
  ]);

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const handleGradeClick = (grade: Grade) => {
    setSelectedGrade(grade === selectedGrade ? null : grade);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <header className="bg-purple-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">MEC Connect</span>
              </div>
              {/* Mobile menu button */}
              <button title='Toggle menu' className="ml-4 md:hidden text-white focus:outline-none">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {/* Desktop nav */}
              <nav className="hidden md:ml-10 md:flex space-x-8">
                <Link to="/dashboard" className="text-white font-medium hover:text-purple-100">Dashboard</Link>
                <Link to="/courses" className="text-purple-200 font-medium hover:text-white">My Courses</Link>
                <Link to="/assignments" className="text-purple-200 font-medium hover:text-white">Assignments</Link>
                <Link to="/resources" className="text-purple-200 font-medium hover:text-white">Resources</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <button title="Notifications" className="p-1 rounded-full text-purple-200 hover:text-white focus:outline-none">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="relative">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-sm font-medium">AS</span>
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">Alex Smith</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First */}
      <main className="max-w-7xl mx-auto py-4 px-4">
        {/* Welcome Banner - Mobile Optimized */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 flex items-center justify-center sm:w-48">
                <svg className="h-16 w-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="p-4 sm:p-6">
                <div className="uppercase tracking-wide text-sm text-purple-600 font-semibold">Student Portal</div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-800">Welcome back, Dzifa!</h1>
                <p className="mt-2 text-gray-600">
                  Track your classes, assignments, and grades.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <svg className="mr-1.5 h-2 w-2 text-blue-500" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    3 Classes Today
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <svg className="mr-1.5 h-2 w-2 text-red-500" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    2 Due Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid - Mobile First */}
        <div className="space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-white overflow-hidden shadow-md rounded-xl">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
              <Link to="/schedule" className="text-sm text-purple-600 hover:text-purple-800">Full</Link>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="px-4 py-3 flex items-center hover:bg-gray-50">
                  <div className="mr-3 flex-shrink-0">
                    <div className="h-10 w-10 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      {classItem.subject.substring(0, 1)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{classItem.time}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{classItem.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{classItem.room}</p>
                  </div>
                  <div>
                    <Link to={`/join-class/${classItem.id}`} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-purple-600">
                      Join
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments Card */}
          <div className="bg-white overflow-hidden shadow-md rounded-xl">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Assignments</h3>
              <Link to="/assignments" className="text-sm text-purple-600 hover:text-purple-800">All</Link>
            </div>
            <div className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="px-4 py-3 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{assignment.subject}</p>
                    <p className="text-sm font-semibold text-gray-800">{assignment.title}</p>
                    <div className="mt-1 flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500">Due: {assignment.dueDate}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        assignment.status === 'Not Started' ? 'bg-red-100 text-red-800' : 
                        assignment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Grades Section - Mobile Optimized with 2 columns and clickable rows */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Grades</h3>
              <Link to="/grades" className="text-sm text-purple-600 hover:text-purple-800">All</Link>
            </div>
            
            {/* Mobile-friendly table with only 2 columns */}
            <div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade) => (
                    <React.Fragment key={grade.id}>
                      <tr 
                        className={`hover:bg-gray-50 cursor-pointer ${selectedGrade?.id === grade.id ? 'bg-purple-50' : ''}`}
                        onClick={() => handleGradeClick(grade)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{grade.subject}</div>
                          <div className="text-xs text-gray-500">{grade.assignment}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            parseInt(grade.score) >= 90 ? 'bg-green-100 text-green-800' : 
                            parseInt(grade.score) >= 80 ? 'bg-blue-100 text-blue-800' : 
                            parseInt(grade.score) >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {grade.score}
                          </span>
                        </td>
                      </tr>
                      {selectedGrade?.id === grade.id && (
                        <tr className="bg-purple-50">
                          <td colSpan={2} className="px-4 py-3">
                            <div className="text-sm space-y-1">
                              <div className="grid grid-cols-2 gap-1">
                                <span className="text-gray-500">Assignment:</span>
                                <span className="font-medium">{grade.assignment}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <span className="text-gray-500">Date:</span>
                                <span className="font-medium">{grade.date}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <span className="text-gray-500">Score:</span>
                                <span className="font-medium">{grade.score}</span>
                              </div>
                              <div className="mt-2">
                                <Link to={`/grades/${grade.id}`} className="text-sm text-purple-600 hover:text-purple-900">
                                  View details
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Overall GPA: <span className="font-medium text-gray-900">3.75</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white overflow-hidden shadow-md rounded-xl">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Learning Hub</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <Link 
                to="/courses" 
                className="flex flex-col items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition duration-200"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">Courses</p>
                </div>
              </Link>
              
              <Link 
                to="/library" 
                className="flex flex-col items-center p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition duration-200"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">Library</p>
                </div>
              </Link>
              
              <Link 
                to="/study-groups" 
                className="flex flex-col items-center p-3 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition duration-200"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">Groups</p>
                </div>
              </Link>
              
              <Link 
                to="/tutoring" 
                className="flex flex-col items-center p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition duration-200"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">Get Help</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-12 border-t border-gray-200 rounded-tl-3xl rounded-tr-3xl">
  <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row justify-between items-center">
      <div className="mb-4 sm:mb-0">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          {/* <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg> */}
          <HomeIcon className="h-8 w-8 text-indigo-600 mr-1" />
        </Link>
      </div>
      <div className="text-sm text-gray-500 align-center">
        <p className="mb-2">&copy; 2025 MagMax Educational Centre</p>
         <p className='text-center'>
            All rights reserved.
          </p>
      </div>
    </div>
  </div>
</footer>

    </div>
  );
};

export default StudentDashboard;