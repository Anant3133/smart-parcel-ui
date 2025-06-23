import React, { useEffect, useState } from 'react';
import { fetchAllAlertsWithParcelInfo } from '../api/tamper'; // <-- updated import
import { FiAlertCircle, FiPackage, FiClock, FiPieChart } from 'react-icons/fi';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminTamperAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllAlertsWithParcelInfo();  // <-- use enriched data
        setAlerts(data);
      } catch (err) {
        setError('Failed to load tamper alerts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-white p-6">Loading tamper alerts...</div>;
  if (error) return <div className="text-red-600 p-6">{error}</div>;

  // Calculate stats
  const totalAlerts = alerts.length;

  // Count alerts by parcel tracking id (to show parcel-based stats)
  const alertsByParcel = alerts.reduce((acc, alert) => {
    const key = alert.parcelTrackingId ?? alert.ParcelTrackingId ?? 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(alert);
    return acc;
  }, {});

  // Prepare pie chart data: Number of alerts per parcel (top 5 parcels by alerts)
  const topParcels = Object.entries(alertsByParcel)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  const pieData = {
    labels: topParcels.map(([parcelId]) => parcelId),
    datasets: [
      {
        data: topParcels.map(([, alerts]) => alerts.length),
        backgroundColor: ['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#8b5cf6'],
        borderColor: '#222',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black p-8 text-white font-sans">
      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        <FiAlertCircle className="text-red-600" size={40} />
        Tamper Alerts Dashboard
      </h1>

      {/* Stats Cards with glowing hover effect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[ 
          { icon: FiAlertCircle, label: 'Total Alerts', value: totalAlerts, color: 'red-500' },
          { icon: FiPackage, label: 'Affected Parcels', value: Object.keys(alertsByParcel).length, color: 'indigo-400' },
          { icon: FiClock, label: 'Most Alerts (Top Parcel)', value: topParcels.length > 0 ? topParcels[0][1].length : 0, color: 'yellow-400' }
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className={`bg-gray-800 rounded-lg p-6 shadow-lg flex items-center gap-4
              transition duration-300 ease-in-out
              hover:shadow-[0_0_15px_3px_rgba(59,130,246,0.7)] hover:scale-[1.03] cursor-pointer`}
            style={{ boxShadow: `0 0 8px 2px rgba(0,0,0,0.5)` }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 0 15px 4px var(--tw-shadow-color)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = `0 0 8px 2px rgba(0,0,0,0.5)`;
            }}
          >
            <Icon size={48} className={`text-${color}`} />
            <div>
              <h2 className="text-2xl font-semibold">{label}</h2>
              <p className="text-4xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="max-w-xl mx-auto mb-12 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiPieChart /> Alerts Distribution - Top 5 Parcels
        </h2>
        {topParcels.length === 0 ? (
          <p className="text-gray-400">No alert data available.</p>
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

      {/* Alerts Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-800 p-6">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900 sticky top-0 z-10">
            <tr>
              {[
                'Tracking ID',
                'Message',
                'Raised At',
                'Parcel Recipient',
                'Delivery Location',
                'Weight (kg)'
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {alerts.map((alert, idx) => {
              const parcel = alert.parcel || {}; // parcel info is nested inside alert now

              return (
                <tr
                  key={alert.id ?? alert.parcelTrackingId ?? idx}
                  className={idx % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-indigo-300">
                    {alert.parcelTrackingId ?? alert.ParcelTrackingId ?? 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                    {alert.note ?? alert.message ?? alert.Message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(alert.raisedAt ?? alert.createdAt ?? alert.timestamp ?? Date.now()).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {parcel.recipientName ?? parcel.RecipientName ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {parcel.deliveryAddress ?? parcel.DeliveryAddress ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {parcel.weight != null ? parcel.weight.toFixed(2) : parcel.Weight != null ? parcel.Weight.toFixed(2) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
