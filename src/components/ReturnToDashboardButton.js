import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeftCircle } from 'react-icons/fi';

export default function ReturnToDashboardButton({ role }) {
  const navigate = useNavigate();

  const handleClick = () => {
    switch (role) {
      case 'Admin':
        navigate('/admin-dashboard');
        break;
      case 'Sender':
        navigate('/sender-dashboard');
        break;
      case 'Handler':
        navigate('/handler-dashboard');
        break;
      default:
        navigate('/');
    }
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
