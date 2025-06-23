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
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
      title="Logout"
    >
      <FiLogOut size={18} />
      Logout
    </button>
  );
}
