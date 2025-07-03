import React from 'react';
import { Pie } from 'react-chartjs-2';

export default function AdminStatusPieChart({ statusCounts }) {
  const data = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Parcel Status Distribution',
        data: Object.values(statusCounts),
        backgroundColor: ['#3b82f6', '#facc15', '#a78bfa', '#f97316', '#22c55e'],
        borderColor: '#1f2937',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="max-w-xl mx-auto mb-12 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-indigo-400">Parcel Status Breakdown</h2>
      <Pie
        data={data}
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
    </div>
  );
}
