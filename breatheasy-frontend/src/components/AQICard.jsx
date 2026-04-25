import { useEffect, useState } from 'react';
import { getAQI } from '../api/api';

const getRiskColor = (aqi) => {
    if (aqi <= 50) return '#00d4aa';
    if (aqi <= 100) return '#ffa502';
    if (aqi <= 150) return '#ff6b35';
    return '#ff4757';
};

const getRiskLabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy';
    return 'Hazardous';
};

export default function AQICard({ city }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAQI(city)
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [city]);

    if (loading) return <div style={styles.card}>Loading AQI...</div>;
    if (!data) return null;

    const color = getRiskColor(data.aqi);

    return (
        <div style={styles.card}>
            <p style={styles.label}>AIR QUALITY INDEX</p>
            <div style={{ ...styles.aqiNumber, color }}>{data.aqi}</div>
            <div style={{ ...styles.badge, background: color + '22', color }}>
                {getRiskLabel(data.aqi)}
            </div>
            <div style={styles.pollutants}>
                {[
                    { label: 'PM2.5', val: data.pm25 },
                    { label: 'PM10', val: data.pm10 },
                    { label: 'NO₂', val: data.no2 },
                    { label: 'O₃', val: data.o3 },
                ].map(p => (
                    <div key={p.label} style={styles.pollutant}>
                        <span style={styles.pLabel}>{p.label}</span>
                        <span style={styles.pVal}>{p.val}</span>
                    </div>
                ))}
            </div>
            <p style={styles.city}>📍 {data.city}</p>
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
        gap: 12,
    },
    label: {
        fontSize: 11,
        letterSpacing: 2,
        color: '#8899aa',
        fontFamily: "'Space Mono', monospace",
    },
    aqiNumber: {
        fontSize: 72,
        fontWeight: 700,
        fontFamily: "'Space Mono', monospace",
        lineHeight: 1,
    },
    badge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        width: 'fit-content',
    },
    pollutants: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginTop: 8,
    },
    pollutant: {
        background: '#1a2235',
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pLabel: { fontSize: 12, color: '#8899aa' },
    pVal: { fontSize: 14, fontWeight: 600, fontFamily: "'Space Mono', monospace" },
    city: { fontSize: 12, color: '#8899aa', marginTop: 4 },
};