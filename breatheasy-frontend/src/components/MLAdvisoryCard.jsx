import { useEffect, useState } from 'react';
import { getMLAdvisory } from '../api/api';

export default function MLAdvisoryCard({ userId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        getMLAdvisory(userId)
            .then(res => {
                setData(res.data);
                setErrorMsg(null);
            })
            .catch(err => {
                if (err.response && err.response.data && err.response.data.error) {
                    setErrorMsg(err.response.data.error);
                } else {
                    setErrorMsg("Failed to connect to the ML prediction server.");
                }
            })
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) {
        return (
            <div className="card-premium" style={styles.loadingCard}>
                <div style={styles.spinner} />
                <span style={styles.loadingText}>Running PELM Predictive Inference...</span>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="card-premium animate-fade-in" style={styles.errorCard}>
                <div style={styles.errorHeader}>
                    <span style={styles.errorIcon}>🤖</span>
                    <span style={styles.errorTitle}>PELM Predictive Engine Locked</span>
                </div>
                <p style={styles.errorText}>
                    {errorMsg.includes("Insufficient history") 
                        ? "Not enough exposure history to generate predictions. Please log your activities for at least 5 days to unlock personalized ML-based future risk forecasts."
                        : errorMsg}
                </p>
                <div style={styles.errorBadge}>Requires 5+ Exposure Logs</div>
            </div>
        );
    }

    if (!data) return null;

    const isHigh = data.delta_percent > 15;
    const isLow = data.delta_percent < -15;
    
    // Choose status colors based on delta values
    const statusColor = isHigh 
        ? '#EF4444' // Danger
        : isLow 
            ? '#22C55E' // Success
            : '#0F766E'; // Deep teal brand

    const trendIcon = isHigh ? '📈' : isLow ? '📉' : '🔄';
    const trendLabel = isHigh ? 'Elevated Risk Expected' : isLow ? 'Cleaner Conditions Expected' : 'Normal / Stable Exposure';

    return (
        <div className="card-premium animate-fade-in" style={{ ...styles.card, borderLeft: `4px solid ${statusColor}` }}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <span style={styles.aiBadge}>AI PREDICTION</span>
                    <h3 style={styles.title}>PELM Future Risk Forecast</h3>
                </div>
                <div style={{ ...styles.modelBadge, color: statusColor, borderColor: statusColor + '40', background: statusColor + '10' }}>
                    {data.model_used === 'lstm' ? '🧬 LSTM Recurrent Model' : '📊 Linear Regression'}
                </div>
            </div>

            {/* Prediction Analytics */}
            <div style={styles.analyticsSection}>
                <div style={styles.predContainer}>
                    <p style={styles.subLabel}>Predicted Tomorrow's Exposure Load</p>
                    <h2 style={{ ...styles.predValue, color: statusColor }}>{data.predicted_el}</h2>
                    <p style={styles.unitLabel}>EL score units</p>
                </div>

                <div style={styles.dividerCol} />

                <div style={styles.deltaContainer}>
                    <p style={styles.subLabel}>Expected Trend Deviation</p>
                    <div style={styles.trendRow}>
                        <span style={styles.trendIcon}>{trendIcon}</span>
                        <h2 style={{ ...styles.deltaValue, color: statusColor }}>
                            {data.delta_percent > 0 ? `+` : ''}{data.delta_percent}%
                        </h2>
                    </div>
                    <p style={styles.trendText}>{trendLabel}</p>
                </div>
            </div>

            {/* Advisory message box */}
            <div style={{ ...styles.advisoryBox, background: statusColor + '08', border: `1px solid ${statusColor}18` }}>
                <span style={styles.boxIcon}>💡</span>
                <p style={styles.advisoryText}>{data.advisory}</p>
            </div>

            {/* Footnote */}
            <div style={styles.footer}>
                <span>Updated in real-time based on local AQI trends & lifestyle patterns</span>
            </div>
        </div>
    );
}

const styles = {
    loadingCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        gap: '1rem',
        background: 'var(--surface2)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
    },
    spinner: {
        width: '36px',
        height: '36px',
        border: '3px solid rgba(15, 118, 110, 0.1)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        fontSize: '0.9rem',
        color: 'var(--text-dim)',
        fontWeight: '500',
    },
    errorCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.75rem',
        background: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        borderLeft: '4px solid var(--danger)',
    },
    errorHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    errorIcon: {
        fontSize: '1.5rem',
    },
    errorTitle: {
        fontSize: '1.05rem',
        fontWeight: '700',
        color: 'var(--text)',
    },
    errorText: {
        fontSize: '0.85rem',
        color: 'var(--text-dim)',
        lineHeight: '1.5',
        margin: 0,
    },
    errorBadge: {
        alignSelf: 'flex-start',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: 'var(--danger)',
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '4px 10px',
        borderRadius: '8px',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.75rem',
        background: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        transition: 'all 0.3s ease',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
    },
    titleGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    aiBadge: {
        alignSelf: 'flex-start',
        fontSize: '0.65rem',
        fontWeight: '900',
        letterSpacing: '1px',
        color: 'var(--accent2)',
        background: 'rgba(20, 184, 166, 0.1)',
        padding: '2px 8px',
        borderRadius: '6px',
    },
    title: {
        fontSize: '1.2rem',
        fontWeight: '800',
        color: 'var(--text)',
        margin: 0,
    },
    modelBadge: {
        fontSize: '0.75rem',
        fontWeight: '700',
        padding: '4px 12px',
        borderRadius: '10px',
        border: '1px solid',
    },
    analyticsSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '1.25rem',
        gap: '1rem',
    },
    predContainer: {
        flex: 1,
        textAlign: 'center',
    },
    deltaContainer: {
        flex: 1,
        textAlign: 'center',
    },
    subLabel: {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        margin: '0 0 6px 0',
        letterSpacing: '0.5px',
    },
    predValue: {
        fontSize: '2rem',
        fontWeight: '900',
        fontFamily: "'Outfit', sans-serif",
        margin: 0,
    },
    unitLabel: {
        fontSize: '0.65rem',
        color: 'var(--text-dim)',
        margin: '4px 0 0 0',
        fontWeight: '500',
    },
    dividerCol: {
        width: '1px',
        height: '50px',
        background: 'var(--border)',
    },
    trendRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    },
    trendIcon: {
        fontSize: '1.4rem',
    },
    deltaValue: {
        fontSize: '2rem',
        fontWeight: '900',
        fontFamily: "'Outfit', sans-serif",
        margin: 0,
    },
    trendText: {
        fontSize: '0.7rem',
        fontWeight: '600',
        color: 'var(--text-dim)',
        margin: '4px 0 0 0',
    },
    advisoryBox: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        borderRadius: '12px',
        padding: '1rem',
    },
    boxIcon: {
        fontSize: '1.25rem',
        marginTop: '2px',
    },
    advisoryText: {
        fontSize: '0.85rem',
        fontWeight: '500',
        color: 'var(--text)',
        margin: 0,
        lineHeight: '1.5',
    },
    footer: {
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        paddingTop: '0.75rem',
        fontWeight: '500',
    }
};
