import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAQI } from '../api/api';
import AQIHeatmap from '../components/AQIHeatmap';

const CONDITIONS = [
    { key: 'healthy', label: 'Healthy', vf: 1.0, color: '#22C55E' },
    { key: 'asthma', label: 'Asthma', vf: 1.5, color: '#F59E0B' },
    { key: 'heart', label: 'Heart Disease', vf: 1.4, color: '#EF4444' },
    { key: 'pregnant', label: 'Pregnancy', vf: 1.3, color: '#0EA5E9' },
    { key: 'elderly', label: 'Elderly', vf: 1.6, color: '#0F766E' },
];

const SENSITIVITY = {
    healthy: { pm25: 1.0, pm10: 1.0, no2: 1.0, o3: 1.0 },
    asthma: { pm25: 1.3, pm10: 1.1, no2: 1.4, o3: 1.2 },
    heart: { pm25: 1.4, pm10: 1.1, no2: 1.2, o3: 1.1 },
    pregnant: { pm25: 1.3, pm10: 1.0, no2: 1.1, o3: 1.2 },
    elderly: { pm25: 1.3, pm10: 1.2, no2: 1.2, o3: 1.3 },
};

// Updated to match Backend calibration
const DEC = { healthy: 500, asthma: 250, heart: 280, pregnant: 320, elderly: 300 };

/**
 * Realistic WES Calculation (Matches Backend)
 * Formula: Max(Weighted Pollutant) + 0.1 * Sum(Other Weighted Pollutants)
 */
function calcWES(pm25, pm10, no2, o3, condition, vf) {
    const w = SENSITIVITY[condition];
    const components = [
        (pm25 || 0) * w.pm25 * vf,
        (pm10 || 0) * w.pm10 * vf,
        (no2 || 0) * w.no2 * vf,
        (o3 || 0) * w.o3 * vf
    ];
    const maxVal = Math.max(...components);
    const sumOthers = components.reduce((a, b) => a + b, 0) - maxVal;
    const finalWes = maxVal + (0.1 * sumOthers);
    return Math.round(finalWes * 100) / 100;
}

function calcEL(wes, hours) { return Math.round(wes * hours * 100) / 100; }
function calcSafe(condition, aqi) { 
    // Simplified safe hours calculation for simulator
    return Math.max(Math.round((DEC[condition] / Math.max(aqi, 20)) * 10) / 10, 0.5); 
}

function getRisk(el) {
    if (el <= 250) return { label: 'Low', color: '#22C55E' };
    if (el <= 500) return { label: 'Moderate', color: '#F59E0B' };
    return { label: 'High', color: '#EF4444' };
}

