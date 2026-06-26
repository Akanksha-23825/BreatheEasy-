import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Overview', path: '/admin/dashboard', icon: '⊞' },
  { name: 'Risk Heatmap', path: '/admin/heatmap', icon: '🗺' },
  { name: 'Health Alerts', path: '/admin/alerts', icon: '⚠' },
  { name: 'Route Monitor', path: '/admin/routes', icon: '〜' },
  { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoRow}>
        <div style={styles.logoBox}>BE</div>
        <div>
          <div style={styles.logoTitle}>BreatheEasy+</div>
          <div style={styles.logoSub}>ADMIN TERMINAL</div>
        </div>
      </div>

      {/* Status badge */}
      <div style={styles.statusBadge}>
        <span style={styles.statusDot} />
        System Live
      </div>

      {/* Nav links */}
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Admin badge */}
      <div style={styles.adminBadge}>
        <div style={styles.adminAvatar}>AD</div>
        <div>
          <div style={styles.adminName}>SuperAdmin</div>
          <div style={styles.adminRole}>Administrator</div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        ⎋ &nbsp;Sign Out
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: '240px',
    background: 'rgba(10, 12, 22, 0.95)',
    backdropFilter: 'blur(24px)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    zIndex: 100,
    gap: '0.5rem',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '1rem',
  },
  logoBox: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #dc2626, #ea580c)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '900',
    fontSize: '0.95rem',
    boxShadow: '0 4px 16px rgba(220,38,38,0.35)',
    flexShrink: 0,
  },
  logoTitle: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.2,
  },
  logoSub: {
    color: '#475569',
    fontSize: '0.6rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.15)',
    borderRadius: '10px',
    padding: '8px 12px',
    color: '#10b981',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    background: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 6px #10b981',
    animation: 'pulse 2s infinite',
    flexShrink: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '12px',
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
  },
  navItemActive: {
    background: 'rgba(220,38,38,0.12)',
    color: '#f87171',
    border: '1px solid rgba(220,38,38,0.2)',
  },
  navIcon: {
    fontSize: '1.1rem',
    width: '20px',
    textAlign: 'center',
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '10px 12px',
    marginBottom: '8px',
  },
  adminAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #dc2626, #ea580c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '900',
    flexShrink: 0,
  },
  adminName: {
    color: '#f8fafc',
    fontSize: '0.82rem',
    fontWeight: '700',
    fontFamily: "'Inter', sans-serif",
  },
  adminRole: {
    color: '#475569',
    fontSize: '0.68rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: '#f87171',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
  },
};

export default AdminSidebar;
