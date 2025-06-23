import React, { useEffect, useState } from 'react';

import { fetchUsers } from '../api/admin';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <><div>Loading users...</div></>;
  if (error) return <><div className="text-red-600">{error}</div></>;

  return (
  <>
    <h1 className="text-3xl font-extrabold mb-6 text-white">User List</h1>

    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700 bg-gray-900">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800 sticky top-0">
          <tr>
            {['ID', 'Email', 'Role'].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((u, idx) => (
            <tr
              key={u.id}
              className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                {u.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {u.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {u.role || 'No Role'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
}