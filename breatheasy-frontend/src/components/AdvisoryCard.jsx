import { useEffect, useState } from 'react';
import { getAdvisory } from '../api/api';

const urgencyStyle = {
    low:      { bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.2)',   color: '#16a34a', badge: '#dcfce7' },
    moderate: { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)',  color: '#d97706', badge: '#fef3c7' },
    high:     { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.2)',   color: '#dc2626', badge: '#fee2e2' },
    critical: { bg: 'rgba(127,29,29,0.09)',   border: 'rgba(239,68,68,0.35)',  color: '#991b1b', badge: '#fca5a5' },
};

export default function AdvisoryCard({ userId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdvisory(userId)
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div className="card-premium" style={styles.loading}>⏳ Loading Health Advisory...</div>;
    if (!data) return null;

    const riskColor = data.color || '#ef4444';
    const rec = data.recommendation || {};
    const urgency = rec.urgency || 'low';
    const us = urgencyStyle[urgency] || urgencyStyle.low;

    return (
        <div style={styles.wrapper}>
            {/* ── Top metrics row ── */}
            <div className="card-premium animate-fade-in" style={{ ...styles.card, borderLeft: `4px solid ${riskColor}` }}>
                <div style={styles.topRow}>
                    <p className="label-caps">Personal Health Advisory</p>
                    <div style={styles.userBadge}>
                        <span>👤</span> {data.username}
                    </div>
                </div>

                {/* Risk badge */}
                <div style={styles.riskSection}>
                    <div style={{ ...styles.riskStatus, background: riskColor + '12', borderColor: riskColor + '30' }}>
                        <div style={{ ...styles.pulseDot, background: riskColor }} />
                        <span style={{ color: riskColor, fontWeight: '800', fontSize: '1.2rem' }}>
                            {data.risk} RISK
                        </span>
                    </div>
                </div>

                {/* Metrics */}
                <div style={styles.metricsGrid}>
                    <Metric label="WES Score"     value={data.wes}        hint="Personalized Intensity" />
                    <Metric label="Exposure Load" value={data.el}         hint="Total Dose Today" />
                    <Metric label="Safe Hours"    value={data.safe_hours} unit="hrs" color="#10b981" hint="Outdoor Budget" />
                    <Metric label="Current AQI"   value={data.aqi}        hint="City Level" />
                </div>

                {/* CES footer */}
                <div style={styles.cesFooter}>
                    <span style={styles.cesLabel}>Cumulative Exposure Score (CES)</span>
                    <span style={styles.cesValue}>{data.ces}</span>
                </div>
            </div>

            {/* ── Generative Recommendation Card ── */}
            {rec.headline && (
                <div style={{ ...styles.recCard, background: us.bg, border: `1px solid ${us.border}` }}>
                    {/* Header */}
                    <div style={styles.recHeader}>
                        <div style={styles.recIconBox}>{rec.icon || '🕐'}</div>
                        <div style={{ flex: 1 }}>
                            <div style={styles.recLabel}>
                                <span style={styles.recLabelText}>RECOMMENDED WINDOW</span>
                                <span style={{ ...styles.urgencyBadge, background: us.badge, color: us.color }}>
                                    {urgency.toUpperCase()}
                                </span>
                            </div>
                            <h3 style={{ ...styles.recHeadline, color: us.color }}>{rec.headline}</h3>
                        </div>
                    </div>

                    {/* Window time */}
                    <div style={styles.windowRow}>
                        <div style={styles.windowPill}>
                            <span style={{ fontWeight: '800', fontSize: '1rem' }}>{rec.window_label}</span>
                            <span style={styles.windowTime}>{rec.window_time}</span>
                            <span style={{ ...styles.windowDay, color: us.color }}>{rec.today_str}</span>
                        </div>
                        <div style={{ ...styles.pm25Pill, borderColor: us.border }}>
                            <span style={styles.pm25Label}>PM2.5</span>
                            <span style={{ ...styles.pm25Val, color: us.color }}>{rec.pm25}</span>
                            <span style={styles.pm25Unit}>µg/m³</span>
                        </div>
                    </div>

                    {/* Reason */}
                    <p style={styles.reason}>{rec.reason}</p>

                    {/* Tips */}
                    {rec.tips && rec.tips.length > 0 && (
                        <div style={styles.tipsSection}>
                            <div style={styles.tipsLabel}>💡 Personalized Action Tips</div>
                            <ul style={styles.tipsList}>
                                {rec.tips.map((tip, i) => (
                                    <li key={i} style={styles.tip}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* ── Legacy CES alert ── */}
            {data.ces_alert && (
                <div style={styles.alertBox}>
                    <span style={styles.alertIcon}>⚠️</span>
                    <p style={styles.alertText}>{data.ces_alert}</p>
                </div>
            )}
        </div>
    );
}

function Metric({ label, value, unit, color, hint }) {
    return (
        <div style={styles.metric}>
            <p style={styles.metricLabel}>{label}</p>
            <div style={styles.metricValRow}>
                <span style={{ ...styles.metricVal, color: color || 'var(--text)' }}>{value}</span>
                {unit && <span style={styles.metricUnit}>{unit}</span>}
            </div>
            <p style={styles.metricHint}>{hint}</p>
        </div>
    );
}

const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    loading: { padding: '2rem', color: '#64748B', textAlign: 'center' },
    card: {
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        background: '#FFFFFF', borderRadius: '20px',
        padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    userBadge: {
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '0.82rem', fontWeight: '700', color: '#0F172A',
        background: '#F1F5F9', border: '1px solid #E2E8F0',
        padding: '5px 12px', borderRadius: '10px',
    },
    riskSection: { textAlign: 'center' },
    riskStatus: {
        display: 'inline-flex', alignItems: 'center', gap: '12px',
        padding: '10px 24px', borderRadius: '14px', border: '1px solid',
    },
    pulseDot: { width: '10px', height: '10px', borderRadius: '50%' },
    metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem' },
    metric: {
        background: '#F8FAFC', borderRadius: '14px',
        padding: '14px', border: '1px solid #E2E8F0',
    },
    metricLabel: { fontSize: '0.68rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' },
    metricValRow: { display: 'flex', alignItems: 'baseline', gap: '4px' },
    metricVal: { fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', fontFamily: "'Outfit', sans-serif" },
    metricUnit: { fontSize: '0.78rem', color: '#94A3B8' },
    metricHint: { fontSize: '0.62rem', color: '#94A3B8', marginTop: '4px' },
    cesFooter: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '1rem', borderTop: '1px solid #E2E8F0',
    },
    cesLabel: { fontSize: '0.78rem', color: '#64748B', fontWeight: '500' },
    cesValue: { fontSize: '1rem', fontWeight: '800', color: '#F59E0B', fontFamily: "'Space Mono', monospace" },

    // Recommendation card
    recCard: { borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    recHeader: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
    recIconBox: {
        width: '46px', height: '46px', borderRadius: '14px',
        background: 'rgba(255,255,255,0.8)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    },
    recLabel: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
    recLabelText: { fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase' },
    urgencyBadge: { fontSize: '0.62rem', fontWeight: '800', padding: '2px 8px', borderRadius: '99px', letterSpacing: '0.05em' },
    recHeadline: { fontSize: '1rem', fontWeight: '800', margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.3 },
    windowRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
    windowPill: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.85)', borderRadius: '12px',
        padding: '10px 16px', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    windowTime: { fontSize: '0.78rem', color: '#64748b', fontWeight: '600' },
    windowDay: { fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' },
    pm25Pill: {
        display: 'flex', alignItems: 'baseline', gap: '4px',
        background: 'rgba(255,255,255,0.85)', borderRadius: '12px',
        padding: '10px 14px', border: '1px solid',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    pm25Label: { fontSize: '0.65rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
    pm25Val: { fontSize: '1.2rem', fontWeight: '900', fontFamily: "'Outfit', sans-serif" },
    pm25Unit: { fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' },
    reason: { fontSize: '0.85rem', color: '#374151', fontWeight: '500', lineHeight: 1.6, margin: 0 },
    tipsSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
    tipsLabel: { fontSize: '0.75rem', fontWeight: '800', color: '#374151' },
    tipsList: { margin: 0, paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' },
    tip: { fontSize: '0.82rem', color: '#4b5563', fontWeight: '500', lineHeight: 1.5 },
    alertBox: {
        background: '#FFFBEB', border: '1px solid #FDE68A',
        borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
    },
    alertIcon: { fontSize: '1.25rem' },
    alertText: { fontSize: '0.82rem', color: '#92400E', fontWeight: '500', lineHeight: 1.5, margin: 0 },
};