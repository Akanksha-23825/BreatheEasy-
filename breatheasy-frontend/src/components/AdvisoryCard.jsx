import { useEffect, useState } from 'react';
import { getAdvisory } from '../api/api';

export default function AdvisoryCard({ userId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdvisory(userId)
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div className="card-premium">Loading Health Advisory...</div>;
    if (!data) return null;

    const riskColor = data.color || '#ef4444';

    return (
        <div className="card-premium animate-fade-in" style={{ ...styles.card, borderLeft: `4px solid ${riskColor}` }}>
            <div style={styles.topRow}>
                <p className="label-caps">Personal Health Advisory</p>
                <div style={styles.userBadge}>
                    <span style={styles.userIcon}>👤</span>
                    {data.username}
                </div>
            </div>

            <div style={styles.riskSection}>
                <div style={{ ...styles.riskStatus, background: riskColor + '10', borderColor: riskColor + '30' }}>
                    <div style={{...styles.pulseDot, background: riskColor}} />
                    <span style={{ color: riskColor, fontWeight: '800', fontSize: '1.25rem' }}>
                        {data.risk} RISK
                    </span>
                </div>
            </div>

            <div style={styles.metricsGrid}>
                <Metric label="WES Score" value={data.wes} hint="Personalized Intensity" />
                <Metric label="Exposure Load" value={data.el} hint="Total Dose Today" />
                <Metric label="Safe Hours" value={data.safe_hours} unit="hrs" color="#10b981" hint="Outdoor Budget" />
                <Metric label="Current AQI" value={data.aqi} hint="City Level" />
            </div>

            <div style={styles.infoBoxes}>
                <div style={styles.windowBox}>
                    <span style={styles.boxIcon}>⏱️</span>
                    <div>
                        <p className="label-caps" style={{fontSize: '0.6rem'}}>Recommended Window</p>
                        <p style={styles.windowVal}>{data.safest_window}</p>
                    </div>
                </div>

                {data.ces_alert && (
                    <div style={styles.alertBox}>
                        <span style={styles.boxIcon}>⚠️</span>
                        <p style={styles.alertText}>{data.ces_alert}</p>
                    </div>
                )}
            </div>

            <div style={styles.cesFooter}>
                <span style={styles.cesLabel}>Cumulative Exposure Score (CES)</span>
                <span style={styles.cesValue}>{data.ces}</span>
            </div>
        </div>
    );
}

function Metric({ label, value, unit, color, hint }) {
    return (
        <div style={styles.metric}>
            <p style={styles.metricLabel}>{label}</p>
            <div style={styles.metricValRow}>
                <span style={{ ...styles.metricVal, color: color || '#f1f5f9' }}>{value}</span>
                {unit && <span style={styles.metricUnit}>{unit}</span>}
            </div>
            <p style={styles.metricHint}>{hint}</p>
        </div>
    );
}

const styles = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#f8fafc',
        background: 'rgba(30, 41, 59, 0.5)',
        padding: '4px 12px',
        borderRadius: '10px',
    },
    riskSection: {
        textAlign: 'center',
    },
    riskStatus: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        borderRadius: '16px',
        border: '1px solid',
    },
    pulseDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        boxShadow: '0 0 10px currentColor',
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
    },
    metric: {
        background: 'rgba(30, 41, 59, 0.3)',
        borderRadius: '14px',
        padding: '16px',
        border: '1px solid rgba(51, 65, 85, 0.1)',
    },
    metricLabel: {
        fontSize: '0.7rem',
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: '4px',
    },
    metricValRow: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '4px',
    },
    metricVal: {
        fontSize: '1.5rem',
        fontWeight: '800',
        fontFamily: "'Outfit', sans-serif",
    },
    metricUnit: {
        fontSize: '0.8rem',
        color: '#64748b',
    },
    metricHint: {
        fontSize: '0.6rem',
        color: '#475569',
        marginTop: '4px',
    },
    infoBoxes: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    windowBox: {
        background: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        borderRadius: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    alertBox: {
        background: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.1)',
        borderRadius: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    boxIcon: {
        fontSize: '1.5rem',
    },
    windowVal: {
        fontSize: '0.95rem',
        fontWeight: '700',
        color: '#10b981',
    },
    alertText: {
        fontSize: '0.8rem',
        color: '#f59e0b',
        fontWeight: '500',
        lineHeight: '1.4',
    },
    cesFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(51, 65, 85, 0.2)',
    },
    cesLabel: {
        fontSize: '0.8rem',
        color: '#94a3b8',
    },
    cesValue: {
        fontSize: '1rem',
        fontWeight: '800',
        color: '#f59e0b',
        fontFamily: "'Space Mono', monospace",
    },
};