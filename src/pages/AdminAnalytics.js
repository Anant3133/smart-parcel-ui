// AdminAnalytics.js – Updated with Line and Pie Charts side by side
import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchParcels, fetchAlerts } from '../api/admin';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import { ShieldAlert, Users, PackageSearch, BarChart2, Activity } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminAnalytics() {
  const [userCount, setUserCount] = useState(0);
  const [parcelCount, setParcelCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [statusStats, setStatusStats] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [monthlyParcels, setMonthlyParcels] = useState([]);
  const [parcelsOverTime, setParcelsOverTime] = useState([]); // for line chart

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const users = await fetchUsers();
      const parcels = await fetchParcels();
      const alerts = await fetchAlerts();
      setUserCount(users.length);
      setParcelCount(parcels.length);
      setAlertCount(alerts.length);

      // Parcel Status Distribution
      const statusMap = {};
      parcels.forEach(p => {
        const status = (p.status || 'Unknown');
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      const statusData = Object.keys(statusMap).map(k => ({ name: k, count: statusMap[k] }));
      setStatusStats(statusData);

      // Role Distribution
      const roleMap = {};
      users.forEach(u => {
        const role = (u.role || 'Unknown');
        roleMap[role] = (roleMap[role] || 0) + 1;
      });
      const roleData = Object.keys(roleMap).map(k => ({ name: k, value: roleMap[k] }));
      setRoleDistribution(roleData);

      // Monthly Parcel Count
      const monthMap = {};
      parcels.forEach(p => {
        const month = new Date(p.createdAt || p.created_at || p.created).toLocaleString('default', { month: 'short' });
        monthMap[month] = (monthMap[month] || 0) + 1;
      });
      const monthData = Object.keys(monthMap).map(m => ({ month: m, count: monthMap[m] }));
      setMonthlyParcels(monthData);

      // Parcels Over Time (for line chart) - sorted by date ascending
      // Group by day for better granularity
      const dayMap = {};
      parcels.forEach(p => {
        const day = new Date(p.createdAt || p.created_at || p.created).toISOString().slice(0, 10); // yyyy-mm-dd
        dayMap[day] = (dayMap[day] || 0) + 1;
      });
      const dayData = Object.keys(dayMap)
        .sort()
        .map(d => ({ date: d, count: dayMap[d] }));
      setParcelsOverTime(dayData);

    } catch (err) {
      toast.error('Failed to load analytics');
    }
  };

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Toaster position="top-right" />

      <h1 className="text-4xl font-extrabold mb-6 text-white drop-shadow-lg flex items-center gap-2">
        <BarChart2 className="animate-pulse text-indigo-400" /> Admin Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:shadow-indigo-500/40 transition-shadow">
          <div className="flex items-center gap-4">
            <Users size={36} className="text-blue-400" />
            <div>
              <p className="text-gray-300">Total Users</p>
              <h2 className="text-3xl font-bold animate-fade-in-up">{userCount}</h2>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:shadow-yellow-500/40 transition-shadow">
          <div className="flex items-center gap-4">
            <PackageSearch size={36} className="text-yellow-400" />
            <div>
              <p className="text-gray-300">Total Parcels</p>
              <h2 className="text-3xl font-bold animate-fade-in-up">{parcelCount}</h2>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:shadow-red-500/40 transition-shadow">
          <div className="flex items-center gap-4">
            <ShieldAlert size={36} className="text-red-400" />
            <div>
              <p className="text-gray-300">Tamper Alerts</p>
              <h2 className="text-3xl font-bold animate-fade-in-up">{alertCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Parcel Status Bar Chart + Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-indigo-400">
            <Activity className="animate-pulse" /> Parcel Status Distribution (Bar)
          </h2>
          {statusStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: 'white' }} />
                <Legend wrapperStyle={{ color: 'white' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No status data available.</p>
          )}
        </div>

        <div className="bg-gray-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-indigo-400">
            <Activity className="animate-pulse" /> Parcel Status Distribution (Pie)
          </h2>
          {statusStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusStats}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No status data available.</p>
          )}
        </div>
      </div>

      {/* Row: Monthly Parcels Bar Chart + Parcels Over Time Line Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Parcels Per Month</h2>
          {monthlyParcels.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyParcels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#ccc" />
                <YAxis stroke="#ccc" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: 'white' }} />
                <Legend wrapperStyle={{ color: 'white' }} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No monthly parcel data available.</p>
          )}
        </div>

        <div className="bg-gray-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Parcels Over Time</h2>
          {parcelsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={parcelsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: 'white' }} />
                <Legend wrapperStyle={{ color: 'white' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No parcels over time data available.</p>
          )}
        </div>
      </div>

      {/* User Role Distribution Pie Chart */}
      <div className="bg-gray-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-xl mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-purple-400">User Roles</h2>
        {roleDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: 'white' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No role data available.</p>
        )}
      </div>
    </div>
  );
}
