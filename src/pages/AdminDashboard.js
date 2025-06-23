import React, { useEffect, useState } from 'react';
import { fetchParcels, fetchUsers, fetchAlerts } from '../api/admin';

export default function AdminDashboard() {
  const [parcels, setParcels] = useState([]);
  const [userCount, setUserCount] = useState(null);
  const [handlerCount, setHandlerCount] = useState(null);
  const [alertCount, setAlertCount] = useState(null);
  const [latestAlerts, setLatestAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const parcelData = await fetchParcels();
        const userData = await fetchUsers();
        const alertData = await fetchAlerts();

        setParcels(parcelData);
        setUserCount(userData.length);
        setHandlerCount(userData.filter(u => u.role === 'Handler').length);
        setAlertCount(alertData.length);
        setLatestAlerts(alertData.slice(0, 5));
      } catch (err) {
        console.error('Dashboard data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = parcels.length;
  const delivered = parcels.filter(p =>
    (p.status ?? p.currentStatus ?? '').toLowerCase() === 'delivered'
  ).length;
  const inTransit = parcels.filter(p =>
    ['shipped', 'out for delivery', 'packed'].includes((p.status ?? '').toLowerCase())
  ).length;

  return (
    <div
      className="h-full w-full bg-cover bg-center p-6 text-white"
      style={{ backgroundImage: 'url(/admin-bg.jpg)' }}
    >
      <h1 className="text-3xl font-bold mb-6">Welcome, Admin</h1>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-black/60 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Total Parcels</h2>
            <p className="text-3xl">{total}</p>
          </div>
          <div className="bg-black/60 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Delivered</h2>
            <p className="text-3xl text-green-400">{delivered}</p>
          </div>
          <div className="bg-black/60 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">In Transit</h2>
            <p className="text-3xl text-yellow-300">{inTransit}</p>
          </div>
          <div className="bg-black/60 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Total Users</h2>
            <p className="text-3xl text-blue-300">{userCount}</p>
          </div>
          <div className="bg-black/60 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Handlers</h2>
            <p className="text-3xl text-purple-300">{handlerCount}</p>
          </div>
          <div className="bg-black/60 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Tamper Alerts</h2>
            <p className="text-3xl text-red-400">{alertCount}</p>
          </div>
        </div>
      )}

      {latestAlerts.length > 0 && (
        <div className="bg-black/60 p-6 rounded shadow max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-red-400">Recent Tamper Alerts</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            {latestAlerts.map(alert => (
              <li key={alert.id ?? alert.parcelTrackingId}>
                🚨 Parcel <strong>{alert.parcelTrackingId ?? 'Unknown'}</strong>: {alert.note ?? alert.message ?? 'No message'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}