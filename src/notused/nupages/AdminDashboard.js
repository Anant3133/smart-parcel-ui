import React, { useEffect, useState } from 'react';
import { fetchParcels, fetchUsers, fetchAlerts } from '../api/admin';
import { FiPackage, FiTruck, FiUser, FiUsers, FiAlertCircle, FiBarChart2 } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  const delivered = parcels.filter(p => (p.status ?? '').toLowerCase() === 'delivered').length;
  const inTransit = parcels.filter(p => ['shipped', 'out for delivery', 'packed'].includes((p.status ?? '').toLowerCase())).length;

  const chartData = {
    labels: ['Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'],
    datasets: [
      {
        label: 'Parcels by Status',
        data: [
          parcels.filter(p => (p.status ?? '').toLowerCase() === 'received').length,
          parcels.filter(p => (p.status ?? '').toLowerCase() === 'packed').length,
          parcels.filter(p => (p.status ?? '').toLowerCase() === 'shipped').length,
          parcels.filter(p => (p.status ?? '').toLowerCase() === 'out for delivery').length,
          delivered
        ],
        backgroundColor: ['#60a5fa', '#facc15', '#34d399', '#f97316', '#10b981'],
        borderColor: '#1f2937',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: 'white' },
      },
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: 'white' },
        grid: { color: '#374151' }
      },
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 p-6 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8">📊 Admin Dashboard</h1>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Total Parcels', value: total, icon: FiPackage, color: 'text-blue-400' },
              { label: 'Delivered', value: delivered, icon: FiTruck, color: 'text-green-400' },
              { label: 'In Transit', value: inTransit, icon: FiBarChart2, color: 'text-yellow-300' },
              { label: 'Total Users', value: userCount, icon: FiUsers, color: 'text-blue-300' },
              { label: 'Handlers', value: handlerCount, icon: FiUser, color: 'text-purple-300' },
              { label: 'Tamper Alerts', value: alertCount, icon: FiAlertCircle, color: 'text-red-400' }
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-gray-800 rounded-lg p-6 shadow-lg flex items-center gap-4 transition duration-300 ease-in-out hover:shadow-[0_0_20px_5px_rgba(255,255,255,0.1)] hover:scale-[1.03] cursor-pointer"
              >
                <Icon size={40} className={color} />
                <div>
                  <h2 className="text-xl font-semibold">{label}</h2>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-12 max-w-4xl">
            <h2 className="text-xl font-bold mb-4">📦 Parcel Status Distribution</h2>
            <Bar data={chartData} options={chartOptions} />
          </div>

          {latestAlerts.length > 0 && (
            <div className="bg-gray-800 p-6 rounded shadow max-w-4xl">
              <h2 className="text-xl font-bold mb-4 text-red-400">🚨 Recent Tamper Alerts</h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {latestAlerts.map(alert => (
                  <li key={alert.id ?? alert.parcelTrackingId}>
                    Parcel <strong>{alert.parcelTrackingId ?? 'Unknown'}</strong>: {alert.note ?? alert.message ?? 'No message'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
