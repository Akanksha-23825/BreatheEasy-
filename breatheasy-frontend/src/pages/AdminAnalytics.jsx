import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { FiTrendingUp, FiTarget, FiActivity } from 'react-icons/fi';

const AdminAnalytics = () => {
  // Mock data representing Research-Oriented population analytics
  const radarData = [
    { subject: 'Asthma Patients', A: 120, B: 110, fullMark: 150 },
    { subject: 'Elderly', A: 98, B: 130, fullMark: 150 },
    { subject: 'Children', A: 86, B: 130, fullMark: 150 },
    { subject: 'Pregnant Women', A: 99, B: 100, fullMark: 150 },
    { subject: 'Heart Patients', A: 85, B: 90, fullMark: 150 },
  ];

  const trendData = [
    { name: 'Mon', asthma: 400, elderly: 240, children: 240 },
    { name: 'Tue', asthma: 300, elderly: 139, children: 221 },
    { name: 'Wed', asthma: 200, elderly: 980, children: 229 },
    { name: 'Thu', asthma: 278, elderly: 390, children: 200 },
    { name: 'Fri', asthma: 189, elderly: 480, children: 218 },
    { name: 'Sat', asthma: 239, elderly: 380, children: 250 },
    { name: 'Sun', asthma: 349, elderly: 430, children: 210 },
  ];

  const categories = [
    { name: 'Asthma Patients', risk: 'HIGH', impact: 'Respiratory Distress Spike', color: 'red' },
    { name: 'Elderly', risk: 'MEDIUM', impact: 'Cardiac Stress Warning', color: 'orange' },
    { name: 'Children', risk: 'HIGH', impact: 'Developmental Exposure Alert', color: 'red' },
    { name: 'Healthy Adults', risk: 'LOW', impact: 'Standard Guidelines', color: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Categories List */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FiTarget className="text-red-500" />
            Vulnerability Index
          </h3>
          <div className="space-y-4">
            {categories.map((cat, i) => (
              <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{cat.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${cat.color}-500/20 text-${cat.color}-400`}>
                    {cat.risk}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{cat.impact}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                   <div className={`h-full bg-${cat.color}-500`} style={{ width: cat.risk === 'HIGH' ? '85%' : cat.risk === 'MEDIUM' ? '50%' : '20%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Comparison */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">Sensitivity Comparison (S-Index)</h3>
          <p className="text-slate-400 text-sm mb-8">Normalized sensitivity across different environmental triggers (PM2.5, NO2, O3).</p>
          <div className="flex-1 min-h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="Current Week" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Radar name="Historical Avg" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10' }} />
                </RadarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xl font-bold text-white">Projected Risk Trends</h3>
            <p className="text-slate-400 text-sm">Predictive modeling of hospitalization risk based on AQI forecast.</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Asthma
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span> Elderly
             </div>
          </div>
        </div>
        <div className="h-80 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAsthma" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorElderly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="asthma" stroke="#ef4444" fillOpacity={1} fill="url(#colorAsthma)" strokeWidth={3} />
                <Area type="monotone" dataKey="elderly" stroke="#f59e0b" fillOpacity={1} fill="url(#colorElderly)" strokeWidth={3} />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
