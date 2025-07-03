import React from 'react';

export default function AdminPageHeader({ icon: Icon, title }) {
  return (
    <h1 className="text-4xl font-extrabold mb-10 flex items-center gap-3 text-white drop-shadow-lg">
      {Icon && <Icon size={40} />}
      {title}
    </h1>
  );
}
