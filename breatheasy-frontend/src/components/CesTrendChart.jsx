import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
        <div style={styles.card}>
            <p style={styles.label}>7-DAY EXPOSURE TREND</p>
            {alert && <div style={styles.alert}>⚠️ {alert}</div>}
            {data.length === 0 ? (
                <p style={{ color: '#8899aa', fontSize: 13 }}>
                    Not enough data yet. Come back tomorrow!
                </p>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#8899aa', fontSize: 11 }}
                            tickFormatter={d => d.slice(5)}
                        />
                        <YAxis tick={{ fill: '#8899aa', fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{
                                background: '#1a2235',
                                border: '1px solid #1f2f4a',
                                borderRadius: 8,
                                color: '#e8edf5',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="el"
                            stroke="#0099ff"
                            strokeWidth={2}
                            dot={{ fill: '#0099ff' }}
                            name="Exposure Load"
                        />
                        <Line
                            type="monotone"
                            dataKey="ces"
                            stroke="#ffa502"
                            strokeWidth={2}
                            dot={{ fill: '#ffa502' }}
                            name="CES"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
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
    alert: {
        background: '#ffa50222',
        border: '1px solid #ffa50244',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
        color: '#ffa502',
    },
};