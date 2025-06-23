import React from 'react';

export default function AdminSidebar({ activePage, onChangePage }) {
  const links = [
    { id: 'dashboard', label: 'Home' },
    { id: 'users', label: 'User List' },
    { id: 'parcels', label: 'All Parcels' },
    { id: 'tamper-alerts', label: 'Tamper Alerts' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <nav className="w-48 bg-gray-900 min-h-screen text-white flex flex-col p-4 space-y-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      {links.map((link) => (
        <button
          key={link.id}
          onClick={() => onChangePage(link.id)}
          className={`text-left px-3 py-2 rounded hover:bg-gray-700 ${
            activePage === link.id ? 'bg-gray-700 font-semibold' : ''
          }`}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}