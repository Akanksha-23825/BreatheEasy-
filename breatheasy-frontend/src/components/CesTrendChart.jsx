import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getTrend } from '../api/api';

export default function CesTrendChart({ userId }) {
    const [data, setData] = useState([]);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        getTrend(userId)
            .then(res => {
                setData(res.data.weekly_trend);
                setAlert(res.data.ces_alert);
            })
            .catch(console.error);
    }, [userId]);

    return (
        <div className="card-premium animate-fade-in" style={styles.card}>
            <div style={styles.header}>
                <p className="label-caps">7-Day Exposure Trend</p>
                {alert && <div style={styles.miniAlert}>⚠️ Trend Alert</div>}
            </div>

            {data.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Collecting data for your baseline... Check back in 24h.
                    </p>
                </div>
            ) : (
                <div style={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15, 23, 42, 0.06)" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 500 }}
                                tickFormatter={d => {
                                    const date = new Date(d);
                                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                                }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 500 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                                    color: 'var(--text)',
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}
                                labelStyle={{ color: 'var(--text-dim)', marginBottom: '4px', fontSize: '10px', fontWeight: '600' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="el"
                                stroke="#14B8A6"
                                strokeWidth={3}
                                dot={{ fill: '#14B8A6', strokeWidth: 2, r: 4, stroke: '#FFFFFF' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Daily Load"
                            />
                            <Line
                                type="monotone"
                                dataKey="ces"
                                stroke="#0F766E"
                                strokeWidth={3}
                                dot={{ fill: '#0F766E', strokeWidth: 2, r: 4, stroke: '#FFFFFF' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Cumulative (CES)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

const styles = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    miniAlert: {
        fontSize: '0.7rem',
        fontWeight: '700',
        color: '#F59E0B',
        background: 'rgba(245, 158, 11, 0.12)',
        padding: '2px 8px',
        borderRadius: '6px',
    },
    emptyState: {
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface2)',
        borderRadius: '16px',
        border: '1px dashed var(--border)',
    },
    chartWrapper: {
        paddingTop: '1rem',
    },
};