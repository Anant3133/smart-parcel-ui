import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { FiUser } from 'react-icons/fi'; // Icon for profile
import { getTokenPayload } from '../utils/token';

export default function DashboardHeader({ title }) {
  const navigate = useNavigate();
  const role = getTokenPayload()?.role;

  if (!role) return null;
  if (role === 'admin') return null;

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Go to Profile"
        >
          <FiUser size={26} />
          Profile
        </button>
        <LogoutButton />
      </div>
    </div>
  );
}
