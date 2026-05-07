import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('adminUser'));
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white">Central Intelligence</h1>
            <p className="text-slate-400">Monitoring real-time air quality & health risks</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-sm font-medium uppercase tracking-wider">System Live</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-300">
              AD
            </div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
