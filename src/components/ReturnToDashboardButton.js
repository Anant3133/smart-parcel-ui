import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenPayload } from '../utils/token';
import { FiArrowLeftCircle } from 'react-icons/fi';

export default function ReturnToDashboardButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    const payload = getTokenPayload();
    console.log('ReturnToDashboardButton: token payload:', payload);

    if (!payload) {
      console.warn('No valid token found — redirecting to login.');
      navigate('/');
      return;
    }

    navigate('/dashboard');  // UnifiedDashboard route
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <FiArrowLeftCircle size={18} />
      Return to Dashboard
    </button>
  );
}