import { useState, useEffect } from 'react';
import { registerUser } from '../api/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('register'); // 'register' or 'login'
    const [form, setForm] = useState({
        username: '', email: '', age: '',
        health_condition: 'healthy',
        city: 'Bengaluru', daily_outdoor_hours: 2
    });
    const [loginId, setLoginId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleRegister = async () => {
        if (!form.username || !form.email || !form.age || !form.city) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await registerUser({ ...form, age: parseInt(form.age) });
            localStorage.setItem('user_id', res.data.user_id);
            localStorage.setItem('city', form.city);
            navigate('/dashboard');
        } catch (e) {
            console.error(e);
            if (!e.response) {
                setError('Cannot connect to server. Is the backend running?');
            } else {
                setError(e.response.data?.error || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!loginId) {
            setError('Please enter your User ID.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`http://127.0.0.1:5000/api/user/${loginId}`);
            localStorage.setItem('user_id', res.data.id);
            localStorage.setItem('city', res.data.city);
            navigate('/dashboard');
        } catch (e) {
            if (!e.response) {
                setError('Cannot connect to server. Is the backend running?');
            } else {
                setError('User ID not found. Please check and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Background Image with Overlay */}
            <div style={styles.bgWrapper}>
                <div style={styles.bgImage} />
                <div style={styles.bgOverlay} />
            </div>

            <div style={{...styles.content, opacity: isMounted ? 1 : 0}}>
                <div className="glass" style={styles.card}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.logoBadge}>BE+</div>
                        <h1 style={styles.title}>
                            BreatheEasy<span style={styles.accentText}>+</span>
                        </h1>
                        <p style={styles.subtitle}>Personalized Air Quality Intelligence</p>
                    </div>

                    {/* Mode Toggle */}
                    <div style={styles.toggleContainer}>
                        <button
                            style={{ 
                                ...styles.toggleBtn, 
                                ...(mode === 'register' ? styles.toggleActive : {}) 
                            }}
                            onClick={() => { setMode('register'); setError(''); }}
                        >
                            Create Account
                        </button>
                        <button
                            style={{ 
                                ...styles.toggleBtn, 
                                ...(mode === 'login' ? styles.toggleActive : {}) 
                            }}
                            onClick={() => { setMode('login'); setError(''); }}
                        >
                            Sign In
                        </button>
                    </div>

                    {error && <div style={styles.errorBox}>{error}</div>}

                    {/* Form Section */}
                    <div style={styles.formSection}>
                        {mode === 'login' ? (
                            <div className="animate-fade-in" style={styles.loginForm}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>USER ID</label>
                                    <input
                                        style={styles.input}
                                        type="number"
                                        placeholder="Enter your unique ID"
                                        value={loginId}
                                        onChange={e => setLoginId(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleLogin()}
                                    />
                                    <span style={styles.inputHint}>Your ID was provided during registration.</span>
                                </div>
                                <button
                                    style={styles.submitBtn}
                                    onClick={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span style={styles.loaderText}>Signing in...</span>
                                    ) : (
                                        "Access Dashboard"
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in" style={styles.registerForm}>
                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Full Name</label>
                                        <input
                                            style={styles.input}
                                            type="text"
                                            placeholder="John Doe"
                                            value={form.username}
                                            onChange={e => setForm({ ...form, username: e.target.value })}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Email Address</label>
                                        <input
                                            style={styles.input}
                                            type="email"
                                            placeholder="john@example.com"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Age</label>
                                        <input
                                            style={styles.input}
                                            type="number"
                                            placeholder="25"
                                            value={form.age}
                                            onChange={e => setForm({ ...form, age: e.target.value })}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>City</label>
                                        <input
                                            style={styles.input}
                                            type="text"
                                            placeholder="Bengaluru"
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={styles.grid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Health Condition</label>
                                        <select
                                            style={styles.input}
                                            value={form.health_condition}
                                            onChange={e => setForm({ ...form, health_condition: e.target.value })}
                                        >
                                            {['healthy', 'asthma', 'heart', 'pregnant', 'elderly'].map(c => (
                                                <option key={c} value={c} style={{background: '#0f172a'}}>
                                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Daily Outdoor Hours</label>
                                        <input
                                            style={styles.input}
                                            type="number"
                                            step="0.5"
                                            value={form.daily_outdoor_hours}
                                            onChange={e => setForm({ ...form, daily_outdoor_hours: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <button
                                    style={styles.submitBtn}
                                    onClick={handleRegister}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span style={styles.loaderText}>Setting up Profile...</span>
                                    ) : (
                                        "Start Protecting My Health"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            Protecting over 50,000 users across 12 cities.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
    },
    bgWrapper: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    bgImage: {
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.6)',
    },
    bgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, transparent, rgba(3, 7, 18, 0.9))',
    },
    content: {
        width: '100%',
        maxWidth: '520px',
        transition: 'opacity 1s ease-in-out',
        zIndex: 1,
    },
    card: {
        borderRadius: '24px',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    header: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
    },
    logoBadge: {
        background: 'rgba(16, 185, 129, 0.2)',
        color: '#10b981',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        letterSpacing: '1px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        marginBottom: '0.5rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#f8fafc',
        letterSpacing: '-1px',
        margin: 0,
    },
    accentText: {
        color: '#10b981',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '1rem',
        fontWeight: '400',
    },
    toggleContainer: {
        display: 'flex',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '14px',
        padding: '4px',
        border: '1px solid rgba(51, 65, 85, 0.5)',
    },
    toggleBtn: {
        flex: 1,
        padding: '12px',
        borderRadius: '10px',
        border: 'none',
        background: 'transparent',
        color: '#94a3b8',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    toggleActive: {
        background: '#10b981',
        color: '#030712',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    },
    formSection: {
        display: 'flex',
        flexDirection: 'column',
    },
    loginForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    registerForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginLeft: '4px',
    },
    input: {
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        borderRadius: '12px',
        padding: '14px 16px',
        color: '#f8fafc',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        width: '100%',
    },
    inputHint: {
        fontSize: '0.7rem',
        color: '#64748b',
        marginTop: '4px',
        marginLeft: '4px',
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#030712',
        border: 'none',
        borderRadius: '14px',
        padding: '18px',
        fontSize: '1.1rem',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '1rem',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
    },
    errorBox: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        color: '#f87171',
        fontSize: '0.85rem',
        textAlign: 'center',
    },
    footer: {
        textAlign: 'center',
        borderTop: '1px solid rgba(51, 65, 85, 0.3)',
        paddingTop: '1.5rem',
    },
    footerText: {
        fontSize: '0.8rem',
        color: '#64748b',
        fontStyle: 'italic',
    },
};