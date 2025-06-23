import React, { useEffect } from 'react';

const STATUS_STEPS = ['Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function StatusProgressModal({ currentStatus, onClose }) {
  // Normalize the currentStatus for safer matching:
  const normalizedStatus = currentStatus?.trim().toLowerCase() || '';
  const currentIndex = STATUS_STEPS.findIndex(
    status => status.toLowerCase() === normalizedStatus
  );

  useEffect(() => {
    console.log('StatusProgressModal currentStatus:', currentStatus);
    console.log('Normalized status:', normalizedStatus);
    console.log('Current index:', currentIndex);
  }, [currentStatus, normalizedStatus, currentIndex]);

  // If no valid status matched, highlight none:
  const validIndex = currentIndex >= 0 ? currentIndex : -1;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parcel-status-title"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-md">
        <h2 id="parcel-status-title" className="text-2xl font-bold mb-4">
          Parcel Status
        </h2>
        <div className="flex justify-between items-center mb-6">
          {STATUS_STEPS.map((status, index) => {
            const isCompleted = index <= validIndex;

            return (
              <div key={status} className="flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-400'}`}
                  aria-current={isCompleted ? 'step' : undefined}
                >
                  {index + 1}
                </div>
                <p className="mt-2 text-xs text-black font-medium">{status}</p>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close Parcel Status Modal"
        >
          Close
        </button>
      </div>
    </div>
  );
}