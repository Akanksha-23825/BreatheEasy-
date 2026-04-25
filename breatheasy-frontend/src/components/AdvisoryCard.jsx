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

    if (loading) return <div style={styles.card}>Loading advisory...</div>;
    if (!data) return null;

    const riskColor = data.color || '#ff4757';

    return (
        <div style={{ ...styles.card, borderColor: riskColor + '44' }}>
            <p style={styles.label}>PERSONAL ADVISORY</p>
            <p style={styles.username}>👤 {data.username}</p>

            {/* Risk Badge */}
            <div style={{ ...styles.riskBadge, background: riskColor + '22', borderColor: riskColor }}>
                <span style={{ color: riskColor, fontSize: 20, fontWeight: 700 }}>
                    {data.risk} RISK
                </span>
            </div>

            {/* Metrics Grid */}
            <div style={styles.grid}>
                <Metric label="WES Score" value={data.wes} unit="" />
                <Metric label="Exposure Load" value={data.el} unit="" />
                <Metric label="Safe Hours" value={data.safe_hours} unit="hrs" color="#00d4aa" />
                <Metric label="AQI" value={data.aqi} unit="" />
            </div>

            {/* Safest Window */}
            <div style={styles.windowBox}>
                <span style={styles.windowIcon}>🕐</span>
                <div>
                    <p style={styles.windowLabel}>SAFEST WINDOW</p>
                    <p style={styles.windowVal}>{data.safest_window}</p>
                </div>
            </div>

            {/* CES Alert */}
            {data.ces_alert && (
                <div style={styles.alert}>
                    ⚠️ {data.ces_alert}
                </div>
            )}

            {/* CES */}
            <div style={styles.cesRow}>
                <span style={{ color: '#8899aa', fontSize: 13 }}>Cumulative Exposure Score</span>
                <span style={{ fontFamily: "'Space Mono'", fontWeight: 700, color: '#ffa502' }}>
                    {data.ces}
                </span>
            </div>
        </div>
    );
}

function Metric({ label, value, unit, color }) {
    return (
        <div style={styles.metric}>
            <p style={styles.metricLabel}>{label}</p>
            <p style={{ ...styles.metricVal, color: color || '#e8edf5' }}>
                {value}{unit}
            </p>
        </div>
    );
}

const styles = {
    card: {
        background: '#111827',
        border: '1px solid #1f2f4a',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
    },
    label: {
        fontSize: 11,
        letterSpacing: 2,
        color: '#8899aa',
        fontFamily: "'Space Mono', monospace",
    },
    username: { fontSize: 15, fontWeight: 600 },
    riskBadge: {
        border: '1px solid',
        borderRadius: 10,
        padding: '10px 16px',
        textAlign: 'center',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
    },
    metric: {
        background: '#1a2235',
        borderRadius: 8,
        padding: '10px 14px',
    },
    metricLabel: { fontSize: 11, color: '#8899aa', marginBottom: 4 },
    metricVal: { fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace" },
    windowBox: {
        background: '#1a2235',
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    windowIcon: { fontSize: 24 },
    windowLabel: { fontSize: 10, color: '#8899aa', letterSpacing: 1 },
    windowVal: { fontSize: 15, fontWeight: 600, color: '#00d4aa' },
    alert: {
        background: '#ffa50222',
        border: '1px solid #ffa50244',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        color: '#ffa502',
    },
    cesRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #1f2f4a',
        paddingTop: 12,
    },
};