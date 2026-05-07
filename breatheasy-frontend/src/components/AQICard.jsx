import { useEffect, useState } from 'react';
import { getAQI } from '../api/api';

const getRiskColor = (aqi) => {
    if (aqi <= 50) return '#10b981'; // emerald
    if (aqi <= 100) return '#f59e0b'; // amber
    if (aqi <= 150) return '#f97316'; // orange
    return '#ef4444'; // red
};

const getRiskLabel = (aqi) => {
    if (aqi <= 50) return 'Healthy';
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

    if (loading) return <div className="card-premium">Loading AQI Data...</div>;
    if (!data) return null;

    const color = getRiskColor(data.aqi);

    return (
        <div className="card-premium animate-fade-in" style={styles.card}>
            <div style={styles.topRow}>
                <p className="label-caps">Air Quality Index</p>
                <div className="badge-premium" style={{ background: color + '15', color, borderColor: color + '30' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                    {getRiskLabel(data.aqi)}
                </div>
            </div>

            <div style={styles.mainContent}>
                <div style={{ ...styles.aqiNumber, color }}>{data.aqi}</div>
                <div style={styles.location}>
                    <span style={styles.pin}>📍</span> {data.city}
                </div>
            </div>

            <div style={styles.pollutants}>
                {[
                    { label: 'PM2.5', val: data.pm25, unit: 'µg/m³' },
                    { label: 'PM10', val: data.pm10, unit: 'µg/m³' },
                    { label: 'NO₂', val: data.no2, unit: 'ppb' },
                    { label: 'O₃', val: data.o3, unit: 'ppb' },
                ].map(p => (
                    <div key={p.label} style={styles.pollutant}>
                        <span style={styles.pLabel}>{p.label}</span>
                        <div style={styles.pValRow}>
                            <span style={styles.pVal}>{p.val || '--'}</span>
                            <span style={styles.pUnit}>{p.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
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
    mainContent: {
        textAlign: 'center',
        padding: '1rem 0',
    },
    aqiNumber: {
        fontSize: '5rem',
        fontWeight: '800',
        lineHeight: 1,
        letterSpacing: '-2px',
        fontFamily: "'Outfit', sans-serif",
    },
    location: {
        fontSize: '0.9rem',
        color: '#94a3b8',
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
    },
    pin: {
        opacity: 0.7,
    },
    pollutants: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
    },
    pollutant: {
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(51, 65, 85, 0.2)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    pLabel: {
        fontSize: '0.7rem',
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    pValRow: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '4px',
    },
    pVal: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#f1f5f9',
    },
    pUnit: {
        fontSize: '0.65rem',
        color: '#64748b',
    },
};