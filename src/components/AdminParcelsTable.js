import React from 'react';

export default function AdminParcelsTable({ parcels }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700 bg-gray-900 p-6">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800 sticky top-0">
          <tr>
            {[
              'Tracking ID',
              'Recipient',
              'Sender Email',
              'Weight',
              'Delivery Location',
              'Status',
            ].map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {parcels.map((p, idx) => (
            <tr
              key={p.trackingId ?? p.TrackingId}
              className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-300 font-medium font-mono">
                {p.trackingId ?? p.TrackingId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {p.recipientName ?? p.RecipientName ?? 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {p.senderEmail ?? p.SenderEmail ?? p.sender?.email ?? 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {p.weight ?? p.Weight ?? 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {p.deliveryAddress ?? p.DeliveryAddress ?? 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {p.status ?? p.Status ?? 'Unknown'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
