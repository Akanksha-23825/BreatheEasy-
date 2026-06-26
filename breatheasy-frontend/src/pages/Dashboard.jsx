import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AQICard from '../components/AQICard';
import AdvisoryCard from '../components/AdvisoryCard';
import CesTrendChart from '../components/CesTrendChart';
import ForecastCard from '../components/ForecastCard';
import MLAdvisoryCard from '../components/MLAdvisoryCard';
import { getUserProfile, updateUserProfile } from '../api/api';
import AlertsPanel from '../components/AlertsPanel';

// ─── Sidebar Nav Config ───────────────────────────────────────────────────────
const NAV = [
    { id: 'air-quality',   icon: '💨', label: 'Air Quality' },
    { id: 'exposure',      icon: '🫁', label: 'Exposure & Health' },
    { id: 'forecast',      icon: '📅', label: 'Weekly Forecast' },
    { id: 'trend',         icon: '📈', label: 'Exposure Trend' },
    { id: 'ai-prediction', icon: '🤖', label: 'AI Prediction' },
    { id: 'tools',         icon: '🔬', label: 'Analysis Tools' },
    { id: 'profile',       icon: '👤', label: 'Profile' },
];

const CONDITIONS = ['healthy', 'asthma', 'heart', 'pregnant', 'elderly', 'children'];

