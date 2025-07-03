import React from 'react';

export default function AdminLoading({ message = 'Loading...' }) {
  return (
    <div className="text-white p-8 text-center text-xl font-semibold">
      {message}
    </div>
  );
}
