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
        <div className="card-premium animate-fade-in" style={styles.card}>
            <p className="label-caps">Weekly Forecast</p>
            
            <div style={styles.highlights}>
                <div style={{ ...styles.highlight, borderLeft: '3px solid #22C55E' }}>
                    <p style={styles.hLabel}>Best Day</p>
                    <p style={{ color: '#22C55E', fontWeight: 800, fontSize: '1.1rem' }}>{data.best_day}</p>
                    <p style={styles.hSub}>{data.best_pm25} µg PM2.5</p>
                </div>
                <div style={{ ...styles.highlight, borderLeft: '3px solid #EF4444' }}>
                    <p style={styles.hLabel}>Worst Day</p>
                    <p style={{ color: '#EF4444', fontWeight: 800, fontSize: '1.1rem' }}>{data.worst_day}</p>
                    <p style={styles.hSub}>{data.worst_pm25} µg PM2.5</p>
                </div>
            </div>

            <div style={styles.forecastList}>
                {data.forecast?.slice(0, 5).map(f => (
                    <div key={f.day} style={styles.forecastRow}>
                        <span style={styles.day}>
                            {new Date(f.day).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <div style={styles.bar}>
                            <div style={{
                                ...styles.barFill,
                                width: `${Math.min((f.pm25_avg / 150) * 100, 100)}%`,
                                background: f.pm25_avg > 100 ? '#EF4444' : f.pm25_avg > 60 ? '#FACC15' : '#22C55E'
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
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    highlights: { 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem' 
    },
    highlight: {
        background: 'var(--surface2)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    hLabel: { 
        fontSize: '0.65rem', 
        color: 'var(--text-dim)', 
        textTransform: 'uppercase', 
        fontWeight: '700' 
    },
    hSub: { 
        fontSize: '0.75rem', 
        color: 'var(--text-dim)', 
        fontFamily: "var(--font-body)" 
    },
    forecastList: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        marginTop: '0.5rem'
    },
    forecastRow: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem' 
    },
    day: { 
        fontSize: '0.75rem', 
        color: 'var(--text-dim)', 
        width: '40px', 
        fontWeight: '600' 
    },
    bar: { 
        flex: 1, 
        background: 'var(--border)', 
        borderRadius: '100px', 
        height: '6px',
        overflow: 'hidden'
    },
    barFill: { 
        height: '100%', 
        borderRadius: '100px', 
        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
    },
    barVal: { 
        fontSize: '0.85rem', 
        color: 'var(--text)', 
        width: '30px', 
        textAlign: 'right', 
        fontWeight: '700',
        fontFamily: "'Space Mono', monospace" 
    },
};