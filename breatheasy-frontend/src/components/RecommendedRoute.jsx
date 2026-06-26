export default function RecommendedRoute({ navigate }) {
    return (
        <div className="card-premium animate-fade-in" style={styles.card}>
            <div style={styles.headerRow}>
                <h3 style={styles.title}>Recommended Route</h3>
                <span style={styles.badge}>
                    <span style={styles.dot} /> Safest
                </span>
            </div>

            <div style={styles.routeFlow}>
                <div style={styles.locationGroup}>
                    <span style={styles.markerGreen}>📍</span>
                    <div>
                        <div style={styles.locLabel}>From</div>
                        <div style={styles.locName}>Koramangala</div>
                    </div>
                </div>

                <div style={styles.routeLineDot}>• • • • •</div>

                <div style={styles.locationGroup}>
                    <span style={styles.markerRed}>📍</span>
                    <div>
                        <div style={styles.locLabel}>To</div>
                        <div style={styles.locName}>MG Road</div>
                    </div>
                </div>
            </div>

            <div style={styles.metricsRow}>
                <div style={styles.metric}>
                    <div style={styles.mLabel}>Distance</div>
                    <div style={styles.mVal}>8.6 km</div>
                </div>
                <div style={styles.metric}>
                    <div style={styles.mLabel}>Time</div>
                    <div style={styles.mVal}>24 min</div>
                </div>
                <div style={styles.metric}>
                    <div style={styles.mLabel}>Route AQI</div>
                    <div style={{ ...styles.mVal, color: '#22C55E' }}>82 Good</div>
                </div>
            </div>

            {/* SVG Map Trace */}
            <div style={styles.mapContainer}>
                <svg viewBox="0 0 280 90" style={{ width: '100%', height: '100%', display: 'block' }}>
                    {/* Background grid representation */}
                    <path d="M 0,10 L 280,10 M 0,35 L 280,35 M 0,60 L 280,60 M 0,85 L 280,85" stroke="#F1F5F9" strokeWidth="1" />
                    <path d="M 40,0 L 40,90 M 110,0 L 110,90 M 180,0 L 180,90 M 250,0 L 250,90" stroke="#F1F5F9" strokeWidth="1" />

                    {/* Map Route line */}
                    <path
                        d="M 40,75 C 90,75 70,25 140,25 C 190,25 180,65 240,30"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />

                    {/* Start dot */}
                    <circle cx="40" cy="75" r="7" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2" />
                    {/* End dot */}
                    <circle cx="240" cy="30" r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
            </div>

            <div style={styles.footerRow} onClick={() => navigate('/tools')}>
                <span>View Alternative Routes →</span>
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
    badge: {
        background: '#E6F4EA',
        color: '#22C55E',
        fontSize: '0.72rem',
        fontWeight: '700',
        padding: '3px 8px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    dot: {
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: '#22C55E',
    },
    routeFlow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '8px 12px',
    },
    locationGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    markerGreen: {
        fontSize: '1rem',
        color: '#22C55E',
    },
    markerRed: {
        fontSize: '1rem',
        color: '#EF4444',
    },
    locLabel: {
        fontSize: '0.62rem',
        color: '#94A3B8',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    locName: {
        fontSize: '0.82rem',
        color: '#0F172A',
        fontWeight: '700',
    },
    routeLineDot: {
        color: '#CBD5E1',
        fontSize: '0.75rem',
        letterSpacing: '1px',
    },
    metricsRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 8px',
    },
    metric: {
        display: 'flex',
        flexDirection: 'column',
    },
    mLabel: {
        fontSize: '0.68rem',
        color: '#64748B',
        fontWeight: '600',
    },
    mVal: {
        fontSize: '0.9rem',
        fontWeight: '800',
        color: '#0F172A',
        marginTop: '2px',
    },
    mapContainer: {
        height: '90px',
        background: '#FAFBFD',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
    },
    footerRow: {
        display: 'flex',
        justifyContent: 'center',
        fontSize: '0.78rem',
        fontWeight: '700',
        color: '#0F766E',
        cursor: 'pointer',
        paddingTop: '4px',
    },
};
