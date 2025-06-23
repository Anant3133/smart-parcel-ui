import React, { useEffect, useState } from 'react';

import { fetchAlerts } from '../api/admin';

export default function AdminTamperAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (err) {
        setError('Failed to load tamper alerts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <><div>Loading tamper alerts...</div></>;
  if (error) return <><div className="text-red-600">{error}</div></>;

  return (
  <>
    <h1 className="text-3xl font-extrabold mb-6 text-red-500">🚨 Tamper Alerts</h1>

    {alerts.length === 0 ? (
      <div className="text-gray-300 bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
        No tamper alerts at this time.
      </div>
    ) : (
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700 bg-gray-900">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              {['Tracking ID', 'Message', 'Raised At'].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {alerts.map((alert, idx) => (
              <tr
                key={alert.id ?? alert.parcelTrackingId}
                className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                  {alert.parcelTrackingId ?? alert.ParcelTrackingId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                  {alert.note ?? alert.message ?? alert.Message}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(alert.raisedAt ?? alert.createdAt ?? alert.timestamp ?? Date.now()).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
);
}