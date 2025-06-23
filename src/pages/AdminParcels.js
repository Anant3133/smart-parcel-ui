import React, { useEffect, useState } from 'react';

import { fetchParcels } from '../api/admin';

export default function AdminParcels() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchParcels();
        setParcels(data);
      } catch (err) {
        setError('Failed to load parcels');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <><div>Loading parcels...</div></>;
  if (error) return <><div className="text-red-600">{error}</div></>;

  return (
  <>
    <h1 className="text-3xl font-extrabold mb-6 text-white">All Parcels</h1>

    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700 bg-gray-900">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800 sticky top-0">
          <tr>
            {['Tracking ID', 'Recipient', 'Sender Email'].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider select-none"
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                {p.trackingId ?? p.TrackingId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {p.recipientName ?? p.RecipientName ?? 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {p.senderEmail ?? p.SenderEmail ?? p.sender?.email ?? 'Unknown'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
}