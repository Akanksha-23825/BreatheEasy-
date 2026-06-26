import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as MapTooltip } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const getColor = (val, type) => {
  if (type === 'aqi') {
    if (val > 200) return '#ef4444';
    if (val > 150) return '#f59e0b';
    if (val > 100) return '#facc15';
    return '#10b981';
  }
  if (val > 250) return '#7f1d1d';
  if (val > 150) return '#ef4444';
  if (val > 80) return '#f59e0b';
  return '#10b981';
};

const legend = [
  { color: '#10b981', label: 'Safe / Low Risk' },
  { color: '#facc15', label: 'Moderate' },
  { color: '#f59e0b', label: 'Dangerous' },
  { color: '#ef4444', label: 'Critical Exposure' },
];

const AdminHeatmap = () => {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState('aqi');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/admin/heatmap-advanced/Bengaluru')
      .then(res => setData(res.data.stations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 160px)' }}>
      {/* Controls */}
      <div style={styles.controls}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setMode('aqi')}
            style={{ ...styles.modeBtn, ...(mode === 'aqi' ? styles.modeBtnActive : {}) }}
          >
            🗺 Raw AQI Map
          </button>
          <button
            onClick={() => setMode('exposure')}
            style={{ ...styles.modeBtn, ...(mode === 'exposure' ? styles.modeBtnActiveOrange : {}) }}
          >
            👥 Human Exposure Risk
          </button>
        </div>
        <span style={styles.note}>* Exposure risk integrates population density & historical vulnerability</span>
      </div>

      {/* Map */}
      <div style={styles.mapWrapper}>
        {loading ? (
          <div style={styles.loadingOverlay}>Calculating risk surfaces...</div>
        ) : (
          <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />
            {data.map((station, i) => {
              const val = mode === 'aqi' ? station.aqi : station.exposure_risk;
              return (
                <CircleMarker
                  key={i}
                  center={[station.lat, station.lng]}
                  radius={mode === 'aqi' ? 14 : 22}
                  pathOptions={{ fillColor: getColor(val, mode), color: 'rgba(255,255,255,0.3)', weight: 1.5, fillOpacity: 0.65 }}
                >
                  <MapTooltip>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', background: '#0d1117', color: '#f1f5f9', padding: '6px 10px', borderRadius: '8px' }}>
                      <strong>{station.station}</strong><br />
                      {mode === 'aqi' ? `AQI: ${station.aqi}` : `Exposure Risk: ${station.exposure_risk}`}
                    </div>
                  </MapTooltip>
                  <Popup>
                    <div style={{ fontFamily: 'Inter, sans-serif', padding: '8px', minWidth: '160px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{station.station}</strong>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '8px' }}>Station Metrics</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div style={styles.popupCell}><div style={styles.popupLabel}>AQI</div><div style={styles.popupVal}>{station.aqi}</div></div>
                        <div style={styles.popupCell}><div style={styles.popupLabel}>Exposure</div><div style={{ ...styles.popupVal, color: '#f59e0b' }}>{station.exposure_risk}</div></div>
                        <div style={{ ...styles.popupCell, gridColumn: 'span 2' }}><div style={styles.popupLabel}>Pop Density</div><div style={styles.popupVal}>{station.pop_density_level}</div></div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}

        {/* Legend overlay */}
        <div style={styles.legend}>
          <div style={styles.legendTitle}>Risk Legend</div>
          {legend.map(l => (
            <div key={l.label} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: l.color }} />
              <span style={styles.legendLabel}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  controls: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '1rem 1.25rem',
  },
  modeBtn: {
    padding: '10px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem',
    cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: "'Inter', sans-serif",
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b',
  },
  modeBtnActive: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' },
  modeBtnActiveOrange: { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' },
  note: { color: '#334155', fontSize: '0.75rem', fontStyle: 'italic', fontFamily: "'Inter', sans-serif" },
  mapWrapper: {
    flex: 1, borderRadius: '20px', overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)', position: 'relative',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minHeight: '500px',
  },
  loadingOverlay: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#64748b', fontSize: '0.9rem',
    background: '#060910',
  },
  legend: {
    position: 'absolute', bottom: '24px', right: '24px', zIndex: 1000,
    background: 'rgba(10,12,22,0.88)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
    padding: '12px 16px', minWidth: '160px',
  },
  legendTitle: { color: '#475569', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendLabel: { color: '#94a3b8', fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Inter', sans-serif" },
  popupCell: { background: '#f1f5f9', padding: '6px', borderRadius: '6px', textAlign: 'center' },
  popupLabel: { fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' },
  popupVal: { fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' },
};

export default AdminHeatmap;
