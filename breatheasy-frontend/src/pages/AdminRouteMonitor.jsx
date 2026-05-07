import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Popup, Marker, useMapEvents } from 'react-leaflet';
import { FiActivity, FiSlash, FiAlertTriangle } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom marker for "marking unsafe"
const unsafeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const AdminRouteMonitor = () => {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingMode, setMarkingMode] = useState(false);
  const [newUnsafe, setNewUnsafe] = useState({ road_name: '', reason: '', lat: null, lng: null });

  useEffect(() => {
    fetchRoads();
  }, []);

  const fetchRoads = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/roads');
      setRoads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRoad = async (e) => {
    e.preventDefault();
    if (!newUnsafe.lat || !newUnsafe.lng) {
      alert("Click on the map to select coordinates");
      return;
    }
    try {
      await axios.post('http://127.0.0.1:5000/api/admin/roads', newUnsafe);
      setNewUnsafe({ road_name: '', reason: '', lat: null, lng: null });
      setMarkingMode(false);
      fetchRoads();
    } catch (err) {
      alert("Failed to mark road");
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (markingMode) {
          setNewUnsafe({ ...newUnsafe, lat: e.latlng.lat, lng: e.latlng.lng });
        }
      },
    });
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)]">
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FiSlash className="text-red-500" />
            Route Intelligence
          </h3>
          
          <button 
            onClick={() => setMarkingMode(!markingMode)}
            className={`w-full py-3 rounded-xl font-bold mb-6 transition-all border
              ${markingMode ? 'bg-red-500 text-white border-red-400' : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30'}
            `}
          >
            {markingMode ? 'Cancel Selection' : 'Mark Unsafe Corridor'}
          </button>

          {markingMode && (
            <form onSubmit={handleMarkRoad} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs leading-relaxed mb-4">
                Click a point on the map where pollution or congestion is extremely high.
              </div>
              
              <input 
                placeholder="Road / Area Name"
                value={newUnsafe.road_name}
                onChange={(e) => setNewUnsafe({...newUnsafe, road_name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                required
              />
              <input 
                placeholder="Reason (e.g. Chemical Leak, Gridlock)"
                value={newUnsafe.reason}
                onChange={(e) => setNewUnsafe({...newUnsafe, reason: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                required
              />
              <div className="flex gap-2">
                <input readOnly placeholder="Lat" value={newUnsafe.lat || ''} className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs opacity-50" />
                <input readOnly placeholder="Lng" value={newUnsafe.lng || ''} className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs opacity-50" />
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20">
                Confirm Restriction
              </button>
            </form>
          )}

          <div className="mt-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Restricted Corridors</h4>
            <div className="space-y-3">
              {roads.map(road => (
                <div key={road.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-white text-sm">{road.road_name}</p>
                    <FiAlertTriangle className="text-orange-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{road.reason}</p>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Radius: {road.radius}km</span>
                    <span>{new Date(road.marked_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {roads.length === 0 && <p className="text-slate-500 text-xs italic">No restrictions active.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
        <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapClickHandler />
          
          {/* Visualizing restricted areas */}
          {roads.map(road => (
            <React.Fragment key={road.id}>
              <Marker position={[road.lat, road.lng]} icon={unsafeIcon}>
                <Popup>
                  <div className="font-bold">{road.road_name}</div>
                  <div className="text-xs text-red-600 uppercase font-bold">UNSAFE: {road.reason}</div>
                </Popup>
              </Marker>
              <L.Circle 
                center={[road.lat, road.lng]} 
                radius={road.radius * 1000} 
                pathOptions={{ fillColor: 'red', color: 'red', weight: 1, fillOpacity: 0.15 }}
              />
            </React.Fragment>
          ))}

          {/* New selection marker */}
          {newUnsafe.lat && (
             <Marker position={[newUnsafe.lat, newUnsafe.lng]} icon={unsafeIcon} />
          )}
        </MapContainer>

        <div className="absolute top-6 right-6 z-[1000] bg-slate-900/90 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-white text-sm font-bold">Live Traffic Rerouting Active</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRouteMonitor;
