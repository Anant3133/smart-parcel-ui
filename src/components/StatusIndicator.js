import React from 'react';

const statuses = ['Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function StatusIndicator({ currentStatus }) {
  const currentIndex = statuses.findIndex(
    (s) => s.toLowerCase() === currentStatus.toLowerCase()
  );

  return (
    <div className="flex space-x-4">
      {statuses.map((status, idx) => (
        <div key={status} className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full border-2 ${
              idx <= currentIndex
                ? 'bg-green-500 border-green-600'
                : 'bg-gray-400 border-gray-500'
            }`}
          />
          <span className="mt-1 text-xs text-white">{status}</span>
        </div>
      ))}
    </div>
  );
}