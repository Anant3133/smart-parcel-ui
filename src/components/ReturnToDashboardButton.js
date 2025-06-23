import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        navigate('/'); // fallback, maybe to login or home
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded"
    >
      Return to Dashboard
    </button>
  );
}