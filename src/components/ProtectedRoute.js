import React from 'react';
import { Navigate } from 'react-router-dom';
import { getTokenPayload } from '../utils/token';

export default function ProtectedRoute({ children, role }) {
  const payload = getTokenPayload();

  console.log('🔐 ProtectedRoute: Token payload =', payload);
  console.log('🔐 ProtectedRoute: Required role =', role);

  if (!payload) {
    console.warn('🚫 No payload found — redirecting to login.');
    return <Navigate to="/" />;
  }

  const userRole = payload.role?.toLowerCase();
  const requiredRole = role?.toLowerCase();

  console.log('👤 User role:', userRole);
  console.log('🔒 Required role:', requiredRole);

  if (requiredRole && userRole !== requiredRole) {
    console.warn(`🚫Role mismatch: ${userRole} !== ${requiredRole} — redirecting to login.`);
    return <Navigate to="/" />;
  }

  console.log('✅ Access granted, rendering protected content.');
  return children;
}