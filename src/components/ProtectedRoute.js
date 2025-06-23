import React from 'react';
import { Navigate } from 'react-router-dom';
import { getTokenPayload } from '../utils/token';

export default function ProtectedRoute({ children, role }) {
  const payload = getTokenPayload();

  if (!payload) return <Navigate to="/" />;

  if (role && payload.role !== role) return <Navigate to="/" />;

  return children;
}