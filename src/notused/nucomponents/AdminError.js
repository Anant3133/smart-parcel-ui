import React from 'react';

export default function AdminError({ message }) {
  return (
    <div className="text-red-600 p-8 text-center text-xl font-semibold">
      {message}
    </div>
  );
}
