import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#7f1d1d'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/admin/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={styles.loadingState}>
      <div style={styles.spinner} />
      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading intelligence data...</span>
    </div>
  );

  if (!stats) return (
    <div style={styles.errorState}>
      ⚠ Intelligence data unavailable. Ensure the backend is active.
    </div>
  );

  const cardData = [
    { title: 'Total Users', value: stats.total_users, icon: '👥', accent: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)' },
    { title: 'Active Alerts', value: stats.active_alerts, icon: '🚨', accent: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
    { title: 'Unsafe Zones', value: stats.unsafe_roads, icon: '📍', accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
    { title: 'System Health', value: '98%', icon: '💚', accent: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
  ];

  const riskData = Object.entries(stats.risk_distribution).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {cardData.map((card, i) => (
          <div key={i} style={{ ...styles.statCard, background: card.bg, border: `1px solid ${card.border}` }}>
            <div style={{ ...styles.statIcon, background: card.bg, border: `1px solid ${card.border}` }}>
              {card.icon}
            </div>
            <div>
              <div style={styles.statLabel}>{card.title}</div>
              <div style={{ ...styles.statValue, color: card.accent }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Bar Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Population Risk Distribution</h3>
            <p style={styles.chartSub}>Exposure load by risk tier across all users</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={riskData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis stroke="#475569" axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Network Vulnerability</h3>
            <p style={styles.chartSub}>Risk breakdown by severity level</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <ResponsiveContainer width="60%" height={260}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {riskData.map((entry, index) => (
                <div key={entry.name} style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, background: COLORS[index % COLORS.length] }} />
                  <div>
                    <div style={styles.legendName}>{entry.name}</div>
                    <div style={styles.legendVal}>{entry.value} users</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Row */}
      <div style={styles.infoRow}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🌏</div>
          <div>
            <div style={styles.infoLabel}>Coverage</div>
            <div style={styles.infoVal}>Bengaluru Metro</div>
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🤖</div>
          <div>
            <div style={styles.infoLabel}>ML Engine</div>
            <div style={styles.infoVal}>PELM Active</div>
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🔄</div>
          <div>
            <div style={styles.infoLabel}>Data Refresh</div>
            <div style={styles.infoVal}>Every 1 Hour</div>
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🛡️</div>
          <div>
            <div style={styles.infoLabel}>Data Source</div>
            <div style={styles.infoVal}>WAQI / CPCB</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loadingState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '1rem', minHeight: '300px',
  },
  spinner: {
    width: '36px', height: '36px',
    border: '3px solid rgba(220,38,38,0.15)',
    borderTop: '3px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorState: {
    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: '16px', padding: '2rem', color: '#ef4444', textAlign: 'center',
    fontSize: '0.95rem', fontWeight: '600',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
  },
  statCard: {
    borderRadius: '18px', padding: '1.5rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
    transition: 'all 0.25s ease',
  },
  statIcon: {
    width: '48px', height: '48px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.5rem', flexShrink: 0,
  },
  statLabel: {
    color: '#64748b', fontSize: '0.75rem', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px',
  },
  statValue: {
    fontSize: '2rem', fontWeight: '900', fontFamily: "'Outfit', sans-serif",
    letterSpacing: '-1px', lineHeight: 1,
  },
  chartsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
  },
  chartCard: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px', padding: '1.75rem',
  },
  chartHeader: { marginBottom: '1.5rem' },
  chartTitle: {
    color: '#f1f5f9', fontSize: '1rem', fontWeight: '800',
    margin: '0 0 4px 0', fontFamily: "'Inter', sans-serif",
  },
  chartSub: { color: '#475569', fontSize: '0.78rem', fontWeight: '500', margin: 0 },
  legendItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendName: { color: '#94a3b8', fontSize: '0.78rem', fontWeight: '600' },
  legendVal: { color: '#f1f5f9', fontSize: '0.9rem', fontWeight: '800' },
  infoRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
  },
  infoCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '1.25rem',
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  infoIcon: { fontSize: '1.5rem', flexShrink: 0 },
  infoLabel: { color: '#475569', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
  infoVal: { color: '#e2e8f0', fontSize: '0.88rem', fontWeight: '700', marginTop: '2px', fontFamily: "'Inter', sans-serif" },
};

export default AdminDashboard;
