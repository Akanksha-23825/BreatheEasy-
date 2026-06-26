import { useEffect, useState } from 'react';
import { getAdvisory } from '../api/api';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function HealthOverview({ userId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdvisory(userId)
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div className="card-premium">Loading Health Overview...</div>;
    if (!data) return null;

    // Use weekly trend to render a sparkline
    const sparkData = (data.weekly_trend || []).map(t => ({ el: t.el }));

    return (
        <div className="card-premium animate-fade-in" style={styles.card}>
            <div style={styles.headerRow}>
                <h3 style={styles.title}>Health Overview</h3>
                <span style={styles.link}>View Details →</span>
            </div>

            <div style={styles.metricsGrid}>
                {/* WES Score */}
                <div style={styles.metricItem}>
                    <div style={{ ...styles.iconWrapper, background: '#E6F5F4', color: '#0F766E' }}>🏃</div>
                    <div>
                        <div style={styles.metricLabel}>WES Score</div>
                        <div style={styles.metricVal}>{data.wes}</div>
                        <div style={styles.metricSub}>Personalized Intensity</div>
                    </div>
                </div>

                {/* Exposure Load */}
                <div style={styles.metricItem}>
                    <div style={{ ...styles.iconWrapper, background: '#F5F3FF', color: '#8B5CF6' }}>🛡️</div>
                    <div>
                        <div style={styles.metricLabel}>Exposure Load</div>
                        <div style={styles.metricVal}>{data.el}</div>
                        <div style={styles.metricSub}>Total Dose Today</div>
                    </div>
                </div>

                {/* Safe Hours */}
                <div style={styles.metricItem}>
                    <div style={{ ...styles.iconWrapper, background: '#F0FDF4', color: '#22C55E' }}>🕒</div>
                    <div>
                        <div style={styles.metricLabel}>Safe Hours</div>
                        <div style={styles.metricVal}>{data.safe_hours} hrs</div>
                        <div style={styles.metricSub}>Outdoor Budget</div>
                    </div>
                </div>

                {/* Current AQI */}
                <div style={styles.metricItem}>
                    <div style={{ ...styles.iconWrapper, background: '#EFF6FF', color: '#3B82F6' }}>🛡️</div>
                    <div>
                        <div style={styles.metricLabel}>Current AQI</div>
                        <div style={styles.metricVal}>{data.aqi}</div>
                        <div style={styles.metricSub}>City Level</div>
                    </div>
                </div>
            </div>

            <div style={styles.cesFooter}>
                <div>
                    <div style={styles.cesLabel}>Cumulative Exposure Score (CES)</div>
                    <div style={styles.cesValRow}>
                        <span style={styles.cesValue}>{data.ces}</span>
                        <span style={styles.trendPill}>▲ 0.7% vs yesterday</span>
                    </div>
                </div>
                {sparkData.length > 0 && (
                    <div style={styles.sparklineWrapper}>
                        <ResponsiveContainer width={120} height={40}>
                            <LineChart data={sparkData}>
                                <Line type="monotone" dataKey="el" stroke="#14B8A6" strokeWidth={2.5} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '20px',
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '1.05rem',
        fontWeight: '800',
        color: '#0F172A',
        margin: 0,
    },
    link: {
        fontSize: '0.78rem',
        fontWeight: '700',
        color: '#0F766E',
        cursor: 'pointer',
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
    },
    metricItem: {
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    iconWrapper: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.95rem',
        flexShrink: 0,
    },
    metricLabel: {
        fontSize: '0.68rem',
        color: '#64748B',
        fontWeight: '600',
    },
    metricVal: {
        fontSize: '1rem',
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: '1.2',
    },
    metricSub: {
        fontSize: '0.58rem',
        color: '#94A3B8',
        fontWeight: '500',
    },
    cesFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #E2E8F0',
    },
    cesLabel: {
        fontSize: '0.7rem',
        color: '#64748B',
        fontWeight: '600',
    },
    cesValRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '2px',
    },
    cesValue: {
        fontSize: '1.15rem',
        fontWeight: '800',
        color: '#0F766E',
    },
    trendPill: {
        fontSize: '0.65rem',
        fontWeight: '700',
        color: '#22C55E',
        background: '#E6F4EA',
        padding: '2px 6px',
        borderRadius: '6px',
    },
    sparklineWrapper: {
        width: '120px',
        height: '40px',
    },
};
