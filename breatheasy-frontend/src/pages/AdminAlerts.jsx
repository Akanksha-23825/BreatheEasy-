import React, { useState, useEffect } from 'react';
import axios from 'axios';

const severityConfig = {
  high:   { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)',   icon: '🔴' },
  medium: { label: 'Warning',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)',  icon: '🟡' },
  low:    { label: 'Info',     color: '#10b981', bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.18)',  icon: '🟢' },
};

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ title: '', message: '', zone: '', severity: 'medium' });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/alerts');
      setAlerts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post('http://127.0.0.1:5000/api/admin/alerts', newAlert);
      setNewAlert({ title: '', message: '', zone: '', severity: 'medium' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchAlerts();
    } catch { alert('Failed to broadcast alert'); }
    finally { setSending(false); }
  };

  const sev = severityConfig;

  return (
    <div style={styles.layout}>
      {/* Compose Panel */}
      <div style={styles.composePanel}>
        <div style={styles.composeHeader}>
          <div style={styles.composeIcon}>📡</div>
          <div>
            <h3 style={styles.composeTitle}>Broadcast Advisory</h3>
            <p style={styles.composeSub}>Send alerts to all users</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={styles.label}>Alert Title</label>
          <input
            value={newAlert.title}
            onChange={e => setNewAlert({ ...newAlert, title: e.target.value })}
            placeholder="e.g. Asthma Spike Detected"
            style={styles.input}
            required
          />

          <label style={styles.label}>Zone / Region</label>
          <input
            value={newAlert.zone}
            onChange={e => setNewAlert({ ...newAlert, zone: e.target.value })}
            placeholder="e.g. Bengaluru East"
            style={styles.input}
            required
          />

          <label style={styles.label}>Severity</label>
          <select
            value={newAlert.severity}
            onChange={e => setNewAlert({ ...newAlert, severity: e.target.value })}
            style={styles.select}
          >
            <option value="low">🟢  Informational (Low)</option>
            <option value="medium">🟡  Warning (Medium)</option>
            <option value="high">🔴  Critical (High)</option>
          </select>

          <label style={styles.label}>Message</label>
          <textarea
            value={newAlert.message}
            onChange={e => setNewAlert({ ...newAlert, message: e.target.value })}
            rows={4}
            placeholder="Describe the advisory and recommended actions..."
            style={{ ...styles.input, resize: 'vertical', minHeight: '100px' }}
            required
          />

          {success && (
            <div style={styles.successBanner}>
              ✅ Alert broadcasted to all users!
            </div>
          )}

          <button type="submit" style={sending ? { ...styles.broadcastBtn, opacity: 0.6 } : styles.broadcastBtn} disabled={sending}>
            {sending ? '📡 Broadcasting...' : '📡 Broadcast to All Users'}
          </button>
        </form>
      </div>

      {/* Feed */}
      <div style={styles.feedPanel}>
        <h3 style={styles.feedTitle}>📋 Advisory History</h3>
        {loading ? (
          <p style={{ color: '#475569' }}>Loading history...</p>
        ) : alerts.length === 0 ? (
          <p style={{ color: '#334155', fontStyle: 'italic' }}>No advisories broadcasted yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.map(alert => {
              const s = sev[alert.severity] || sev.low;
              return (
                <div key={alert.id} style={{ ...styles.alertCard, background: s.bg, border: `1px solid ${s.border}` }}>
                  <div style={styles.alertTop}>
                    <span style={styles.alertIcon}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={styles.alertTitleRow}>
                        <span style={styles.alertTitle}>{alert.title}</span>
                        <span style={{ ...styles.severityBadge, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                          {s.label}
                        </span>
                      </div>
                      <div style={styles.alertMeta}>
                        📍 {alert.zone} &nbsp;·&nbsp; {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <p style={styles.alertMsg}>{alert.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' },
  composePanel: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px', padding: '1.75rem',
  },
  composeHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' },
  composeIcon: {
    width: '42px', height: '42px', background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
  },
  composeTitle: { color: '#f1f5f9', fontSize: '1rem', fontWeight: '800', margin: 0, fontFamily: "'Inter', sans-serif" },
  composeSub: { color: '#475569', fontSize: '0.75rem', fontWeight: '500', margin: 0 },
  label: { color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '12px', padding: '12px 16px', color: '#f1f5f9', fontSize: '0.875rem',
    outline: 'none', fontFamily: "'Inter', sans-serif", width: '100%', boxSizing: 'border-box',
  },
  select: {
    background: '#0d1117', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '12px', padding: '12px 16px', color: '#f1f5f9', fontSize: '0.875rem',
    outline: 'none', fontFamily: "'Inter', sans-serif", width: '100%', cursor: 'pointer',
  },
  broadcastBtn: {
    background: 'linear-gradient(135deg, #dc2626, #ea580c)',
    border: 'none', borderRadius: '14px', padding: '14px',
    color: '#fff', fontWeight: '800', fontSize: '0.9rem',
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    boxShadow: '0 4px 16px rgba(220,38,38,0.25)', transition: 'all 0.2s ease',
  },
  successBanner: {
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px', padding: '12px', color: '#10b981',
    fontSize: '0.85rem', fontWeight: '600', textAlign: 'center',
  },
  feedPanel: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  feedTitle: { color: '#f1f5f9', fontSize: '1rem', fontWeight: '800', margin: '0 0 0.5rem 0', fontFamily: "'Inter', sans-serif" },
  alertCard: { borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' },
  alertTop: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  alertIcon: { fontSize: '1.25rem', flexShrink: 0 },
  alertTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  alertTitle: { color: '#f1f5f9', fontWeight: '800', fontSize: '0.95rem', fontFamily: "'Inter', sans-serif" },
  severityBadge: { fontSize: '0.68rem', fontWeight: '700', padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  alertMeta: { color: '#475569', fontSize: '0.75rem', fontWeight: '500' },
  alertMsg: { color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 },
};

export default AdminAlerts;
