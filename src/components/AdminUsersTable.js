import React from 'react';

export default function AdminUsersTable({ users }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-800 p-6">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900 sticky top-0 z-10">
          <tr>
            {['ID', 'Email', 'Role'].map((header) => (
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
          {users.map((u, idx) => (
            <tr
              key={u.id}
              className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono font-medium">
                {u.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {u.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 capitalize">
                {u.role || 'No Role'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
