import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';

export default function DashboardHeader({ title }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/profile')}
          className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          Profile
        </button>
        <LogoutButton />
      </div>
    </div>
  );
}
