// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeacherDashboard from './pages/teachers/TeacherDashboard';
import StudentDashboard from './pages/students/StudentDashboard';
import TeacherSelection from './pages/teachers/TeacherSelection';
import StudentsPage from './pages/teachers/StudentsPage';

const App: React.FC = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teachers" element={<TeacherDashboard />} />
          <Route path="/teacher-selection" element={<TeacherSelection />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/students-dashboard" element={<StudentDashboard />} />
          <Route path="/students" element={<StudentsPage />} />
        </Routes>
    </Router>
  );
};

export default App;