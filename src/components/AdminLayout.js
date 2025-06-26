import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from './DashboardHeader';
import AdminUsers from '../pages/AdminUsers';
import AdminParcels from '../pages/AdminParcels';
import AdminTamperAlerts from '../pages/AdminTamperAlerts';
import AdminAnalytics from '../pages/AdminAnalytics';
import { Bar } from 'react-chartjs-2'; // only if you're using chart here

export default function AdminLayout({
  adminActivePage,
  setAdminActivePage,
  adminChartData,
  adminChartOptions,
  total,
  delivered,
  inTransit,
  userCount,
  handlerCount,
  alertCount,
  latestAlerts
}) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar activePage={adminActivePage} onChangePage={setAdminActivePage} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Admin Dashboard" />
        <main className="flex-1 p-6 overflow-auto">
          {adminActivePage === 'dashboard' && (
            <>
              <h1 className="text-4xl font-bold mb-8">📊 Admin Dashboard</h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                {[
                  { label: 'Total Parcels', value: total, color: 'text-blue-400' },
                  { label: 'Delivered', value: delivered, color: 'text-green-400' },
                  { label: 'In Transit', value: inTransit, color: 'text-yellow-300' },
                  { label: 'Total Users', value: userCount, color: 'text-blue-300' },
                  { label: 'Handlers', value: handlerCount, color: 'text-purple-300' },
                  { label: 'Tamper Alerts', value: alertCount, color: 'text-red-400' },
                ].map(({ label, value, color }, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className={`text-xl font-semibold ${color}`}>{label}</h2>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-12 max-w-4xl">
                <h2 className="text-xl font-bold mb-4">📦 Parcel Status Distribution</h2>
                <Bar data={adminChartData} options={adminChartOptions} />
              </div>

              {latestAlerts?.length > 0 && (
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

          {adminActivePage === 'users' && <AdminUsers />}
          {adminActivePage === 'parcels' && <AdminParcels />}
          {adminActivePage === 'tamper-alerts' && <AdminTamperAlerts />}
          {adminActivePage === 'analytics' && (
            <AdminAnalytics
              chartData={adminChartData}
              chartOptions={adminChartOptions}
            />
          )}
        </main>
      </div>
    </div>
  );
}