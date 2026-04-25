import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AQICard from '../components/AQICard';
import AdvisoryCard from '../components/AdvisoryCard';
import CesTrendChart from '../components/CesTrendChart';
import ForecastCard from '../components/ForecastCard';

export default function Dashboard() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');
    const city = localStorage.getItem('city') || 'Bengaluru';

    useEffect(() => {
        if (!userId) navigate('/');
    }, [userId, navigate]);

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.logo}>
                    BreatheEasy<span style={{ color: '#00d4aa' }}>+</span>
                </h1>
                <p style={styles.tagline}>Real-time personalized air quality intelligence</p>
            </div>

            {/* Dashboard Grid */}
            <div style={styles.grid}>
                <AQICard city={city} />
                <AdvisoryCard userId={userId} />
                <CesTrendChart userId={userId} />
                <ForecastCard city={city.toLowerCase()} />
            </div>

            {/* Footer */}
            <p style={styles.footer}>
                Team CP07 · RV College of Engineering · Interdisciplinary Project
            </p>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0a0f1e',
        padding: '32px 24px',
        maxWidth: 1100,
        margin: '0 auto',
    },
    header: {
        marginBottom: 32,
        borderBottom: '1px solid #1f2f4a',
        paddingBottom: 20,
    },
    logo: {
        fontFamily: "'Space Mono', monospace",
        fontSize: 28,
        fontWeight: 700,
        color: '#e8edf5',
    },
    tagline: {
        color: '#8899aa',
        fontSize: 13,
        marginTop: 4,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
    },
    footer: {
        textAlign: 'center',
        color: '#8899aa',
        fontSize: 12,
        marginTop: 40,
        paddingTop: 20,
        borderTop: '1px solid #1f2f4a',
        fontFamily: "'Space Mono', monospace",
    },
};