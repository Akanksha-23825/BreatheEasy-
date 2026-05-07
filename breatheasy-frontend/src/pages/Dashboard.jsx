import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AQICard from '../components/AQICard';
import AdvisoryCard from '../components/AdvisoryCard';
import CesTrendChart from '../components/CesTrendChart';
import ForecastCard from '../components/ForecastCard';
import AlertsPanel from '../components/AlertsPanel';

export default function Dashboard() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');
    const city = localStorage.getItem('city') || 'Bengaluru';
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (!userId) navigate('/');
        setIsMounted(true);
    }, [userId, navigate]);

    return (
        <div style={styles.container}>
            {/* Ambient Background Elements */}
            <div style={styles.ambientBlob1} />
            <div style={styles.ambientBlob2} />

            <div style={{...styles.page, opacity: isMounted ? 1 : 0}}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.brand}>
                        <div style={styles.logoBadge}>BE+</div>
                        <div>
                            <h1 style={styles.logo}>
                                BreatheEasy<span style={{ color: '#10b981' }}>+</span>
                            </h1>
                            <p style={styles.tagline}>Personalized Health Intelligence</p>
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <button className="btn-premium btn-accent" onClick={() => navigate('/tools')}>
                            <span>🔬</span> Analysis Tools
                        </button>
                        
                        <div style={styles.divider} />
                        
                        <AlertsPanel userId={userId} />
                        
                        <button
                            className="btn-premium"
                            onClick={() => {
                                localStorage.removeItem('user_id');
                                localStorage.removeItem('city');
                                navigate('/');
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div style={styles.grid}>
                    <div style={styles.mainCol}>
                        <AdvisoryCard userId={userId} />
                        <CesTrendChart userId={userId} />
                    </div>
                    <div style={styles.sideCol}>
                        <AQICard city={city} />
                        <ForecastCard city={city.toLowerCase()} />
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Team CP07 • RV College of Engineering • Interdisciplinary Project
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
        minHeight: '100vh',
        background: '#030712',
        color: '#f8fafc',
        overflowX: 'hidden',
    },
    ambientBlob1: {
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        zIndex: 0,
    },
    ambientBlob2: {
        position: 'fixed',
        bottom: '10%',
        left: '-5%',
        width: '30vw',
        height: '30vw',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
        zIndex: 0,
    },
    page: {
        position: 'relative',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem',
        transition: 'opacity 0.8s ease-out',
        zIndex: 1,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    logoBadge: {
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: '900',
        color: '#030712',
        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
    },
    logo: {
        fontSize: '1.75rem',
        fontWeight: '800',
        margin: 0,
        letterSpacing: '-0.5px',
    },
    tagline: {
        fontSize: '0.85rem',
        color: '#94a3b8',
        margin: 0,
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    divider: {
        width: '1px',
        height: '32px',
        background: 'rgba(51, 65, 85, 0.5)',
        margin: '0 0.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '2rem',
    },
    mainCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    sideCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    footer: {
        marginTop: '4rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(51, 65, 85, 0.3)',
        textAlign: 'center',
    },
    footerText: {
        fontSize: '0.8rem',
        color: '#64748b',
        fontFamily: "'Space Mono', monospace",
        letterSpacing: '1px',
    },
};