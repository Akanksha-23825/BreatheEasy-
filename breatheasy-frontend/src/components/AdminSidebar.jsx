import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiMap, 
  FiAlertTriangle, 
  FiActivity, 
  FiTrendingUp, 
  FiLogOut,
  FiGrid
} from 'react-icons/fi';

const AdminSidebar = () => {
  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: <FiGrid /> },
    { name: 'Risk Heatmap', path: '/admin/heatmap', icon: <FiMap /> },
    { name: 'Health Alerts', path: '/admin/alerts', icon: <FiAlertTriangle /> },
    { name: 'Route Monitor', path: '/admin/routes', icon: <FiActivity /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <FiTrendingUp /> },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-red-500 to-orange-400 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-red-500/20">
          BE
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Admin</h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest">BreatheEasy+</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/30' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <button 
        onClick={() => {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }}
        className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
      >
        <FiLogOut className="text-xl" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default AdminSidebar;
