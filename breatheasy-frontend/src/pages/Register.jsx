import { useState } from 'react';
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

    const handleRegister = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await registerUser({ ...form, age: parseInt(form.age) });
            localStorage.setItem('user_id', res.data.user_id);
            localStorage.setItem('city', form.city);
            navigate('/dashboard');
        } catch (e) {
            setError(e.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`http://127.0.0.1:5000/api/user/${loginId}`);
            localStorage.setItem('user_id', res.data.id);
            localStorage.setItem('city', res.data.city);
            navigate('/dashboard');
        } catch (e) {
            setError('User ID not found. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>
                    BreatheEasy<span style={{ color: '#00d4aa' }}>+</span>
                </h1>
                <p style={styles.sub}>Your personalized air quality guardian</p>

                {/* Toggle */}
                <div style={styles.toggle}>
                    <button
                        style={{ ...styles.toggleBtn, ...(mode === 'register' ? styles.toggleActive : {}) }}
                        onClick={() => { setMode('register'); setError(''); }}
                    >
                        Register
                    </button>
                    <button
                        style={{ ...styles.toggleBtn, ...(mode === 'login' ? styles.toggleActive : {}) }}
                        onClick={() => { setMode('login'); setError(''); }}
                    >
                        Login
                    </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {/* LOGIN FORM */}
                {mode === 'login' && (
                    <>
                        <p style={{ color: '#8899aa', fontSize: 13 }}>
                            Enter your User ID to continue. You received this when you registered.
                        </p>
                        <div style={styles.field}>
                            <label style={styles.label}>USER ID</label>
                            <input
                                style={styles.input}
                                type="number"
                                placeholder="e.g. 1"
                                value={loginId}
                                onChange={e => setLoginId(e.target.value)}
                            />
                        </div>
                        <button
                            style={styles.btn}
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Go to Dashboard →'}
                        </button>
                    </>
                )}

                {/* REGISTER FORM */}
                {mode === 'register' && (
                    <>
                        {[
                            { key: 'username', label: 'Username', type: 'text' },
                            { key: 'email', label: 'Email', type: 'email' },
                            { key: 'age', label: 'Age', type: 'number' },
                        ].map(f => (
                            <div key={f.key} style={styles.field}>
                                <label style={styles.label}>{f.label}</label>
                                <input
                                    style={styles.input}
                                    type={f.type}
                                    value={form[f.key]}
                                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                />
                            </div>
                        ))}

                        <div style={styles.field}>
                            <label style={styles.label}>Health Condition</label>
                            <select
                                style={styles.input}
                                value={form.health_condition}
                                onChange={e => setForm({ ...form, health_condition: e.target.value })}
                            >
                                {['healthy', 'asthma', 'heart', 'pregnant', 'elderly'].map(c => (
                                    <option key={c} value={c}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Daily Outdoor Hours</label>
                            <input
                                style={styles.input}
                                type="number"
                                step="0.5"
                                value={form.daily_outdoor_hours}
                                onChange={e => setForm({ ...form, daily_outdoor_hours: parseFloat(e.target.value) })}
                            />
                        </div>

                        <button
                            style={styles.btn}
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            {loading ? 'Setting up...' : 'Get Started →'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1e',
        padding: 20,
    },
    card: {
        background: '#111827',
        border: '1px solid #1f2f4a',
        borderRadius: 20,
        padding: 40,
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    title: {
        fontFamily: "'Space Mono', monospace",
        fontSize: 32,
        fontWeight: 700,
        color: '#e8edf5',
    },
    sub: { color: '#8899aa', fontSize: 14, marginTop: -8 },
    toggle: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#1a2235',
        borderRadius: 10,
        padding: 4,
        gap: 4,
    },
    toggleBtn: {
        background: 'transparent',
        border: 'none',
        borderRadius: 8,
        padding: '10px',
        color: '#8899aa',
        cursor: 'pointer',
        fontSize: 14,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
    },
    toggleActive: {
        background: '#00d4aa',
        color: '#0a0f1e',
        fontWeight: 700,
    },
    error: {
        background: '#ff475722',
        border: '1px solid #ff475744',
        borderRadius: 8,
        padding: '10px 14px',
        color: '#ff4757',
        fontSize: 13,
    },
    field: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: 12, color: '#8899aa', letterSpacing: 1 },
    input: {
        background: '#1a2235',
        border: '1px solid #1f2f4a',
        borderRadius: 8,
        padding: '10px 14px',
        color: '#e8edf5',
        fontSize: 14,
        outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
    },
    btn: {
        background: '#00d4aa',
        color: '#0a0f1e',
        border: 'none',
        borderRadius: 10,
        padding: '14px',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        marginTop: 8,
        fontFamily: "'Space Mono', monospace",
    },
};