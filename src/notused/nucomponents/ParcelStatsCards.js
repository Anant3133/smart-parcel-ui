import React from 'react';
import { FiPackage, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';

export default function ParcelStatsCards({ parcels }) {
  const deliveredCount = parcels.filter(p => (p.status ?? '').toLowerCase() === 'delivered').length;
  const inTransitCount = parcels.filter(p =>
    ['packed', 'shipped', 'out for delivery'].includes((p.status ?? '').toLowerCase())
  ).length;
  const pendingCount = parcels.length - deliveredCount - inTransitCount;

  const chartData = {
    labels: ['Delivered', 'In Transit', 'Pending'],
    datasets: [
      {
        label: 'Parcels',
        data: [deliveredCount, inTransitCount, pendingCount],
        backgroundColor: ['#34D399', '#FBBF24', '#6B7280'], // green, yellow, gray
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#D1D5DB' } },
      x: { ticks: { color: '#D1D5DB' } },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-green-500/50 transition-shadow">
        <FiPackage size={36} className="text-green-400" />
        <div>
          <p className="text-sm uppercase tracking-wide text-green-300 font-semibold">Total Parcels</p>
          <p className="text-3xl font-bold text-white">{parcels.length}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-blue-400/60 transition-shadow">
        <FiCheckCircle size={36} className="text-green-400" />
        <div>
          <p className="text-sm uppercase tracking-wide text-green-300 font-semibold">Delivered</p>
          <p className="text-3xl font-bold text-green-400">{deliveredCount}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-yellow-400/70 transition-shadow">
        <FiClock size={36} className="text-yellow-400" />
        <div>
          <p className="text-sm uppercase tracking-wide text-yellow-300 font-semibold">In Transit</p>
          <p className="text-3xl font-bold text-yellow-400">{inTransitCount}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <Bar data={chartData} options={chartOptions} height={130} />
      </div>
    </div>
  );
}
