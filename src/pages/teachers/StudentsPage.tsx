import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeft } from 'lucide-react';
import { useApp } from '../../contexts/UserAppContext';
import StudentManagement from './StudentManagement';

const StudentsPage: React.FC = () => {
  const { currentTeacher } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold">MEC Connect</span>
              </div>
              <nav className="hidden md:ml-10 md:flex space-x-8">
                <Link to="/dashboard" className="text-indigo-200 font-medium hover:text-white">Dashboard</Link>
                <Link to="/classes" className="text-indigo-200 font-medium hover:text-white">Classes</Link>
                <Link to="/students" className="text-white font-medium hover:text-indigo-100">Students</Link>
                <Link to="/resources" className="text-indigo-200 font-medium hover:text-white">Resources</Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <button title="View notifications" className="p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {currentTeacher?.teacherName?.substring(0, 2).toUpperCase() || 'TS'}
                      </span>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {currentTeacher?.teacherName || 'Teacher'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4 text-indigo-600 hover:text-indigo-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Add, edit, and manage student records for {currentTeacher?.className || 'your class'}.
              </p>
            </div>
          </div>
        </div>

        {/* Student Management Component */}
        <div className="px-4 sm:px-0">
          <StudentManagement />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-12 border-t border-gray-200 rounded-tl-3xl rounded-tr-3xl">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
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

export default StudentsPage;