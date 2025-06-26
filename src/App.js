import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import UnifiedDashboard from './pages/UnifiedDashboard';

function App() {
  return (
    <Router>
      <ToastContainer
  position="top-right"
  autoClose={3000}           // <-- Important
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="dark"
/>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<AuthPage />} />

        {/* Unified Dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UnifiedDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;