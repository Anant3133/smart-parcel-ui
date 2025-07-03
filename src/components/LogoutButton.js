import React from 'react';
import { clearToken } from '../utils/token';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi'; // Import icon

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  return (
    <button 
       onClick={handleLogout}
       title="Logout"
       type="button" 
       className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900 flex items-center gap-2 transition-colors duration-300">
      <FiLogOut size={18} />
      Logout
    </button>
  );
}
