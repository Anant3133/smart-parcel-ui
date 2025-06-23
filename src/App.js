import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import SenderDashboard from './pages/SenderDashboard';
import HandlerDashboard from './pages/HandlerDashboard';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminParcels from './pages/AdminParcels';
import AdminTamperAlerts from './pages/AdminTamperAlerts';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<AuthPage />} />

  {/* Admin Nested Routes */}
<Route
  path="/admin-dashboard/*"
  element={
    <ProtectedRoute role="Admin">
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="parcels" element={<AdminParcels />} />
  <Route path="tamper-alerts" element={<AdminTamperAlerts />} />
  <Route path="analytics" element={<AdminAnalytics />} />
</Route>


        {/* Other dashboards */}
        <Route
          path="/sender-dashboard"
          element={
            <ProtectedRoute role="Sender">
              <SenderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/handler-dashboard/*"
          element={
             <ProtectedRoute role="Handler">
               <HandlerDashboard />
             </ProtectedRoute>
          }
       >
  <Route index element={<div>Handler home page</div>} />
  <Route path="parcels" element={<AdminParcels />} />
</Route>

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;