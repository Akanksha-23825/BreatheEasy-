import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Locate, 
  Layers, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

export default function MapArea({
  routes,
  selectedRouteId,
  onSelectRoute,
  stations,
  selectedStation,
  onSelectStation,
  navigationActive,
  navState,
  sourceText = "Indiranagar, Bangalore",
  destinationText = "MG Road Metro, Bangalore"
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapLayer, setMapLayer] = useState('standard');

  // Find currently selected route
  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // Calculate current animation position
  let navPosition = [150, 650]; // Indiranagar starting
  if (navigationActive && activeRoute) {
    const points = activeRoute.pathPoints;
    const index = Math.min(navState.currentPointIndex, points.length - 1);
    navPosition = points[index] || navPosition;
  } else if (activeRoute) {
    // default to start of route
    navPosition = activeRoute.pathPoints[0];
  }

  // Color protocols for AQI values
  const getAqiColor = (aqi) => {
    if (aqi <= 50) return '#00685f'; // Green
    if (aqi <= 100) return '#eab308'; // Orange/Yellow
    if (aqi <= 150) return '#f97316'; // Sensitive Orange
    return '#ba1a1a'; // Red
  };

  const getAqiBgOpacity = (aqi) => {
    if (aqi <= 50) return 'rgba(0, 104, 95, 0.15)';
    if (aqi <= 100) return 'rgba(234, 179, 8, 0.15)';
    if (aqi <= 150) return 'rgba(249, 115, 22, 0.15)';
    return 'rgba(186, 26, 26, 0.15)';
  };

  return (
    <div className="absolute inset-0 z-0 bg-[#eef2f3] overflow-hidden select-none">
      {/* Interactive Map Wrapper */}
      <div 
        className="relative w-full h-full mt-16 md:mt-0 transition-transform duration-500 ease-out origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* SVG Map Graphics */}
        <svg 
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Grayscale standard map background grid lines */}
          <g opacity={mapLayer === 'satellite' ? 0.3 : 0.8}>
            {/* Major Arterial Roads in Bangalore */}
            <path d="M0,100 L1000,100" stroke="#d5dbd9" strokeWidth="4" />
            <path d="M0,450 L1000,450" stroke="#d5dbd9" strokeWidth="6" />
            <path d="M0,700 L1000,700" stroke="#d5dbd9" strokeWidth="4" />
            <path d="M100,0 L100,800" stroke="#d5dbd9" strokeWidth="4" />
            <path d="M500,0 L500,800" stroke="#d5dbd9" strokeWidth="5" />
            <path d="M850,0 L850,800" stroke="#d5dbd9" strokeWidth="4" />

            {/* Inner Ring Roads & Flyovers */}
            <path d="M200,800 L200,0" stroke="#e4e9e7" strokeWidth="3" />
            <path d="M150,650 Q450,550 850,250" stroke="#dee4e1" strokeWidth="12" fill="none" opacity="0.6" />
            <path d="M150,650 Q520,380 920,440" stroke="#dee4e1" strokeWidth="8" fill="none" opacity="0.5" />
            <path d="M520,120 L850,250" stroke="#dee4e1" strokeWidth="10" fill="none" opacity="0.5" />

            {/* Bangalore Green Reservoirs / Parks (Cubbon Park) */}
            <rect x="350" y="320" width="150" height="120" rx="20" fill="#a7f3d0" opacity="0.5" />
            <text x="425" y="385" fill="#047857" fontSize="13" fontWeight="bold" textAnchor="middle">Cubbon Park</text>

            {/* Ulsoor Lake */}
            <path d="M680,240 C730,220 780,240 760,290 C740,320 690,310 680,240 Z" fill="#93c5fd" opacity="0.7" />
            <text x="730" y="275" fill="#1e3a8a" fontSize="11" fontWeight="bold" textAnchor="middle">Ulsoor Lake</text>

            {/* HAL Forest / Golf Course */}
            <rect x="20" y="550" width="110" height="90" rx="10" fill="#a7f3d0" opacity="0.4" />
            <text x="75" y="600" fill="#047857" fontSize="11" textAnchor="middle">HAL Reserve</text>
          </g>

          {/* AQI Heatmap Layer overlay */}
          {mapLayer === 'aqi-heatmap' && (
            <g opacity="0.4">
              {/* Circular thermal blobs for pollution */}
              <circle cx="480" cy="720" r="160" fill="url(#redGrad)" />
              <circle cx="920" cy="440" r="140" fill="url(#redGrad)" />
              <circle cx="520" cy="120" r="110" fill="url(#orangeGrad)" />
              <circle cx="850" cy="250" r="130" fill="url(#orangeGrad)" />
              <circle cx="150" cy="650" r="100" fill="url(#greenGrad)" />
              <circle cx="420" cy="380" r="120" fill="url(#greenGrad)" />
            </g>
          )}

          {/* Definitions for Gradients */}
          <defs>
            <radialGradient id="redGrad">
              <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orangeGrad">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="greenGrad">
              <stop offset="0%" stopColor="#00685f" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00685f" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Inactive Route Lines (drawn underneath active) */}
          {routes.map(route => {
            if (route.id === selectedRouteId) return null;
            let strokeColor = "#dee4e1";
            let dashArray = "10 5";
            let width = "5";
            if (route.category === 'Safe') {
              strokeColor = "rgba(0, 104, 95, 0.4)";
              width = "6";
            } else if (route.category === 'Dangerous') {
              strokeColor = "rgba(186, 26, 26, 0.35)";
            } else {
              strokeColor = "rgba(234, 179, 8, 0.4)";
            }

            // Convert points to SVG polyline string
            const pointsStr = route.pathPoints.map(p => p.join(',')).join(' ');

            return (
              <polyline
                key={route.id}
                points={pointsStr}
                fill="none"
                stroke={strokeColor}
                strokeWidth={width}
                strokeDasharray={dashArray}
                strokeLinecap="round"
                className="cursor-pointer hover:stroke-slate-400 transition-colors"
                onClick={() => onSelectRoute(route.id)}
              />
            );
          })}

          {/* Active Highlighted Route Line */}
          {activeRoute && (
            <polyline
              points={activeRoute.pathPoints.map(p => p.join(',')).join(' ')}
              fill="none"
              stroke={
                activeRoute.category === 'Safe' 
                  ? '#00685f' 
                  : activeRoute.category === 'Dangerous' 
                    ? '#ba1a1a' 
                    : '#eab308'
              }
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            />
          )}

          {/* Dynamic arrows showing flow direction along route */}
          {activeRoute && activeRoute.pathPoints.length > 2 && (
            <g opacity="0.8">
              {activeRoute.pathPoints.map((pt, i) => {
                if (i === 0 || i % 3 !== 0) return null;
                const prev = activeRoute.pathPoints[i - 1];
                const angle = Math.atan2(pt[1] - prev[1], pt[0] - prev[0]) * (180 / Math.PI);
                return (
                  <path
                    key={`arrow-${i}`}
                    d="M-5,-4 L5,0 L-5,4 Z"
                    fill="#ffffff"
                    transform={`translate(${pt[0]}, ${pt[1]}) rotate(${angle})`}
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Ambient particulate layers for active pollution zone indicators */}
        <div className="absolute inset-0 pointer-events-none">
          {stations.map(station => (
            <div
              key={`pulse-${station.id}`}
              className="absolute rounded-full pulse-aqi"
              style={{
                left: `${station.x}px`,
                top: `${station.y}px`,
                width: `${station.aqi}px`,
                height: `${station.aqi}px`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: getAqiBgOpacity(station.aqi),
              }}
            />
          ))}
        </div>

        {/* Clickable AQI Monitoring Station Node Markers */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {stations.map(station => {
            const isStationSelected = selectedStation?.id === station.id;
            return (
              <div
                key={station.id}
                className="absolute pointer-events-auto cursor-pointer"
                style={{
                  left: `${station.x}px`,
                  top: `${station.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => onSelectStation(station)}
              >
                {/* Visual Pin */}
                <div 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md border transition-all hover:scale-110 active:scale-95 ${
                    isStationSelected 
                      ? 'bg-slate-900 text-white scale-105 border-slate-900' 
                      : 'bg-white text-slate-800 border-[#bcc9c6]'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0" 
                    style={{ backgroundColor: getAqiColor(station.aqi) }}
                  />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-bold tracking-tight max-w-[80px] truncate">{station.name.split(' ')[0]}</span>
                    <span className="text-[11px] font-extrabold mt-0.5" style={{ color: isStationSelected ? '#89f5e7' : getAqiColor(station.aqi) }}>
                      AQI {station.aqi}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Best Health Route Floating Map Badge */}
        {activeRoute && activeRoute.category === 'Safe' && !navigationActive && (
          <div 
            className="absolute top-[48%] left-[55%] pointer-events-auto bg-[#00685f] text-white px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg animate-bounce"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#89f5e7]" />
            <span>BEST HEALTH ROUTE</span>
          </div>
        )}

        {/* Live GPS Navigator Node Marker (with pulsing arrow) */}
        <div 
          className="absolute transition-all duration-300 ease-out z-30"
          style={{ 
            left: `${navPosition[0]}px`, 
            top: `${navPosition[1]}px`,
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Live radar wave ring */}
            <div className="absolute w-12 h-12 rounded-full border-2 border-[#0051d5] bg-[#316bf3]/10 animate-ping opacity-60" />
            <div className="absolute w-8 h-8 rounded-full bg-[#0051d5]/20 animate-pulse" />
            {/* The navigator pointer arrow */}
            <div className="w-6 h-6 bg-[#0051d5] border-2 border-white rounded-full flex items-center justify-center shadow-lg transform rotate-45">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white transform -rotate-45 fill-white">
                <path d="M12,2L4,21L12,17L20,21L12,2Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Destination Pin overlay on source & endpoint */}
      {activeRoute && (
        <>
          {/* Source Anchor */}
          <div 
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            style={{ 
              left: `${activeRoute.pathPoints[0][0]}px`, 
              top: `${activeRoute.pathPoints[0][1]}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-[#00685f] text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap mb-1">
              Start
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#00685f] border-2 border-white shadow-md" />
          </div>

          {/* Destination Anchor */}
          <div 
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            style={{ 
              left: `${activeRoute.pathPoints[activeRoute.pathPoints.length-1][0]}px`, 
              top: `${activeRoute.pathPoints[activeRoute.pathPoints.length-1][1]}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-[#316bf3] text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap mb-1">
              Goal
            </div>
            <div className="w-4.5 h-4.5 rounded-full bg-[#316bf3] border-2 border-white shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </>
      )}

      {/* Destination banner search mock input Overlay (matches visual references) */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none z-30">
        <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-[#bcc9c6]/40 flex items-center gap-3 w-80 pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-[#00685f]/10 flex items-center justify-center text-[#00685f]">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#3d4947]">CURRENT ROUTE DESTINATION</div>
            <div className="text-xs font-bold text-[#171d1c] truncate">{destinationText}</div>
          </div>
        </div>
      </div>

      {/* Legend & layer controls (matches screen results) */}
      <div className="absolute bottom-24 md:bottom-8 left-6 bg-white border border-[#bcc9c6]/50 p-4 rounded-2xl shadow-md space-y-2 pointer-events-auto z-30">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#3d4947] mb-2">Air Quality Index Scale</div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-[#00685f]" style={{ backgroundColor: 'rgba(0, 104, 95, 0.15)' }} />
            <span className="text-xs font-semibold text-[#3d4947]">Safe Air (AQI 0 - 50)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-[#eab308]" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }} />
            <span className="text-xs font-semibold text-[#3d4947]">Moderate (AQI 51 - 100)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-[#ba1a1a]" style={{ backgroundColor: 'rgba(186, 26, 26, 0.15)' }} />
            <span className="text-xs font-semibold text-[#3d4947]">Sensitive / Hazardous (AQI 100+)</span>
          </div>
        </div>
      </div>

      {/* Map Action Control Buttons (matches screenshots) */}
      <div className="absolute bottom-24 md:bottom-8 right-8 flex flex-col gap-4 pointer-events-auto z-30">
        <div className="flex flex-col bg-white rounded-xl shadow-lg border border-[#bcc9c6]/40 overflow-hidden">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
            className="p-3 text-slate-700 hover:bg-slate-100 border-b border-slate-100 transition-colors active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
            className="p-3 text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={() => {
            setZoomLevel(1);
            alert('Map Centered on GPS Location (Bangalore Centroid)');
          }}
          className="bg-white text-[#00685f] w-12 h-12 rounded-full shadow-lg flex items-center justify-center border border-[#bcc9c6]/40 hover:bg-slate-100 transition-colors active:scale-95"
          title="Recenter Map"
        >
          <Locate className="w-5 h-5" />
        </button>

        {/* Layer Selector */}
        <div className="relative group">
          <button 
            className="bg-white text-slate-700 w-12 h-12 rounded-full shadow-lg flex items-center justify-center border border-[#bcc9c6]/40 hover:bg-slate-100 transition-colors active:scale-95"
            title="Toggle Map Layers"
          >
            <Layers className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 right-14 bg-white border border-[#bcc9c6] rounded-xl shadow-xl p-2 hidden group-hover:block whitespace-nowrap space-y-1">
            <button 
              onClick={() => setMapLayer('standard')}
              className={`block w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg ${mapLayer === 'standard' ? 'bg-[#00685f] text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            >
              Standard Map
            </button>
            <button 
              onClick={() => setMapLayer('satellite')}
              className={`block w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg ${mapLayer === 'satellite' ? 'bg-[#00685f] text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            >
              Satellite Terrain
            </button>
            <button 
              onClick={() => setMapLayer('aqi-heatmap')}
              className={`block w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg ${mapLayer === 'aqi-heatmap' ? 'bg-[#00685f] text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            >
              AQI Heatmap Overlay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
