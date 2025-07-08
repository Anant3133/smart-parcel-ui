import React from 'react';
import {
  FiPackage,
  FiArchive,
  FiSend,
  FiTruck,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';

export default function TimelineModal({ timeline, onClose }) {
  if (!timeline) return null;

  const { parcel, statusLogs, handovers } = timeline;

  console.log("🚚 Parcel CreatedAt:", parcel?.CreatedAt);
  console.log("📍 Parcel SenderAddress:", parcel?.SenderAddress);
  console.log("🎯 Parcel DeliveryAddress:", parcel?.DeliveryAddress);
  console.log("🗂️ Status Logs:", statusLogs);
  console.log("🔄 Handovers:", handovers);


  const allStages = [
    'Created',
    'Received',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const logsMap = new Map(
    timeline.statusLogs?.map((log) => [
      log.status,
      {
        timestamp: log.timestamp,
        location:
          timeline.handovers?.find(
            (h) => h.handoverTime === log.timestamp
          )?.location || 'In Transit',
      },
    ]) || []
  );

  // Add Created and Received as default
  logsMap.set('Created', {
  timestamp: parcel?.createdAt || null,
  location: parcel?.senderAddress || 'Unknown'
  });
  logsMap.set('Received', {
    timestamp: parcel?.createdAt || null,
    location: parcel?.senderAddress || 'Unknown',
  });

  const logs = allStages.map((stage) => {
    const log = logsMap.get(stage) || { timestamp: null, location: 'In Transit' };

    return {
      action: stage,
      timestamp: log.timestamp,
      location:
        stage === 'Delivered'
          ? parcel?.deliveryAddress || 'In Transit'
          : log.location || 'In Transit',
    };
  });

  const lastCompletedIndex = logs.reduce(
    (lastIdx, log, idx) => (log.timestamp ? idx : lastIdx),
    -1
  );

  const stageIcons = {
    Created: <FiPackage />,
    Received: <FiArchive />,
    Packed: <FiSend />,
    Shipped: <FiTruck />,
    'Out for Delivery': <FiTruck />,
    Delivered: <FiCheckCircle />,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h3 className="text-xl font-semibold">Parcel Timeline</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors text-xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Timeline Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto relative">
          <ol className="relative border-s-2 border-gray-700 ml-8">
            {logs.map((log, index) => {
              const isCompleted = index <= lastCompletedIndex || log.action === 'Received' || log.action === 'Created';

              return (
                <li key={index} className="mb-12 relative">
                  {/* Icon */}
                  <span
                    className={`absolute -left-[1.15rem] top-1.5 flex items-center justify-center w-8 h-8 rounded-full ring-4 
                    ${isCompleted ? 'ring-blue-500 bg-blue-600' : 'ring-gray-700 bg-gray-700'} 
                    text-white`}
                  >
                    {stageIcons[log.action] || <FiClock />}
                  </span>

                  {/* Content */}
                  <div className="ml-6">
                    <h3 className="text-lg font-semibold capitalize">{log.action}</h3>
                    <time className="block text-sm text-gray-400 mb-1">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : 'Not logged'}
                    </time>
                    <p className="text-sm text-gray-300">
                      Location:{' '}
                      <span className="font-medium text-gray-200">
                        {log.location}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
