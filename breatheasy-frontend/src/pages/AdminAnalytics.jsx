import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const radarData = [
  { subject: 'Asthma', A: 120, B: 110 },
  { subject: 'Elderly', A: 98, B: 130 },
  { subject: 'Children', A: 86, B: 130 },
  { subject: 'Pregnant', A: 99, B: 100 },
  { subject: 'Heart', A: 85, B: 90 },
];

const trendData = [
  { name: 'Mon', asthma: 40, elderly: 24 },
  { name: 'Tue', asthma: 30, elderly: 14 },
  { name: 'Wed', asthma: 20, elderly: 98 },
  { name: 'Thu', asthma: 28, elderly: 39 },
  { name: 'Fri', asthma: 19, elderly: 48 },
  { name: 'Sat', asthma: 24, elderly: 38 },
  { name: 'Sun', asthma: 35, elderly: 43 },
];

const categories = [
  { name: 'Asthma Patients',  risk: 'HIGH',   impact: 'Respiratory Distress Spike',     pct: 85, color: '#ef4444' },
  { name: 'Elderly',          risk: 'MEDIUM', impact: 'Cardiac Stress Warning',           pct: 50, color: '#f59e0b' },
  { name: 'Children',         risk: 'HIGH',   impact: 'Developmental Exposure Alert',     pct: 80, color: '#ef4444' },
  { name: 'Healthy Adults',   risk: 'LOW',    impact: 'Standard AQI Guidelines',          pct: 20, color: '#10b981' },
];

const AdminAnalytics = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={styles.topRow}>
        {/* Vulnerability Index */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>🎯 Vulnerability Index</h3>
            <p style={styles.cardSub}>Exposure risk by population segment</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map((cat, i) => (
              <div key={i} style={styles.vulnItem}>
                <div style={styles.vulnTop}>
                  <span style={styles.vulnName}>{cat.name}</span>
                  <span style={{ ...styles.riskBadge, color: cat.color, background: cat.color + '15', border: `1px solid ${cat.color}30` }}>
                    {cat.risk}
                  </span>
                </div>
                <p style={styles.vulnImpact}>{cat.impact}</p>
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: cat.pct + '%', background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div style={{ ...styles.card, flex: 1 }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>🕸 Sensitivity Comparison (S-Index)</h3>
            <p style={styles.cardSub}>Normalized sensitivity across environmental triggers (PM2.5, NO₂, O₃)</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter' }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar name="This Week" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.45} strokeWidth={2} />
              <Radar name="Historical" dataKey="B" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9' }} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={styles.legend}>
            <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#ef4444' }} /> This Week</div>
            <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#6366f1' }} /> Historical Avg</div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div style={styles.card}>
        <div style={{ ...styles.cardHeader, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={styles.cardTitle}>📊 Projected Risk Trends</h3>
            <p style={styles.cardSub}>Predictive risk modeling based on AQI forecast data</p>
          </div>
          <div style={styles.legend}>
            <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#ef4444' }} /> Asthma</div>
            <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#f59e0b' }} /> Elderly</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" stroke="#475569" axisLine={false} tickLine={false} fontSize={12} />
            <YAxis stroke="#475569" axisLine={false} tickLine={false} fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9' }} />
            <Area type="monotone" dataKey="asthma" stroke="#ef4444" fill="url(#ga)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="elderly" stroke="#f59e0b" fill="url(#ge)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles = {
  topRow: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' },
  card: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px', padding: '1.75rem',
  },
  cardHeader: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1.25rem' },
  cardTitle: { color: '#f1f5f9', fontSize: '1rem', fontWeight: '800', margin: 0, fontFamily: "'Inter', sans-serif" },
  cardSub: { color: '#475569', fontSize: '0.78rem', fontWeight: '500', margin: 0 },
  vulnItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
  vulnTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  vulnName: { color: '#e2e8f0', fontSize: '0.875rem', fontWeight: '700', fontFamily: "'Inter', sans-serif" },
  riskBadge: { fontSize: '0.65rem', fontWeight: '800', padding: '3px 10px', borderRadius: '99px', letterSpacing: '0.06em' },
  vulnImpact: { color: '#475569', fontSize: '0.75rem', margin: 0 },
  progressBg: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '99px', transition: 'width 1s ease' },
  legend: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', fontWeight: '600' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
};

export default AdminAnalytics;
