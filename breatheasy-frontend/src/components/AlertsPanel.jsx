import { useEffect, useState } from 'react';
import { getAlerts } from '../api/api';

export default function AlertsPanel({ userId }) {
    const [alerts, setAlerts] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAlerts(userId)
            .then(res => setAlerts(res.data.alerts))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    const highCount = alerts.filter(a => a.severity === 'high').length;

    return (
        <div style={styles.wrapper}>
            {/* Bell Button */}
            <button style={styles.bell} onClick={() => setOpen(!open)}>
                🔔
                {highCount > 0 && (
                    <span style={styles.badge}>{highCount}</span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div style={styles.panel}>
                    <p style={styles.title}>ALERTS</p>
                    {loading && <p style={styles.empty}>Loading...</p>}
                    {!loading && alerts.length === 0 && (
                        <p style={styles.empty}>No alerts right now.</p>
                    )}
                    {alerts.map((alert, i) => (
                        <div
                            key={i}
                            style={{
                                ...styles.alert,
                                borderColor: alert.severity === 'high'
                                    ? '#ff475744'
                                    : alert.severity === 'medium'
                                        ? '#ffa50244'
                                        : '#00d4aa44',
                                background: alert.severity === 'high'
                                    ? '#ff475711'
                                    : alert.severity === 'medium'
                                        ? '#ffa50211'
                                        : '#00d4aa11',
                            }}
                        >
                            <span style={styles.icon}>{alert.icon}</span>
                            <p style={styles.msg}>{alert.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    wrapper: {
        position: 'relative',
    },
    bell: {
        background: '#1a2235',
        border: '1px solid #1f2f4a',
        borderRadius: 10,
        padding: '8px 14px',
        fontSize: 18,
        cursor: 'pointer',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        background: '#ff4757',
        color: 'white',
        borderRadius: '50%',
        width: 18,
        height: 18,
        fontSize: 11,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    panel: {
        position: 'absolute',
        right: 0,
        top: 48,
        background: '#111827',
        border: '1px solid #1f2f4a',
        borderRadius: 14,
        padding: 16,
        width: 300,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 8px 32px #00000066',
    },
    title: {
        fontSize: 11,
        letterSpacing: 2,
        color: '#8899aa',
        fontFamily: "'Space Mono', monospace",
        marginBottom: 4,
    },
    alert: {
        border: '1px solid',
        borderRadius: 10,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
    },
    icon: { fontSize: 18, flexShrink: 0 },
    msg: { fontSize: 13, color: '#e8edf5', lineHeight: 1.5 },
    empty: { fontSize: 13, color: '#8899aa' },
};