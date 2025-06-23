import React, { useEffect, useState, useMemo } from 'react';
import { fetchUsers, fetchParcels, fetchAlerts, fetchStats } from '../api/admin';
import DashboardHeader from '../components/DashboardHeader';
import TimelineModal from '../components/TimelineModal';
import { fetchTimeline } from '../api/timeline';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);

  // Create a map of handlerId => handler email (or name)
  const handlersMap = useMemo(() => {
    const map = {};
    users.forEach(user => {
      if (user.role && user.role.toLowerCase() === 'handler') {
        map[user.id] = user.email || 'Unknown Handler';
      }
    });
    return map;
  }, [users]);

  const loadTimeline = async (trackingId) => {
    try {
      const data = await fetchTimeline(trackingId);
      setSelectedTimeline(data);
      setShowTimeline(true);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
      alert('Failed to fetch timeline');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [u, p, a, s] = await Promise.all([
          fetchUsers(),
          fetchParcels(),
          fetchAlerts(),
          fetchStats(),
        ]);
        setUsers(u);
        setParcels(p);
        setAlerts(a);
        setStats(s);
      } catch (err) {
        console.error('Admin data load failed:', err);
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader title="Admin Dashboard" />

      {stats && (
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Platform Stats</h3>
          <p>📦 Parcels: {stats.totalParcels}</p>
          <p>👥 Users: {stats.totalUsers}</p>
          <p>🚨 Alerts: {stats.totalAlerts}</p>
        </div>
      )}

      <section>
        <h3 className="text-lg font-semibold mb-2">All Users</h3>
        <ul className="list-disc ml-5">
          {users.map((u) => (
            <li key={u.id}>
              {u.email} — <strong>{u.role || 'No Role'}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">All Parcels</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Tracking ID</th>
                <th className="border p-2">Recipient</th>
                <th className="border p-2">Sender Email</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((p) => (
                <tr key={p.trackingId || p.TrackingId}>
                  <td className="border p-2">{p.trackingId ?? p.TrackingId}</td>
                  <td className="border p-2">{p.recipientName ?? p.RecipientName}</td>
                  <td className="border p-2">{p.senderEmail ?? p.SenderEmail}</td>
                  <td className="border p-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => loadTimeline(p.trackingId ?? p.TrackingId)}
                    >
                      View Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-red-600">Tamper Alerts</h3>
        <ul className="list-disc ml-5 text-red-600">
          {alerts.map((a, i) => (
            <li key={a.id ?? i}>
              🚨 Parcel {a.parcelTrackingId ?? a.ParcelTrackingId}: {a.message ?? a.Message}
            </li>
          ))}
        </ul>
      </section>

      {showTimeline && selectedTimeline && (
        <TimelineModal
          timeline={selectedTimeline}
          onClose={() => setShowTimeline(false)}
          handlersMap={handlersMap}
        />
      )}
    </div>
  );
}