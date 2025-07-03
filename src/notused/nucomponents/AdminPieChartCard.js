import React from 'react';
import { Pie } from 'react-chartjs-2';

export default function AdminPieChartCard({ title, icon: Icon, data, emptyMessage = 'No data available.' }) {
  return (
    <div className="max-w-lg mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        {Icon && <Icon size={24} />}
        {title}
      </h2>
      {data.datasets[0].data.every((count) => count === 0) ? (
        <p className="text-gray-400">{emptyMessage}</p>
      ) : (
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
      )}
    </div>
  );
}
