import React from 'react';

export default function HandlersParcelsTable({
  parcels = [],
  onShowStatus,
  onLoadTimeline,
  onRaiseTamperAlert,
}) {
  if (!parcels.length) {
    return (
      <div className="text-center p-4 text-gray-400 italic">
        No parcels found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-850 bg-opacity-60 backdrop-blur-md p-4">
      <table className="min-w-full text-white border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-3 text-left">Tracking ID</th>
            <th className="p-3 text-left">Recipient</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-center">Timeline</th>
            <th className="p-3 text-center">Tamper Alert</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((p) => {
            const tracking = p.ParcelTrackingId || p.trackingId || p.trackingID;
            const statusLower = (p.status ?? '').toLowerCase();

            const statusColor = {
              received: 'bg-gray-600',
              packed: 'bg-yellow-600',
              shipped: 'bg-blue-600',
              'out for delivery': 'bg-indigo-600',
              delivered: 'bg-green-600',
            }[statusLower] || 'bg-gray-600';

            return (
              <tr key={tracking} className="hover:bg-gray-800 transition">
                <td className="p-3">{tracking}</td>
                <td className="p-3">{p.recipientName || 'N/A'}</td>
                <td className="p-3">{p.currentLocation || 'N/A'}</td>
                <td className="p-3 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                    {p.status || 'Unknown'}
                  </span>
                  <button
                    className="ml-2 bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded text-xs"
                    onClick={() => onShowStatus(tracking)}
                    title="View Status Progress"
                  >
                    Show Status
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    className="text-indigo-400 underline text-sm"
                    onClick={() => onLoadTimeline(tracking)}
                    title="View Timeline"
                  >
                    View Timeline
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    onClick={() => onRaiseTamperAlert(tracking)}
                    title="Raise Tamper Alert"
                  >
                    Raise Alert
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