// ─── Profile Panel ─────────────────────────────────────────────────────────────
function ProfilePanel({ userId, onSignOut, onProfileUpdate }) {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserProfile(userId)
            .then(res => {
                setProfile(res.data);
                setForm(res.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        try {
            await updateUserProfile(userId, form);
            setProfile({ ...profile, ...form });
            localStorage.setItem('city', form.city);
            localStorage.setItem('username', form.username);
            if (onProfileUpdate) {
                onProfileUpdate(form.username, form.city);
            }
            setEditing(false);
            setMsg('Profile updated successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch {
            setMsg('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={ps.loading}>Loading profile...</div>;
    if (!profile) return <div style={ps.loading}>Profile unavailable.</div>;

    const conditionEmoji = { healthy: '💚', asthma: '🫁', heart: '❤️', pregnant: '🤰', elderly: '🧓', children: '🧒' };

    return (
        <div style={ps.container}>
            {/* Avatar header */}
            <div style={ps.avatarSection}>
                <div style={ps.avatar}>
                    {profile.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style={ps.name}>{profile.username}</h2>
                    <p style={ps.email}>{profile.email}</p>
                    <div style={ps.condBadge}>
                        {conditionEmoji[profile.health_condition] || '🏥'} {profile.health_condition}
                    </div>
                </div>
            </div>

            {msg && (
                <div style={{ ...ps.msgBanner, background: msg.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderColor: msg.includes('success') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)', color: msg.includes('success') ? '#22c55e' : '#ef4444' }}>
                    {msg}
                </div>
            )}

            {/* Details / Edit form */}
            <div style={ps.card}>
                <div style={ps.cardHeader}>
                    <h3 style={ps.cardTitle}>Personal Details</h3>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} style={ps.editBtn}>✏️ Edit</button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleSave} style={ps.saveBtn} disabled={saving}>{saving ? 'Saving...' : '✅ Save'}</button>
                            <button onClick={() => { setEditing(false); setForm(profile); }} style={ps.cancelBtn}>✕ Cancel</button>
                        </div>
                    )}
                </div>

                <div style={ps.fieldsGrid}>
                    {/* Username */}
                    <div style={ps.field}>
                        <label style={ps.fieldLabel}>Username</label>
                        {editing
                            ? <input style={ps.input} value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} />
                            : <span style={ps.fieldVal}>{profile.username}</span>}
                    </div>

                    {/* Age */}
                    <div style={ps.field}>
                        <label style={ps.fieldLabel}>Age</label>
                        {editing
                            ? <input style={ps.input} type="number" min="1" max="120" value={form.age || ''} onChange={e => setForm({ ...form, age: e.target.value })} />
                            : <span style={ps.fieldVal}>{profile.age} years</span>}
                    </div>

                    {/* City */}
                    <div style={ps.field}>
                        <label style={ps.fieldLabel}>City</label>
                        {editing
                            ? <input style={ps.input} value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} />
                            : <span style={ps.fieldVal}>📍 {profile.city}</span>}
                    </div>

                    {/* Outdoor Hours */}
                    <div style={ps.field}>
                        <label style={ps.fieldLabel}>Daily Outdoor Hours</label>
                        {editing
                            ? <input style={ps.input} type="number" step="0.5" min="0" max="24" value={form.daily_outdoor_hours || ''} onChange={e => setForm({ ...form, daily_outdoor_hours: e.target.value })} />
                            : <span style={ps.fieldVal}>{profile.daily_outdoor_hours} hrs/day</span>}
                    </div>

                    {/* Health Condition */}
                    <div style={{ ...ps.field, gridColumn: 'span 2' }}>
                        <label style={ps.fieldLabel}>Health Condition</label>
                        {editing
                            ? (
                                <select style={ps.select} value={form.health_condition || ''} onChange={e => setForm({ ...form, health_condition: e.target.value })}>
                                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            )
                            : <span style={ps.fieldVal}>{conditionEmoji[profile.health_condition]} {profile.health_condition}</span>}
                    </div>

                    {/* Password (only in edit mode) */}
                    {editing && (
                        <div style={{ ...ps.field, gridColumn: 'span 2' }}>
                            <label style={ps.fieldLabel}>New Password (leave blank to keep current)</label>
                            <input style={ps.input} type="password" placeholder="••••••••" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                    )}
                </div>
            </div>

            {/* Sign Out */}
            <button onClick={onSignOut} style={ps.signOutBtn}>
                ⎋ &nbsp;Sign Out
            </button>
        </div>
    );
}

// ─── Analysis Tools Panel ─────────────────────────────────────────────────────
function ToolsPanel() {
    const navigate = useNavigate();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={tools.header}>
                <h2 style={tools.title}>🔬 Analysis Tools</h2>
                <p style={tools.sub}>Advanced air quality analysis and personalized routing tools</p>
            </div>
            <div style={tools.grid}>
                {[
                    { icon: '🗺', title: 'AQI Heatmap', desc: 'View pollution hotspots across Bengaluru on an interactive map', action: () => navigate('/tools') },
                    { icon: '🛣', title: 'Route Optimizer', desc: 'Find the least polluted path for your outdoor commute', action: () => navigate('/tools') },
                    { icon: '🧭', title: 'Route Recommendation', desc: 'Real-time health-aware routing with voice navigation simulation', action: () => navigate('/route-recommendation') },
                    { icon: '📊', title: 'Exposure History', desc: 'Detailed breakdown of your cumulative exposure over time', action: () => navigate('/tools') },
                    { icon: '🌤', title: 'AQI Forecast', desc: '7-day air quality forecast with personalized health impact', action: () => navigate('/tools') },
                ].map(t => (
                    <div key={t.title} style={tools.card} onClick={t.action}>
                        <div style={tools.cardIcon}>{t.icon}</div>
                        <h4 style={tools.cardTitle}>{t.title}</h4>
                        <p style={tools.cardDesc}>{t.desc}</p>
                        <div style={tools.cardArrow}>Open Tool →</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');
    const [city, setCity] = useState(localStorage.getItem('city') || 'Bengaluru');
    const [username, setUsername] = useState(localStorage.getItem('username') || 'there');
    const [activeTab, setActiveTab] = useState('air-quality');

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return { text: 'Good Morning', emoji: '👋' };
        if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
        return { text: 'Good Evening', emoji: '🌙' };
    };

    const greeting = getGreeting();

    useEffect(() => {
        if (!userId) navigate('/');
    }, [userId, navigate]);

    const handleSignOut = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('city');
        localStorage.removeItem('username');
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'air-quality':
                return (
                    <Section title="💨 Air Quality" sub="Live pollutant levels for your city">
                        <AQICard city={city} />
                    </Section>
                );
            case 'exposure':
                return (
                    <Section title="🫁 Exposure & Health" sub="Your personalized health advisory based on today's exposure">
                        <AdvisoryCard userId={userId} />
                    </Section>
                );
            case 'forecast':
                return (
                    <Section title="📅 Weekly Forecast" sub="7-day air quality prediction for your city">
                        <ForecastCard city={city.toLowerCase()} />
                    </Section>
                );
            case 'trend':
                return (
                    <Section title="📈 Exposure Trend" sub="Your cumulative exposure score over the past week">
                        <CesTrendChart userId={userId} />
                    </Section>
                );
            case 'ai-prediction':
                return (
                    <Section title="🤖 AI Prediction & Analysis" sub="PELM machine learning model predicting your health risk">
                        <MLAdvisoryCard userId={userId} />
                    </Section>
                );
            case 'tools':
                return <ToolsPanel />;
            case 'profile':
                return (
                    <Section title="👤 My Profile" sub="Manage your personal details and health settings">
                        <ProfilePanel 
                            userId={userId} 
                            onSignOut={handleSignOut} 
                            onProfileUpdate={(newUsername, newCity) => {
                                setUsername(newUsername);
                                setCity(newCity);
                            }} 
                        />
                    </Section>
                );
            default:
                return null;
        }
    };

    return (
        <div className="user-theme-container" style={dash.shell}>
            {/* ── Sidebar ── */}
            <aside style={dash.sidebar}>
                {/* Logo */}
                <div style={dash.logoRow}>
                    <div style={dash.logoBadge}>BE+</div>
                    <div>
                        <div style={dash.logoTitle}>BreatheEasy+</div>
                        <div style={dash.logoSub}>Health Intelligence</div>
                    </div>
                </div>

                {/* City badge */}
                <div style={dash.cityBadge}>
                    📍 {city}
                </div>

                {/* Nav */}
                <nav style={dash.nav}>
                    {NAV.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                ...dash.navItem,
                                ...(activeTab === item.id ? dash.navItemActive : {}),
                            }}
                        >
                            <span style={dash.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {activeTab === item.id && <span style={dash.navDot} />}
                        </button>
                    ))}
                </nav>

                <div style={{ flex: 1 }} />

                {/* Breathe tip */}
                <div style={dash.tipBox}>
                    <div style={dash.tipIcon}>🌿</div>
                    <p style={dash.tipText}><strong>Breathe Better,</strong><br />Live Healthier.<br /><span style={{ fontWeight: 400 }}>Small steps today, cleaner tomorrow.</span></p>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main style={dash.main}>
                {/* Top bar */}
                <div style={dash.topBar}>
                    <div>
                        <h2 style={dash.pageTitle}>{NAV.find(n => n.id === activeTab)?.label}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <AlertsPanel userId={userId} />
                        <button onClick={handleSignOut} style={dash.signOutTopBtn}>⎋ Sign Out</button>
                    </div>
                </div>

                {/* Greeting banner — only show on non-profile tabs */}
                {activeTab !== 'profile' && activeTab !== 'tools' && (
                    <div style={dash.greetingBanner}>
                        <h2 style={dash.greetingTitle}>
                            {greeting.text}, {username.charAt(0).toUpperCase() + username.slice(1)} {greeting.emoji}
                        </h2>
                        <p style={dash.greetingSub}>Here's your air quality overview</p>
                    </div>
                )}

                {/* Content */}
                <div style={dash.contentArea}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

// ─── Section Wrapper ───────────────────────────────────────────────────────────
function Section({ title, sub, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0, fontFamily: "'Inter', sans-serif" }}>{title}</h2>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '4px 0 0 0', fontWeight: '500' }}>{sub}</p>
            </div>
            {children}
        </div>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const dash = {
    shell: {
        display: 'flex', minHeight: '100vh',
        background: '#F8FAFC', fontFamily: "'Inter', -apple-system, sans-serif",
    },
    sidebar: {
        width: '240px', flexShrink: 0,
        background: '#FFFFFF', borderRight: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', padding: '1.5rem',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    },
    logoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' },
    logoBadge: {
        width: '38px', height: '38px', background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '900', fontSize: '0.8rem', flexShrink: 0,
    },
    logoTitle: { color: '#0F172A', fontWeight: '800', fontSize: '0.95rem', lineHeight: 1.2 },
    logoSub: { color: '#64748B', fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' },
    cityBadge: {
        background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '10px',
        padding: '8px 12px', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A',
        marginBottom: '1rem',
    },
    nav: { display: 'flex', flexDirection: 'column', gap: '2px' },
    navItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '12px', border: 'none',
        background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left',
        fontSize: '0.875rem', fontWeight: '600', color: '#64748B',
        fontFamily: "'Inter', sans-serif", transition: 'all 0.15s ease',
        position: 'relative',
    },
    navItemActive: { background: '#ECFDF5', color: '#0F766E' },
    navIcon: { fontSize: '1.05rem', width: '20px', textAlign: 'center', flexShrink: 0 },
    navDot: {
        position: 'absolute', right: '12px', width: '6px', height: '6px',
        background: '#14B8A6', borderRadius: '50%',
    },
    tipBox: {
        background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
        border: '1px solid #D1FAE5', borderRadius: '14px', padding: '1rem',
        display: 'flex', gap: '10px', alignItems: 'flex-start',
    },
    tipIcon: { fontSize: '1.25rem', flexShrink: 0 },
    tipText: { fontSize: '0.75rem', color: '#065F46', lineHeight: 1.5, margin: 0, fontWeight: '600' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
    topBar: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 2rem', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
        position: 'sticky', top: 0, zIndex: 10,
    },
    pageTitle: { fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 },
    signOutTopBtn: {
        background: 'none', border: '1px solid #E2E8F0', borderRadius: '10px',
        padding: '8px 16px', color: '#64748B', fontSize: '0.82rem', fontWeight: '600',
        cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s ease',
    },
    contentArea: { padding: '2rem', flex: 1 },
    greetingBanner: {
        padding: '1.5rem 2rem 0.25rem 2rem',
    },
    greetingTitle: {
        fontSize: '1.55rem',
        fontWeight: '800',
        color: '#0F172A',
        margin: '0 0 4px 0',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '-0.02em',
    },
    greetingSub: {
        color: '#64748B',
        fontSize: '0.875rem',
        fontWeight: '500',
        margin: 0,
    },
};

const ps = {
    container: { display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '640px' },
    loading: { color: '#64748B', fontSize: '0.9rem', padding: '2rem' },
    avatarSection: {
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px',
        padding: '1.5rem',
    },
    avatar: {
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '1.5rem', fontWeight: '900', flexShrink: 0,
    },
    name: { color: '#0F172A', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 2px 0' },
    email: { color: '#64748B', fontSize: '0.82rem', fontWeight: '500', margin: '0 0 8px 0' },
    condBadge: {
        display: 'inline-block', background: '#F0FDF4', border: '1px solid #D1FAE5',
        borderRadius: '99px', padding: '3px 12px', color: '#065F46',
        fontSize: '0.75rem', fontWeight: '700', textTransform: 'capitalize',
    },
    msgBanner: {
        borderRadius: '12px', padding: '10px 14px',
        border: '1px solid', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center',
    },
    card: {
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: '20px', padding: '1.5rem',
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
    cardTitle: { color: '#0F172A', fontSize: '1rem', fontWeight: '800', margin: 0, fontFamily: "'Inter', sans-serif" },
    editBtn: {
        background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '10px',
        padding: '7px 14px', color: '#0F172A', fontSize: '0.82rem', fontWeight: '700',
        cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    },
    saveBtn: {
        background: '#0F766E', border: 'none', borderRadius: '10px',
        padding: '7px 14px', color: '#fff', fontSize: '0.82rem', fontWeight: '700',
        cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    },
    cancelBtn: {
        background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '10px',
        padding: '7px 12px', color: '#64748B', fontSize: '0.82rem', fontWeight: '700',
        cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    },
    fieldsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    fieldLabel: { color: '#64748B', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
    fieldVal: { color: '#0F172A', fontSize: '0.95rem', fontWeight: '700', textTransform: 'capitalize' },
    input: {
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
        padding: '10px 12px', fontSize: '0.875rem', color: '#0F172A',
        outline: 'none', fontFamily: "'Inter', sans-serif",
    },
    select: {
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
        padding: '10px 12px', fontSize: '0.875rem', color: '#0F172A',
        outline: 'none', fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    },
    signOutBtn: {
        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '14px', padding: '12px', color: '#ef4444',
        fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", textAlign: 'center',
        transition: 'all 0.2s ease',
    },
};

const tools = {
    header: { marginBottom: '0.5rem' },
    title: { fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0', fontFamily: "'Inter', sans-serif" },
    sub: { color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
    card: {
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px',
        padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', gap: '8px',
    },
    cardIcon: { fontSize: '2rem' },
    cardTitle: { color: '#0F172A', fontSize: '1rem', fontWeight: '800', margin: 0, fontFamily: "'Inter', sans-serif" },
    cardDesc: { color: '#64748B', fontSize: '0.82rem', fontWeight: '500', margin: 0, lineHeight: 1.5 },
    cardArrow: { color: '#0F766E', fontSize: '0.82rem', fontWeight: '700', marginTop: '8px' },
};