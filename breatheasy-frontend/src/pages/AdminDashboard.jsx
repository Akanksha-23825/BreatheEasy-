import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { FiUsers, FiAlertCircle, FiMapPin, FiActivity } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-white">Loading Intelligence...</div>;
  if (!stats) return <div className="text-white text-center p-8 bg-slate-900/60 rounded-3xl border border-white/10 m-6">Intelligence Data Unavailable. Please ensure the backend is active.</div>;

  const cardData = [
    { title: 'Total Users', value: stats.total_users, icon: <FiUsers />, color: 'blue' },
    { title: 'Active Alerts', value: stats.active_alerts, icon: <FiAlertCircle />, color: 'red' },
    { title: 'Unsafe Zones', value: stats.unsafe_roads, icon: <FiMapPin />, color: 'orange' },
    { title: 'System Health', value: '98%', icon: <FiActivity />, color: 'emerald' },
  ];

  const riskData = Object.entries(stats.risk_distribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#7f1d1d']; // Low, Med, High, Critical

  return (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-white/20 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-400 text-2xl mb-4`}>
              {card.icon}
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{card.title}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Population Risk Distribution */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-8">Population Risk Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-8">Network Vulnerability</h3>
          <div className="h-80 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center">
                <span className="text-slate-400 text-sm uppercase tracking-widest">Global Risk</span>
                <span className="text-white text-3xl font-bold">HIGH</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
