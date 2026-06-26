import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const unsafeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const AdminRouteMonitor = () => {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingMode, setMarkingMode] = useState(false);
  const [newUnsafe, setNewUnsafe] = useState({ road_name: '', reason: '', lat: null, lng: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRoads(); }, []);

  const fetchRoads = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/roads');
      setRoads(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleMarkRoad = async (e) => {
    e.preventDefault();
    if (!newUnsafe.lat || !newUnsafe.lng) { alert('Click on the map to select coordinates'); return; }
    setSaving(true);
    try {
      await axios.post('http://127.0.0.1:5000/api/admin/roads', newUnsafe);
      setNewUnsafe({ road_name: '', reason: '', lat: null, lng: null });
      setMarkingMode(false);
      fetchRoads();
    } catch { alert('Failed to mark road'); }
    finally { setSaving(false); }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (markingMode) setNewUnsafe(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      },
    });
    return null;
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar Panel */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarIcon}>🚧</div>
          <div>
            <h3 style={styles.sidebarTitle}>Route Intelligence</h3>
            <p style={styles.sidebarSub}>Mark high-risk zones</p>
          </div>
        </div>

        <button
          onClick={() => setMarkingMode(!markingMode)}
          style={{ ...styles.markBtn, ...(markingMode ? styles.markBtnActive : {}) }}
        >
          {markingMode ? '✕ Cancel Selection' : '📍 Mark Unsafe Corridor'}
        </button>

        {markingMode && (
          <form onSubmit={handleMarkRoad} style={styles.form}>
            <div style={styles.infoBanner}>
              👆 Click a point on the map to set coordinates
            </div>

            <label style={styles.label}>Road / Area Name</label>
            <input
              placeholder="e.g. Silk Board Junction"
              value={newUnsafe.road_name}
              onChange={e => setNewUnsafe({ ...newUnsafe, road_name: e.target.value })}
              style={styles.input}
              required
            />

            <label style={styles.label}>Reason</label>
            <input
              placeholder="e.g. Chemical Spill, Heavy Smog"
              value={newUnsafe.reason}
              onChange={e => setNewUnsafe({ ...newUnsafe, reason: e.target.value })}
              style={styles.input}
              required
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <input readOnly placeholder="Lat" value={newUnsafe.lat ? newUnsafe.lat.toFixed(4) : ''} style={{ ...styles.input, opacity: 0.5, flex: 1 }} />
              <input readOnly placeholder="Lng" value={newUnsafe.lng ? newUnsafe.lng.toFixed(4) : ''} style={{ ...styles.input, opacity: 0.5, flex: 1 }} />
            </div>

            <button type="submit" style={saving ? { ...styles.confirmBtn, opacity: 0.6 } : styles.confirmBtn} disabled={saving}>
              {saving ? 'Saving...' : '✅ Confirm Restriction'}
            </button>
          </form>
        )}

        <div style={styles.restrictionList}>
          <div style={styles.restrictionListTitle}>🚫 Active Restrictions ({roads.length})</div>
          {roads.length === 0 ? (
            <p style={{ color: '#334155', fontSize: '0.8rem', fontStyle: 'italic' }}>No restrictions active.</p>
          ) : (
            roads.map(road => (
              <div key={road.id} style={styles.roadCard}>
                <div style={styles.roadCardTop}>
                  <span style={styles.roadName}>{road.road_name}</span>
                  <span style={styles.roadWarning}>⚠</span>
                </div>
                <p style={styles.roadReason}>{road.reason}</p>
                <div style={styles.roadMeta}>
                  <span>Radius: {road.radius}km</span>
                  <span>{new Date(road.marked_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div style={styles.mapWrapper}>
        <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapClickHandler />
          {roads.map(road => (
            <Marker key={road.id} position={[road.lat, road.lng]} icon={unsafeIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>{road.road_name}</strong>
                  <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.75rem', marginTop: '4px' }}>
                    ⚠ UNSAFE: {road.reason}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          {newUnsafe.lat && (
            <Marker position={[newUnsafe.lat, newUnsafe.lng]} icon={unsafeIcon} />
          )}
        </MapContainer>

        {/* Live badge */}
        <div style={styles.liveBadge}>
          <span style={styles.liveDot} />
          Live Traffic Rerouting Active
        </div>

        {/* Cursor mode indicator */}
        {markingMode && (
          <div style={styles.cursorMode}>
            🎯 Click on the map to mark unsafe zone
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem',
    height: 'calc(100vh - 160px)',
  },
  sidebar: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px', padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '12px',
    overflowY: 'auto',
  },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
  sidebarIcon: {
    width: '42px', height: '42px', background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
  },
  sidebarTitle: { color: '#f1f5f9', fontSize: '0.95rem', fontWeight: '800', margin: 0, fontFamily: "'Inter', sans-serif" },
  sidebarSub: { color: '#475569', fontSize: '0.73rem', fontWeight: '500', margin: 0 },
  markBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '12px', color: '#94a3b8',
    fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
  },
  markBtnActive: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  infoBanner: {
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '10px', padding: '10px 12px', color: '#818cf8',
    fontSize: '0.78rem', fontWeight: '600', lineHeight: 1.5,
  },
  label: { color: '#64748b', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '10px', padding: '10px 14px', color: '#f1f5f9', fontSize: '0.82rem',
    outline: 'none', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
  },
  confirmBtn: {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    border: 'none', borderRadius: '12px', padding: '12px',
    color: '#fff', fontWeight: '800', fontSize: '0.85rem',
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  },
  restrictionList: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  restrictionListTitle: {
    color: '#475569', fontSize: '0.68rem', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px',
  },
  roadCard: {
    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)',
    borderRadius: '12px', padding: '10px 12px',
  },
  roadCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  roadName: { color: '#f1f5f9', fontWeight: '700', fontSize: '0.82rem', fontFamily: "'Inter', sans-serif" },
  roadWarning: { color: '#f59e0b', fontSize: '1rem' },
  roadReason: { color: '#64748b', fontSize: '0.73rem', margin: '0 0 6px 0' },
  roadMeta: { display: 'flex', justifyContent: 'space-between', color: '#334155', fontSize: '0.68rem', fontWeight: '600' },
  mapWrapper: {
    borderRadius: '20px', overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)', position: 'relative',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  liveBadge: {
    position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
    background: 'rgba(10,12,22,0.9)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
    padding: '10px 16px', color: '#f1f5f9', fontSize: '0.82rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter', sans-serif",
  },
  liveDot: {
    width: '8px', height: '8px', background: '#10b981',
    borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 6px #10b981',
  },
  cursorMode: {
    position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 1000, background: 'rgba(10,12,22,0.9)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px',
    padding: '10px 20px', color: '#818cf8', fontSize: '0.82rem', fontWeight: '700',
    fontFamily: "'Inter', sans-serif",
  },
};

export default AdminRouteMonitor;
