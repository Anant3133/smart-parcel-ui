import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import SenderDashboard from './pages/SenderDashboard';
import HandlerDashboard from './pages/HandlerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage'; // ✅ Import ProfilePage
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<AuthPage />} />

        {/* Protected routes with role-based access */}
        <Route
          path="/sender-dashboard"
          element={
            <ProtectedRoute role="Sender">
              <SenderDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/handler-dashboard"
          element={
            <ProtectedRoute role="Handler">
              <HandlerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile page accessible to any authenticated user */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;