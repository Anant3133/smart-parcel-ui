import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../api/admin';
import { FiUsers, FiUserCheck, FiUserX, FiPieChart } from 'react-icons/fi';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="text-white p-8 text-center text-xl font-semibold">
        Loading users...
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 p-8 text-center text-xl font-semibold">
        {error}
      </div>
    );

  // Stats
  const totalUsers = users.length;
  const rolesCount = users.reduce(
    (acc, user) => {
      const role = (user.role || 'No Role').toLowerCase();
      if (role.includes('admin')) acc.admin++;
      else if (role.includes('handler')) acc.handler++;
      else if (role.includes('sender')) acc.sender++;
      else acc.other++;
      return acc;
    },
    { admin: 0, handler: 0, sender: 0, other: 0 }
  );

  const pieData = {
    labels: ['Admin', 'Handler', 'Sender', 'Other'],
    datasets: [
      {
        data: [
          rolesCount.admin,
          rolesCount.handler,
          rolesCount.sender,
          rolesCount.other,
        ],
        backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#a78bfa'],
        borderColor: '#222',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black p-8 text-white font-sans">
      <h1 className="text-4xl font-extrabold mb-10 flex items-center gap-3">
        <FiUsers size={40} className="text-indigo-400" />
        Admin Users Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          {
            icon: FiUsers,
            label: 'Total Users',
            value: totalUsers,
            color: 'text-indigo-400',
            glow: 'rgba(99,102,241,0.7)',
          },
          {
            icon: FiUserCheck,
            label: 'Admins',
            value: rolesCount.admin,
            color: 'text-red-500',
            glow: 'rgba(239,68,68,0.7)',
          },
          {
            icon: FiUserCheck,
            label: 'Handlers',
            value: rolesCount.handler,
            color: 'text-blue-500',
            glow: 'rgba(59,130,246,0.7)',
          },
          {
            icon: FiUserX,
            label: 'Senders',
            value: rolesCount.sender,
            color: 'text-green-500',
            glow: 'rgba(34,197,94,0.7)',
          },
        ].map(({ icon: Icon, label, value, color, glow }) => (
          <div
            key={label}
            className="bg-gray-800 rounded-lg p-6 shadow-lg flex items-center gap-5 cursor-pointer
            transition-transform transform duration-300 ease-in-out
            hover:scale-105"
            style={{
              boxShadow: `0 0 10px 2px rgba(0,0,0,0.6)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 20px 5px ${glow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 10px 2px rgba(0,0,0,0.6)`;
            }}
          >
            <Icon size={48} className={color} />
            <div>
              <h2 className="text-2xl font-semibold">{label}</h2>
              <p className="text-4xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="max-w-lg mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiPieChart size={24} /> Users by Role Distribution
        </h2>
        {totalUsers === 0 ? (
          <p className="text-gray-400">No user data available.</p>
        ) : (
          <Pie
            data={pieData}
            options={{
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: 'white', font: { size: 14 } },
                },
              },
              maintainAspectRatio: true,
            }}
          />
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-800 p-6 mt-12">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900 sticky top-0 z-10">
            <tr>
              {['ID', 'Email', 'Role'].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((u, idx) => (
              <tr
                key={u.id}
                className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono font-medium">
                  {u.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 capitalize">
                  {u.role || 'No Role'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
