import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import DashboardHeader from './DashboardHeader';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathToPageId = {
    '/admin-dashboard': 'dashboard',
    '/admin-dashboard/users': 'users',
    '/admin-dashboard/parcels': 'parcels',
    '/admin-dashboard/tamper-alerts': 'tamper-alerts',
    '/admin-dashboard/analytics': 'analytics',
  };

  const activePage = pathToPageId[location.pathname] || 'dashboard';

  const onChangePage = (pageId) => {
    switch (pageId) {
      case 'dashboard':
        navigate('/admin-dashboard');
        break;
      case 'users':
        navigate('/admin-dashboard/users');
        break;
      case 'parcels':
        navigate('/admin-dashboard/parcels');
        break;
      case 'tamper-alerts':
        navigate('/admin-dashboard/tamper-alerts');
        break;
      case 'analytics':
        navigate('/admin-dashboard/analytics');
        break;
      default:
        navigate('/admin-dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar activePage={activePage} onChangePage={onChangePage} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Admin Dashboard" />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}