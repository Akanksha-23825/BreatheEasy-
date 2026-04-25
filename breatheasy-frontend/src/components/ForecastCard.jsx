import { useEffect, useState } from 'react';
import { getForecast } from '../api/api';

export default function ForecastCard({ city }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        getForecast(city)
            .then(res => setData(res.data))
            .catch(console.error);
    }, [city]);

    if (!data) return null;

    return (
        <div style={styles.card}>
            <p style={styles.label}>FORECAST</p>
            <div style={styles.highlights}>
                <div style={{ ...styles.highlight, borderColor: '#00d4aa44' }}>
                    <p style={styles.hLabel}>BEST DAY</p>
                    <p style={{ color: '#00d4aa', fontWeight: 700 }}>{data.best_day}</p>
                    <p style={styles.hSub}>PM2.5 avg: {data.best_pm25}</p>
                </div>
                <div style={{ ...styles.highlight, borderColor: '#ff475744' }}>
                    <p style={styles.hLabel}>WORST DAY</p>
                    <p style={{ color: '#ff4757', fontWeight: 700 }}>{data.worst_day}</p>
                    <p style={styles.hSub}>PM2.5 avg: {data.worst_pm25}</p>
                </div>
            </div>

            <div style={styles.forecastList}>
                {data.forecast?.slice(0, 5).map(f => (
                    <div key={f.day} style={styles.forecastRow}>
                        <span style={styles.day}>{f.day.slice(5)}</span>
                        <div style={styles.bar}>
                            <div style={{
                                ...styles.barFill,
                                width: `${Math.min((f.pm25_avg / 150) * 100, 100)}%`,
                                background: f.pm25_avg > 100 ? '#ff4757' : f.pm25_avg > 60 ? '#ffa502' : '#00d4aa'
                            }} />
                        </div>
                        <span style={styles.barVal}>{f.pm25_avg}</span>
                    </div>
                ))}
            </div>
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
    highlights: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
    highlight: {
        background: '#1a2235',
        border: '1px solid',
        borderRadius: 10,
        padding: 12,
    },
    hLabel: { fontSize: 10, color: '#8899aa', letterSpacing: 1, marginBottom: 4 },
    hSub: { fontSize: 11, color: '#8899aa', marginTop: 4 },
    forecastList: { display: 'flex', flexDirection: 'column', gap: 8 },
    forecastRow: { display: 'flex', alignItems: 'center', gap: 10 },
    day: { fontSize: 12, color: '#8899aa', width: 40, fontFamily: "'Space Mono'" },
    bar: { flex: 1, background: '#1a2235', borderRadius: 4, height: 8 },
    barFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' },
    barVal: { fontSize: 12, color: '#e8edf5', width: 30, textAlign: 'right', fontFamily: "'Space Mono'" },
};