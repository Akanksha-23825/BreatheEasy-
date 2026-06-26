import React, { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const pageTitles = {
  '/admin/dashboard': { title: 'Central Intelligence', sub: 'Real-time air quality & population health monitoring' },
  '/admin/heatmap':   { title: 'Risk Heatmap', sub: 'Geographic pollution exposure across zones' },
  '/admin/alerts':    { title: 'Health Alerts', sub: 'Broadcast advisories to users in real-time' },
  '/admin/routes':    { title: 'Route Monitor', sub: 'Track and analyze active user routes for risk' },
  '/admin/analytics': { title: 'Analytics', sub: 'Population vulnerability and trend analysis' },
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('adminUser'));
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  const page = pageTitles[location.pathname] || { title: 'Admin', sub: '' };

  return (
    <div style={styles.shell}>
      {/* Ambient bg glow */}
      <div style={styles.glowTopLeft} />
      <div style={styles.glowBottomRight} />

      <AdminSidebar />

      <main style={styles.main}>
        {/* Top Header Bar */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>{page.title}</h1>
            <p style={styles.pageSub}>{page.sub}</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.timeBadge}>
              🕐 &nbsp;{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#060910',
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  glowTopLeft: {
    position: 'fixed',
    top: '-15%',
    left: '-10%',
    width: '40%',
    height: '40%',
    background: 'radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  glowBottomRight: {
    position: 'fixed',
    bottom: '-15%',
    right: '-10%',
    width: '40%',
    height: '40%',
    background: 'radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.75rem 2.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(6,9,16,0.7)',
    backdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  pageTitle: {
    color: '#f8fafc',
    fontSize: '1.5rem',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSub: {
    color: '#475569',
    fontSize: '0.82rem',
    fontWeight: '500',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timeBadge: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '8px 14px',
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  content: {
    padding: '2rem 2.5rem',
    flex: 1,
    overflowY: 'auto',
  },
};

export default AdminLayout;
