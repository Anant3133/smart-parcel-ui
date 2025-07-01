import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ activePage, onChangePage }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const links = [
    { id: 'dashboard', label: 'Home' },
    { id: 'users', label: 'User List' },
    { id: 'parcels', label: 'All Parcels' },
    { id: 'tamper-alerts', label: 'Tamper Alerts' },
    { id: 'analytics', label: 'Analytics' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 shadow-sm z-50">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Left: Branding */}
        <button
          type="button"
          className="flex items-center space-x-3 rtl:space-x-reverse bg-transparent border-none focus:outline-none cursor-default"
          tabIndex={-1}
          aria-label="Admin Panel"
          disabled
        >
          <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white">
            Admin Panel
          </span>
        </button>

        {/* Center: Nav Links */}
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-user"
        >
          <ul className="flex flex-col font-medium text-lg p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 
                         md:flex-row md:space-x-10 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 
                         md:dark:bg-gray-900 dark:border-gray-700">
            {links.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => onChangePage(link.id)}
                  className={`block py-2 px-3 rounded-sm transition text-lg font-medium ${
                    activePage === link.id
                      ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-blue-500'
                      : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="relative md:order-2" ref={dropdownRef}>
          <img
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
            src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
            alt="Admin Avatar"
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 py-2 text-sm">
              <button
                onClick={() => navigate('/profile') }
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-600 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}