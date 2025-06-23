import React from 'react';

export default function TimelineModal({ timeline, onClose, handlersMap = {} }) {
  if (!timeline) return null;

  const logs = [
    ...(timeline.statusLogs?.map(log => ({
      action: log.status,
      location: '—',
      handoverTime: log.timestamp,
    })) || []),

    ...(timeline.handovers?.map(log => ({
      action: 'Handover',
      location: handlersMap[log.handlerId] || log.handlerId,
      handoverTime: log.handoverTime,
    })) || []),
  ].sort((a, b) => new Date(a.handoverTime) - new Date(b.handoverTime));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Parcel Timeline</h3>
          <button onClick={onClose} className="text-red-600 font-bold">X</button>
        </div>

        {logs.length === 0 ? (
          <p>No logs available for this parcel.</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-2 py-1 border">Action</th>
                <th className="px-2 py-1 border">Location</th>
                <th className="px-2 py-1 border">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td className="px-2 py-1 border">{log.action}</td>
                  <td className="px-2 py-1 border">{log.location}</td>
                  <td className="px-2 py-1 border">{new Date(log.handoverTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}