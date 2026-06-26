import { useState, useEffect, useCallback } from 'react';
import { registerUser, loginUser, adminLogin, adminRegister } from '../api/api';
import { useNavigate } from 'react-router-dom';
import {
    FiActivity, FiNavigation, FiHeart, FiSun,
    FiEye, FiEyeOff, FiShield, FiCalendar, FiMapPin,
    FiUser, FiMail, FiLock, FiArrowRight, FiCheckCircle
} from 'react-icons/fi';

/* ─── password strength helper ─── */
function getPasswordStrength(pw) {
    if (!pw) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const map = [
        { label: '', color: '#e2e8f0' },
        { label: 'Weak', color: '#ef4444' },
        { label: 'Fair', color: '#f59e0b' },
        { label: 'Good', color: '#3b82f6' },
        { label: 'Strong', color: '#10b981' },
        { label: 'Very Strong', color: '#059669' },
    ];
    return { score, ...map[score] };
}

const CITIES = ['Bengaluru', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Patna'];
const HEALTH_CONDITIONS = ['Healthy', 'Asthma', 'Heart', 'Pregnant', 'Elderly'];

export default function LandingPage() {
    const navigate = useNavigate();

    /* ─── state ─── */
    const [role, setRole] = useState('user');          // 'user' | 'admin'
    const [mode, setMode] = useState('register');      // 'register' | 'login'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    // User register form
    const [form, setForm] = useState({
        username: '', email: '', age: '25',
        health_condition: 'healthy',
        city: 'Bengaluru', daily_outdoor_hours: 2,
        password: ''
    });

    // Login form
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Admin login form
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Admin register form
    const [adminRegForm, setAdminRegForm] = useState({
        username: '', email: '', password: ''
    });

    useEffect(() => { setMounted(true); }, []);

    /* Reset forms on tab/mode switch */
    useEffect(() => { setError(''); }, [role, mode]);

    /* ─── handlers ─── */
    const handleUserRegister = useCallback(async () => {
        if (!form.username || !form.email || !form.age || !form.city || !form.password) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true); setError('');
        try {
            const res = await registerUser({ ...form, age: parseInt(form.age) });
            localStorage.setItem('user_id', res.data.user_id);
            localStorage.setItem('city', form.city);
            localStorage.setItem('username', form.username);
            navigate('/dashboard');
        } catch (e) {
            if (!e.response) setError('Cannot connect to server. Is the backend running?');
            else setError(e.response.data?.error || 'Registration failed');
        } finally { setLoading(false); }
    }, [form, navigate]);

    const handleUserLogin = useCallback(async () => {
        if (!loginUsername || !loginPassword) {
            setError('Please enter both Username and Password.');
            return;
        }
        setLoading(true); setError('');
        try {
            const res = await loginUser({ username: loginUsername, password: loginPassword });
            localStorage.setItem('user_id', res.data.user_id);
            localStorage.setItem('city', res.data.city);
            localStorage.setItem('username', res.data.username || loginUsername);
            navigate('/dashboard');
        } catch (e) {
            if (!e.response) setError('Cannot connect to server. Is the backend running?');
            else setError(e.response.data?.error || 'Invalid username or password.');
        } finally { setLoading(false); }
    }, [loginUsername, loginPassword, navigate]);

    const handleAdminLogin = useCallback(async () => {
        if (!adminEmail || !adminPassword) {
            setError('Please enter both Email and Password.');
            return;
        }
        setLoading(true); setError('');
        try {
            const res = await adminLogin({ email: adminEmail, password: adminPassword });
            localStorage.setItem('adminUser', JSON.stringify(res.data));
            navigate('/admin/dashboard');
        } catch (e) {
            if (!e.response) setError('Cannot connect to server. Is the backend running?');
            else setError(e.response.data?.error || 'Invalid admin credentials.');
        } finally { setLoading(false); }
    }, [adminEmail, adminPassword, navigate]);

    const handleAdminRegister = useCallback(async () => {
        if (!adminRegForm.username || !adminRegForm.email || !adminRegForm.password) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true); setError('');
        try {
            await adminRegister(adminRegForm);
            // Auto-login after register
            const res = await adminLogin({ email: adminRegForm.email, password: adminRegForm.password });
            localStorage.setItem('adminUser', JSON.stringify(res.data));
            navigate('/admin/dashboard');
        } catch (e) {
            if (!e.response) setError('Cannot connect to server. Is the backend running?');
            else setError(e.response.data?.error || 'Registration failed');
        } finally { setLoading(false); }
    }, [adminRegForm, navigate]);

    const pwStrength = getPasswordStrength(
        role === 'user'
            ? (mode === 'register' ? form.password : '')
            : (mode === 'register' ? adminRegForm.password : '')
    );

    /* ─── feature cards data ─── */
    const features = [
        { icon: <FiActivity />, title: 'Real-time AQI', desc: 'Live updates for your city' },
        { icon: <FiSun />, title: 'Smart Advisories', desc: 'Personalized tips for your health' },
        { icon: <FiNavigation />, title: 'Safe Routes', desc: 'Navigate with cleaner air' },
        { icon: <FiHeart />, title: 'Health Insights', desc: 'Track exposure and stay protected' },
    ];

    /* ─── render ─── */
    return (
        <div className={`landing-container ${mounted ? 'mounted' : ''}`}>
            {/* ───── LEFT PANEL ───── */}
            <div className="landing-left">
                <div className="landing-left-content">
                    {/* Logo */}
                    <div className="landing-logo">
                        <div className="landing-logo-icon">
                            <FiShield />
                        </div>
                        <span className="landing-logo-text">BreatheEasy<span className="accent">+</span></span>
                        <span className="landing-logo-badge">Personalized Air Quality Intelligence</span>
                    </div>

                    {/* Tagline */}
                    <h1 className="landing-tagline">
                        Breathe Better.<br />
                        Live <span className="accent">Healthier.</span>
                    </h1>
                    <p className="landing-subtitle">
                        Smart insights, safe routes, and personalized advisories for a healthier you.
                    </p>

                    {/* Illustration */}
                    <div className="landing-illustration">
                        <img src="/hero-illustration.png" alt="Clean air park illustration" />
                    </div>

                    {/* Feature Cards */}
                    <div className="landing-features">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon">{f.icon}</div>
                                <div>
                                    <div className="feature-title">{f.title}</div>
                                    <div className="feature-desc">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust Badge */}
                    <div className="landing-trust">
                        <FiShield className="trust-icon" />
                        <div>
                            <strong>Your data is safe with us.</strong>
                            <span>We never share your personal information.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───── RIGHT PANEL ───── */}
            <div className="landing-right">
                <div className="landing-form-card">
                    {/* Role Tabs */}
                    <div className="role-tabs">
                        <button
                            className={`role-tab ${role === 'user' ? 'active' : ''}`}
                            onClick={() => { setRole('user'); setMode('register'); }}
                        >
                            <FiUser /> User
                        </button>
                        <button
                            className={`role-tab ${role === 'admin' ? 'active' : ''}`}
                            onClick={() => { setRole('admin'); setMode('login'); }}
                        >
                            <FiShield /> Admin
                        </button>
                    </div>

                    {/* Form Header */}
                    <div className="form-header">
                        {role === 'user' ? (
                            <>
                                <h2>{mode === 'register' ? 'Create Your Account' : 'Welcome Back'}</h2>
                                <p>{mode === 'register'
                                    ? "Let's build your personalized air quality profile"
                                    : 'Sign in to access your dashboard'}</p>
                            </>
                        ) : (
                            <>
                                <h2>{mode === 'login' ? 'Admin Portal' : 'Create Admin Account'}</h2>
                                <p>{mode === 'login'
                                    ? 'Access the BreatheEasy+ control center'
                                    : 'Set up your administrator profile'}</p>
                            </>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="form-error">
                            <FiShield /> {error}
                        </div>
                    )}

                    {/* ── USER REGISTER ── */}
                    {role === 'user' && mode === 'register' && (
                        <div className="form-body animate-slide-up" key="user-register">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <div className="input-wrapper">
                                        <FiUser className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={form.username}
                                            onChange={e => setForm({ ...form, username: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <FiMail className="input-icon" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Age</label>
                                    <div className="input-wrapper">
                                        <FiCalendar className="input-icon" />
                                        <select
                                            value={form.age}
                                            onChange={e => setForm({ ...form, age: e.target.value })}
                                        >
                                            {Array.from({ length: 83 }, (_, i) => i + 8).map(a => (
                                                <option key={a} value={a}>{a}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>City</label>
                                    <div className="input-wrapper">
                                        <FiMapPin className="input-icon" />
                                        <select
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                        >
                                            {CITIES.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Health Condition</label>
                                    <div className="input-wrapper">
                                        <FiHeart className="input-icon" />
                                        <select
                                            value={form.health_condition}
                                            onChange={e => setForm({ ...form, health_condition: e.target.value.toLowerCase() })}
                                        >
                                            {HEALTH_CONDITIONS.map(c => (
                                                <option key={c} value={c.toLowerCase()}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Daily Outdoor Hours</label>
                                    <div className="input-wrapper">
                                        <FiSun className="input-icon" />
                                        <select
                                            value={form.daily_outdoor_hours}
                                            onChange={e => setForm({ ...form, daily_outdoor_hours: parseFloat(e.target.value) })}
                                        >
                                            {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12].map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a strong password"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-pw"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {form.password && (
                                    <div className="pw-strength">
                                        <div className="pw-bar">
                                            <div
                                                className="pw-bar-fill"
                                                style={{
                                                    width: `${(pwStrength.score / 5) * 100}%`,
                                                    background: pwStrength.color
                                                }}
                                            />
                                        </div>
                                        <span style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                className="submit-btn"
                                onClick={handleUserRegister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-loading">Creating account...</span>
                                ) : (
                                    <>
                                        <FiCheckCircle /> Create Account <FiArrowRight />
                                    </>
                                )}
                            </button>

                            <div className="form-switch">
                                <span>OR</span>
                            </div>
                            <p className="form-toggle-text">
                                Already have an account?{' '}
                                <button className="link-btn" onClick={() => setMode('login')}>
                                    Sign In <FiArrowRight />
                                </button>
                            </p>
                        </div>
                    )}

                    {/* ── USER LOGIN ── */}
                    {role === 'user' && mode === 'login' && (
                        <div className="form-body animate-slide-up" key="user-login">
                            <div className="input-group">
                                <label>Username</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Enter your username"
                                        value={loginUsername}
                                        onChange={e => setLoginUsername(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleUserLogin()}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleUserLogin()}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-pw"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <button
                                className="submit-btn"
                                onClick={handleUserLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-loading">Signing in...</span>
                                ) : (
                                    <>
                                        Sign In <FiArrowRight />
                                    </>
                                )}
                            </button>

                            <div className="form-switch">
                                <span>OR</span>
                            </div>
                            <p className="form-toggle-text">
                                Don't have an account?{' '}
                                <button className="link-btn" onClick={() => setMode('register')}>
                                    Create Account <FiArrowRight />
                                </button>
                            </p>
                        </div>
                    )}

                    {/* ── ADMIN LOGIN ── */}
                    {role === 'admin' && mode === 'login' && (
                        <div className="form-body animate-slide-up" key="admin-login">
                            <div className="input-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <FiMail className="input-icon" />
                                    <input
                                        type="email"
                                        placeholder="admin@breatheasy.com"
                                        value={adminEmail}
                                        onChange={e => setAdminEmail(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={adminPassword}
                                        onChange={e => setAdminPassword(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-pw"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <button
                                className="submit-btn admin"
                                onClick={handleAdminLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-loading">Authenticating...</span>
                                ) : (
                                    <>
                                        <FiShield /> Authenticate <FiArrowRight />
                                    </>
                                )}
                            </button>

                            <div className="form-switch">
                                <span>OR</span>
                            </div>
                            <p className="form-toggle-text">
                                Need an admin account?{' '}
                                <button className="link-btn" onClick={() => setMode('register')}>
                                    Create Admin Account <FiArrowRight />
                                </button>
                            </p>
                        </div>
                    )}

                    {/* ── ADMIN REGISTER ── */}
                    {role === 'admin' && mode === 'register' && (
                        <div className="form-body animate-slide-up" key="admin-register">
                            <div className="input-group">
                                <label>Username</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Choose a username"
                                        value={adminRegForm.username}
                                        onChange={e => setAdminRegForm({ ...adminRegForm, username: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <FiMail className="input-icon" />
                                    <input
                                        type="email"
                                        placeholder="admin@breatheasy.com"
                                        value={adminRegForm.email}
                                        onChange={e => setAdminRegForm({ ...adminRegForm, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a strong password"
                                        value={adminRegForm.password}
                                        onChange={e => setAdminRegForm({ ...adminRegForm, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-pw"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {adminRegForm.password && (
                                    <div className="pw-strength">
                                        <div className="pw-bar">
                                            <div
                                                className="pw-bar-fill"
                                                style={{
                                                    width: `${(pwStrength.score / 5) * 100}%`,
                                                    background: pwStrength.color
                                                }}
                                            />
                                        </div>
                                        <span style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                className="submit-btn admin"
                                onClick={handleAdminRegister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-loading">Creating admin account...</span>
                                ) : (
                                    <>
                                        <FiShield /> Create Admin Account <FiArrowRight />
                                    </>
                                )}
                            </button>

                            <div className="form-switch">
                                <span>OR</span>
                            </div>
                            <p className="form-toggle-text">
                                Already have an admin account?{' '}
                                <button className="link-btn" onClick={() => setMode('login')}>
                                    Sign In <FiArrowRight />
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
