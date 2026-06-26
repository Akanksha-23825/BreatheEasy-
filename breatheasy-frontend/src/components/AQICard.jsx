import { useEffect, useState } from 'react';
import { getAQI } from '../api/api';

const getRiskColor = (aqi) => {
    if (aqi <= 50) return '#22C55E'; // Good
    if (aqi <= 100) return '#FACC15'; // Moderate
    if (aqi <= 150) return '#FB923C'; // Unhealthy
    if (aqi <= 200) return '#EF4444'; // Very Unhealthy
    return '#7F1D1D'; // Hazardous
};

const getRiskLabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy';
    if (aqi <= 200) return 'Very Unhealthy';
    return 'Hazardous';
};

export default function AQICard({ city }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchAQI = () => {
        getAQI(city)
            .then(res => {
                setData(res.data);
                setLastUpdated(new Date());
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAQI(); // Fetch immediately on mount
        const interval = setInterval(fetchAQI, 5 * 60 * 1000); // Refresh every 5 minutes
        return () => clearInterval(interval); // Cleanup on unmount
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

            {data.stale && (
                <div style={styles.staleBanner}>
                    ⚠ Sensor data delayed ({data.data_age_hours}h old) — WAQI station offline
                </div>
            )}

            <div style={styles.mainContent}>
                <div style={{ ...styles.aqiNumber, color }}>{data.aqi}</div>
                <div style={styles.location}>
                    <span style={styles.pin}>📍</span> {data.station || data.city}
                </div>
                <div style={styles.lastUpdated}>
                    {data.data_time ? `Sensor: ${data.data_time.slice(11, 16)}` : (lastUpdated ? `Fetched ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live')}
                    <button onClick={fetchAQI} style={styles.refreshBtn} title="Refresh AQI">↻</button>
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
        fontSize: '4.5rem',
        fontWeight: '800',
        lineHeight: 1,
        letterSpacing: '-2px',
        fontFamily: "'Outfit', sans-serif",
    },
    location: {
        fontSize: '0.9rem',
        color: 'var(--text-dim)',
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        fontWeight: '600',
    },
    pin: {
        opacity: 0.8,
    },
    pollutants: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
    },
    pollutant: {
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    pLabel: {
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
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
        color: 'var(--text)',
    },
    pUnit: {
        fontSize: '0.65rem',
        color: 'var(--text-dim)',
    },
    lastUpdated: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        marginTop: '6px',
        fontWeight: '500',
    },
    refreshBtn: {
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        transition: 'all 0.2s ease',
        lineHeight: 1,
    },
    staleBanner: {
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '10px',
        padding: '8px 12px',
        fontSize: '0.72rem',
        color: '#f59e0b',
        fontWeight: '600',
        textAlign: 'center',
    },
};