import React from 'react';

export default function AdminTable({ columns, data, rowKey }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-800 p-6">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900 sticky top-0 z-10">
          <tr>
            {columns.map((header) => (
              <th
                key={header.key || header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider select-none"
              >
                {header.label || header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((row, idx) => (
            <tr
              key={row[rowKey] ?? idx}
              className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
            >
              {columns.map((col) => (
                <td
                  key={col.key || col}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-200 ${
                    col.className || ''
                  }`}
                >
                  {typeof col.render === 'function'
                    ? col.render(row)
                    : row[col.key || col] ?? 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
