import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiAlertCircle, FiClock, FiMapPin } from 'react-icons/fi';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ title: '', message: '', zone: '', severity: 'medium' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/admin/alerts', newAlert);
      setNewAlert({ title: '', message: '', zone: '', severity: 'medium' });
      fetchAlerts();
    } catch (err) {
      alert("Failed to broadcast alert");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Alert Composition */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <FiSend className="text-red-500 text-xl" />
            <h3 className="text-xl font-bold text-white">Broadcast Advisory</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Alert Title</label>
              <input 
                value={newAlert.title}
                onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                placeholder="e.g. Asthma Spike Detected"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Zone / Region</label>
              <input 
                value={newAlert.zone}
                onChange={(e) => setNewAlert({...newAlert, zone: e.target.value})}
                placeholder="e.g. Bengaluru East"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Severity</label>
              <select 
                value={newAlert.severity}
                onChange={(e) => setNewAlert({...newAlert, severity: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="low">Informational (Low)</option>
                <option value="medium">Warning (Medium)</option>
                <option value="high">Critical (High)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Message</label>
              <textarea 
                value={newAlert.message}
                onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                rows="4"
                placeholder="Describe the advisory and recommended actions..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
              ></textarea>
            </div>
            <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20">
              Broadcast to All Users
            </button>
          </form>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FiClock className="text-slate-400" />
          Active Advisory History
        </h3>
        
        {loading ? (
          <div className="text-slate-400">Loading history...</div>
        ) : (
          <div className="space-y-4">
            {alerts.length === 0 && <p className="text-slate-500 italic">No advisories broadcasted yet.</p>}
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0
                  ${alert.severity === 'high' ? 'bg-red-500/10 text-red-500' : 
                    alert.severity === 'medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}
                `}>
                  <FiAlertCircle />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-lg font-bold text-white">{alert.title}</h4>
                    <span className="text-xs text-slate-500">{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <FiMapPin className="text-red-400" />
                    <span>Target: <span className="text-slate-200 font-medium">{alert.zone}</span></span>
                    <span className="mx-2">•</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold
                      ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 
                        alert.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}
                    `}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlerts;