export default function Tools() {
    const navigate = useNavigate();
    const city = localStorage.getItem('city') || 'Bengaluru';
    const [aqi, setAqi] = useState(null);
    const [pollutants, setPollutants] = useState(null);
    const [hours, setHours] = useState(2);
    const [activeTab, setActiveTab] = useState('compare');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        getAQI(city).then(res => {
            setAqi(res.data.aqi);
            setPollutants(res.data);
        }).catch(console.error);
    }, [city]);

    return (
        <div className="user-theme-container" style={styles.container}>
            <div style={{...styles.page, opacity: isMounted ? 1 : 0}}>

                {/* ── Header ── */}
                <div style={styles.header}>
                    <div style={styles.brand}>
                        <div style={styles.logoBadge}>BE+</div>
                        <div>
                            <h1 style={styles.logo}>
                                BreatheEasy<span style={{ color: 'var(--accent2)' }}>+</span>
                            </h1>
                            <p style={styles.tagline}>Advanced Research & Simulation</p>
                        </div>
                    </div>
                    <button className="btn-premium" onClick={() => navigate('/dashboard')}>
                        ← Back to Dashboard
                    </button>
                </div>

                {/* ── Tab Toggle ── */}
                <div style={styles.tabsContainer}>
                    {[
                        { id: 'compare', label: 'Health Comparison', icon: '👥' },
                        { id: 'simulate', label: 'Exposure Simulator', icon: '🎛️' },
                        { id: 'heatmap', label: 'AQI Heatmap', icon: '🗺️' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            style={{ 
                                ...styles.tab, 
                                ...(activeTab === tab.id ? styles.tabActive : {}) 
                            }}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span style={{marginRight: '8px'}}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── TAB 1: HEALTH COMPARISON ── */}
                {activeTab === 'compare' && (
                    <div className="animate-fade-in">
                        <div className="card-premium" style={styles.infoCard}>
                            <p className="label-caps">Environment — {city}</p>
                            <div style={styles.pillContainer}>
                                <div style={styles.metricPill}>AQI <span style={{color: '#f59e0b'}}>{aqi ?? '--'}</span></div>
                                <div style={styles.metricPill}>PM2.5 <span>{pollutants?.pm25 ?? '--'}</span></div>
                                <div style={styles.metricPill}>NO₂ <span>{pollutants?.no2 ?? '--'}</span></div>
                                <div style={styles.metricPill}>O₃ <span>{pollutants?.o3 ?? '--'}</span></div>
                            </div>
                            <p style={styles.infoText}>
                                Same air, different risks. This tool shows how your specific condition changes the "biological intensity" of the current air.
                            </p>
                        </div>

                        {/* Comparison Table */}
                        <div className="card-premium">
                            <p className="label-caps">Biological Impact Matrix</p>
                            <div style={styles.tableWrap}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {['Health Condition', 'Vulnerability', 'WES (Intensity)', 'Safe Window', 'Status'].map(h => (
                                                <th key={h} style={styles.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {CONDITIONS.map(c => {
                                            if (!pollutants) return null;
                                            const wes = calcWES(pollutants.pm25, pollutants.pm10, pollutants.no2, pollutants.o3, c.key, c.vf);
                                            const el = calcEL(wes, 1); // 1 hour baseline
                                            const safe = calcSafe(c.key, aqi);
                                            const risk = getRisk(el);
                                            return (
                                                <tr key={c.key} style={styles.tr}>
                                                    <td style={{ ...styles.td, color: c.color, fontWeight: 700 }}>{c.label}</td>
                                                    <td style={styles.td}>
                                                        <div className="badge-premium" style={{background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem'}}>
                                                            x{c.vf.toFixed(1)} Factor
                                                        </div>
                                                    </td>
                                                    <td style={{ ...styles.td, fontFamily: "'Space Mono'", fontSize: '1rem' }}>{wes}</td>
                                                    <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>{safe} hrs/day</td>
                                                    <td style={styles.td}>
                                                        <span className="badge-premium" style={{
                                                            background: risk.color + '15',
                                                            color: risk.color,
                                                            borderColor: risk.color + '30',
                                                        }}>
                                                            {risk.label} Risk
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Visual Bar Comparison */}
                        <div className="card-premium" style={{marginTop: '2rem'}}>
                            <p className="label-caps">WES Score Distribution</p>
                            <div style={styles.barList}>
                                {CONDITIONS.map(c => {
                                    if (!pollutants) return null;
                                    const wes = calcWES(pollutants.pm25, pollutants.pm10, pollutants.no2, pollutants.o3, c.key, c.vf);
                                    const maxWes = calcWES(pollutants.pm25, pollutants.pm10, pollutants.no2, pollutants.o3, 'elderly', 1.6);
                                    return (
                                        <div key={c.key} style={styles.barItem}>
                                            <div style={styles.barMeta}>
                                                <span style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 600 }}>{c.label}</span>
                                                <span style={{ fontSize: '0.85rem', fontFamily: "'Space Mono'", color: c.color }}>{wes} WES</span>
                                            </div>
                                            <div style={styles.barTrack}>
                                                <div style={{
                                                    width: `${(wes / maxWes) * 100}%`,
                                                    height: '100%',
                                                    background: c.color,
                                                    borderRadius: '6px',
                                                    boxShadow: `0 0 12px ${c.color}40`,
                                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: EXPOSURE SIMULATOR ── */}
                {activeTab === 'simulate' && (
                    <div className="animate-fade-in">
                        <div className="card-premium" style={styles.simulatorCard}>
                            <div style={styles.simHeader}>
                                <div>
                                    <p className="label-caps">Exposure Simulator</p>
                                    <p style={styles.simSub}>Adjust duration to see the cumulative biological impact.</p>
                                </div>
                                <div style={styles.hourDisplay}>
                                    <span style={styles.hourNum}>{hours}</span>
                                    <span style={styles.hourUnit}>HOURS</span>
                                </div>
                            </div>

                            {/* Slider */}
                            <div style={styles.sliderContainer}>
                                <input
                                    type="range"
                                    min="0.5" max="12" step="0.5"
                                    value={hours}
                                    onChange={e => setHours(parseFloat(e.target.value))}
                                    style={styles.rangeInput}
                                />
                                <div style={styles.sliderLabels}>
                                    <span>Short Walk</span>
                                    <span>Standard Day</span>
                                    <span>Extended Outing</span>
                                </div>
                            </div>

                            {/* Simulation Results Grid */}
                            <div style={styles.simGrid}>
                                {CONDITIONS.map(c => {
                                    if (!pollutants) return null;
                                    const wes = calcWES(pollutants.pm25, pollutants.pm10, pollutants.no2, pollutants.o3, c.key, c.vf);
                                    const el = calcEL(wes, hours);
                                    const safe = calcSafe(c.key, aqi);
                                    const risk = getRisk(el);
                                    const overLimit = hours > safe;
                                    return (
                                        <div key={c.key} style={{
                                            ...styles.simCard,
                                            borderColor: overLimit ? 'rgba(239, 68, 68, 0.3)' : 'rgba(51, 65, 85, 0.2)',
                                            background: overLimit ? 'rgba(239, 68, 68, 0.05)' : 'rgba(30, 41, 59, 0.3)',
                                        }}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <p style={{ color: c.color, fontWeight: 700, fontSize: '0.9rem' }}>{c.label}</p>
                                                <div style={{width: 8, height: 8, borderRadius: '50%', background: risk.color}} />
                                            </div>

                                            <div style={{margin: '1rem 0'}}>
                                                <p style={styles.simMetricLabel}>Total Exposure Load (EL)</p>
                                                <p style={{ ...styles.simMetricVal, color: risk.color }}>{el}</p>
                                            </div>

                                            <div style={styles.simFooter}>
                                                <div style={styles.miniMetric}>
                                                    <span>Risk</span>
                                                    <b style={{color: risk.color}}>{risk.label}</b>
                                                </div>
                                                <div style={styles.miniMetric}>
                                                    <span>Limit</span>
                                                    <b style={{color: '#10b981'}}>{safe}h</b>
                                                </div>
                                            </div>

                                            {overLimit && (
                                                <div style={styles.warningBox}>
                                                    ⚠️ Exceeds limit by {(hours - safe).toFixed(1)}h
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: AQI HEATMAP ── */}
                {activeTab === 'heatmap' && (
                    <div className="animate-fade-in card-premium" style={{padding: 0, overflow: 'hidden'}}>
                        <AQIHeatmap city={city} />
                    </div>
                )}

                {/* Footer */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>BreatheEasy+ Scientific Research Module • Precision Health AI</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        overflowX: 'hidden',
    },
    page: {
        position: 'relative',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        transition: 'opacity 0.8s ease-out',
        zIndex: 1,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    logoBadge: {
        width: '40px',
        height: '40px',
        background: 'var(--accent)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: '900',
        color: '#FFFFFF',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: '800',
        margin: 0,
    },
    tagline: {
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        margin: 0,
    },
    tabsContainer: {
        display: 'flex',
        padding: '6px',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        marginBottom: '2.5rem',
        gap: '6px',
    },
    tab: {
        flex: 1,
        padding: '12px',
        borderRadius: '12px',
        border: 'none',
        background: 'transparent',
        color: 'var(--text-dim)',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabActive: {
        background: 'var(--surface)',
        color: 'var(--text)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border)',
    },
    infoCard: {
        marginBottom: '2rem',
    },
    pillContainer: {
        display: 'flex',
        gap: '1rem',
        margin: '1.5rem 0',
        flexWrap: 'wrap',
    },
    metricPill: {
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '8px 16px',
        fontSize: '0.85rem',
        color: 'var(--text-dim)',
        display: 'flex',
        gap: '8px',
        fontWeight: '600',
    },
    infoText: {
        fontSize: '0.9rem',
        color: 'var(--text-dim)',
        lineHeight: '1.6',
    },
    tableWrap: {
        marginTop: '1rem',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '12px 16px',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        letterSpacing: '1px',
        borderBottom: '1px solid var(--border)',
    },
    td: {
        padding: '16px',
        fontSize: '0.9rem',
        color: 'var(--text)',
        borderBottom: '1px solid var(--border)',
    },
    tr: {
        transition: 'background 0.2s ease',
    },
    barList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    barItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    barMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    barTrack: {
        height: '8px',
        background: 'var(--border)',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    simulatorCard: {
        padding: '2.5rem',
    },
    simHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
    },
    simSub: {
        fontSize: '0.9rem',
        color: 'var(--text-dim)',
        marginTop: '0.5rem',
    },
    hourDisplay: {
        textAlign: 'right',
    },
    hourNum: {
        fontSize: '3rem',
        fontWeight: '800',
        color: 'var(--accent)',
        fontFamily: "'Outfit', sans-serif",
        lineHeight: 1,
    },
    hourUnit: {
        display: 'block',
        fontSize: '0.7rem',
        fontWeight: '700',
        color: 'var(--text-dim)',
        letterSpacing: '2px',
    },
    sliderContainer: {
        marginBottom: '3rem',
    },
    rangeInput: {
        width: '100%',
        height: '6px',
        background: 'var(--border)',
        borderRadius: '10px',
        outline: 'none',
        WebkitAppearance: 'none',
        accentColor: 'var(--accent)',
    },
    sliderLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        marginTop: '10px',
        fontWeight: '600',
    },
    simGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
    },
    simCard: {
        border: '1px solid',
        borderRadius: '16px',
        padding: '1.5rem',
        transition: 'all 0.3s ease',
    },
    simMetricLabel: {
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    simMetricVal: {
        fontSize: '1.75rem',
        fontWeight: '800',
        fontFamily: "'Space Mono', monospace",
    },
    simFooter: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border)',
    },
    miniMetric: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
    },
    warningBox: {
        marginTop: '1rem',
        background: 'rgba(239, 68, 68, 0.08)',
        padding: '8px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: '#EF4444',
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        marginTop: '4rem',
        textAlign: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border)',
    },
    footerText: {
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        fontFamily: "var(--font-body)",
        letterSpacing: '0.5px',
    }
};