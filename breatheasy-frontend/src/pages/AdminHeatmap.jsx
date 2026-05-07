import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as MapTooltip } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const AdminHeatmap = () => {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState('aqi'); // 'aqi' or 'exposure'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/admin/heatmap-advanced/Bengaluru');
        setData(res.data.stations);
      } catch (err) {
        console.error("Error fetching heatmap:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  const getColor = (val, type) => {
    if (type === 'aqi') {
      if (val > 200) return '#ef4444';
      if (val > 150) return '#f59e0b';
      if (val > 100) return '#facc15';
      return '#10b981';
    } else {
      // Exposure risk scale (approx 0-400)
      if (val > 250) return '#7f1d1d';
      if (val > 150) return '#ef4444';
      if (val > 80) return '#f59e0b';
      return '#10b981';
    }
  };

  if (loading) return <div className="text-white">Calculating Risk Surfaces...</div>;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex justify-between items-center">
        <div className="flex gap-4">
          <button 
            onClick={() => setMode('aqi')}
            className={`px-6 py-2 rounded-xl transition-all ${mode === 'aqi' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-400'}`}
          >
            Raw AQI Map
          </button>
          <button 
            onClick={() => setMode('exposure')}
            className={`px-6 py-2 rounded-xl transition-all ${mode === 'exposure' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-slate-400'}`}
          >
            Human Exposure Risk
          </button>
        </div>
        <div className="text-sm text-slate-400 italic">
          *Exposure Risk integrates population density & historical vulnerability
        </div>
      </div>

      <div className="flex-1 min-h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
        <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {data.map((station, i) => {
            const val = mode === 'aqi' ? station.aqi : station.exposure_risk;
            return (
              <CircleMarker
                key={i}
                center={[station.lat, station.lng]}
                radius={mode === 'aqi' ? 15 : 25}
                pathOptions={{ 
                  fillColor: getColor(val, mode),
                  color: 'white',
                  weight: 1,
                  fillOpacity: 0.6
                }}
              >
                <MapTooltip permanent={false}>
                   <div className="bg-slate-900 text-white border-none shadow-none">
                      <strong>{station.station}</strong><br/>
                      {mode === 'aqi' ? `AQI: ${station.aqi}` : `Exposure Risk: ${station.exposure_risk}`}
                   </div>
                </MapTooltip>
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold text-slate-900">{station.station}</h4>
                    <p className="text-sm text-slate-600 mb-2">Detailed Station Metrics</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-slate-100 p-2 rounded text-center">
                        <p className="text-[10px] uppercase text-slate-400">AQI</p>
                        <p className="font-bold">{station.aqi}</p>
                      </div>
                      <div className="bg-slate-100 p-2 rounded text-center">
                        <p className="text-[10px] uppercase text-slate-400">Exposure</p>
                        <p className="font-bold text-orange-600">{station.exposure_risk}</p>
                      </div>
                      <div className="bg-slate-100 p-2 rounded text-center col-span-2">
                        <p className="text-[10px] uppercase text-slate-400">Vulnerable Pop Density</p>
                        <p className="font-bold">{station.pop_density_level}</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-10 right-10 z-[1000] bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white w-48">
          <h5 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">Risk Legend</h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span> Safe / Low Risk
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Moderate Risk
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Dangerous
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-[#7f1d1d]"></span> Critical Exposure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeatmap;
