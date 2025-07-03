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
          title="Go to Profile"
          type="button" 
          className="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800 flex items-center gap-2 transition-colors duration-300">
          <FiUser size={26} />
          Profile
        </button>
        <LogoutButton />
      </div>
    </div>
  );
}
