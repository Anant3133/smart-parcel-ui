// components/HandlerParcelStatsCards.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { FiPackage, FiClock } from 'react-icons/fi';
import ChartJS from 'chart.js/auto';

export default function HandlerParcelStatsCards({ parcels, statusFlow }) {
  const statusCounts = statusFlow.reduce((acc, status) => {
    acc[status] = parcels.filter(
      p => (p.status ?? '').toLowerCase() === status.toLowerCase()
    ).length;
    return acc;
  }, {});

  const inTransitCount = parcels.filter(p =>
    ['shipped', 'out for delivery', 'packed'].includes((p.status ?? '').toLowerCase())
  ).length;

  const chartData = {
    labels: statusFlow,
    datasets: [
      {
        label: 'Parcels',
        data: statusFlow.map(s => statusCounts[s]),
        backgroundColor: [
          '#22c55e', // green
          '#facc15', // yellow
          '#3b82f6', // blue
          '#8b5cf6', // indigo
          '#ef4444', // red
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-gray-850 bg-opacity-60 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-center justify-around gap-8 text-white">
      <div className="flex flex-col items-center">
        <FiPackage size={48} className="text-indigo-400" />
        <h4 className="mt-2 text-lg font-semibold">Total Parcels</h4>
        <p className="text-3xl font-bold">{parcels.length}</p>
      </div>
      <div className="flex flex-col items-center">
        <FiClock size={48} className="text-yellow-400" />
        <h4 className="mt-2 text-lg font-semibold">In Transit</h4>
        <p className="text-3xl font-bold">{inTransitCount}</p>
      </div>
      <div className="flex flex-col items-center">
        <FiPackage size={48} className="text-green-400" />
        <h4 className="mt-2 text-lg font-semibold">Delivered</h4>
        <p className="text-3xl font-bold">{statusCounts['Delivered'] || 0}</p>
      </div>
      <div className="max-w-xs w-full">
        <Pie
          data={chartData}
          options={{
            plugins: { legend: { position: 'bottom', labels: { color: 'white' } } },
            maintainAspectRatio: true,
          }}
        />
      </div>
    </div>
  );
}
