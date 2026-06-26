import React from 'react';
import { 
  BarChart3, 
  Info, 
  X, 
  Compass, 
  Activity, 
  Home, 
  Wind, 
  Shield,
  CalendarDays
} from 'lucide-react';
import { WEEKLY_EXPOSURE_DATA, PROTECTIVE_ACTIONS } from '../data';

export default function HealthDashboard({
  selectedStation,
  onCloseStation,
  selectedProfile,
  selectedFeeling,
  pollenAlertActive
}) {

  // Dynamic advice according to selected station AQI
  const getStationAdvice = (aqi) => {
    if (aqi <= 50) return 'Air quality is excellent. No precautions needed for any profile.';
    if (aqi <= 100) return 'Asthma and sensitive respiratory profiles should limit heavy outdoor cardio.';
    if (aqi <= 150) return 'Unhealthy for sensitive groups. Wear a protective mask and take frequent breaks.';
    return 'Hazardous air pocket. Avoid outdoor exposure entirely. Keep windows sealed.';
  };

  const getStationAqiColorClass = (aqi) => {
    if (aqi <= 50) return 'text-[#00685f]';
    if (aqi <= 100) return 'text-amber-600';
    if (aqi <= 150) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStationAqiPillClass = (aqi) => {
    if (aqi <= 50) return 'bg-[#e6f4f1] text-[#00685f]';
    if (aqi <= 100) return 'bg-amber-50 text-amber-900 border-amber-200';
    if (aqi <= 150) return 'bg-orange-50 text-orange-900 border-orange-200';
    return 'bg-red-50 text-red-900 border-red-200';
  };

  // Determine dynamic safe outdoor window hours based on health profile & current feelings
  const getSafeHoursLeft = () => {
    let base = 8.5;
    if (selectedProfile === 'Asthma') base -= 3.0;
    if (selectedProfile === 'Heart Disease') base -= 2.5;
    if (selectedProfile === 'Child' || selectedProfile === 'Elderly') base -= 1.5;
    
    if (selectedFeeling === 'Shortness of Breath 😮‍💨') base -= 2.5;
    if (selectedFeeling === 'Mild Cough 🤧') base -= 1.5;
    if (selectedFeeling === 'Tired 😴') base -= 0.5;

    return Math.max(Number(base.toFixed(1)), 1.5);
  };

  const safeHours = getSafeHoursLeft();
  const percentageSafeLeft = Math.round((safeHours / 10) * 100);

  // Helper to map generic protective action icons
  const renderActionIcon = (iconName) => {
    switch (iconName) {
      case 'Masks': return <Shield className="w-4.5 h-4.5" />;
      case 'Wind': return <Wind className="w-4.5 h-4.5" />;
      case 'Home': return <Home className="w-4.5 h-4.5" />;
      case 'CalendarDays': return <CalendarDays className="w-4.5 h-4.5" />;
      default: return <Activity className="w-4.5 h-4.5" />;
    }
  };

  return (
    <div className="w-full md:w-[420px] bg-white h-full overflow-y-auto custom-scrollbar border-r border-[#bcc9c6] z-10 flex flex-col p-4 md:p-6 select-none shadow-md gap-6">
      
      {/* 1. Live Station Feed Card */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="font-sans text-sm font-extrabold text-[#3d4947] uppercase tracking-widest">
              Live Station Feed
            </h3>
            <p className="text-xs text-[#3d4947] opacity-80">Click pins on the map to inspect live data</p>
          </div>
          {selectedStation && (
            <button 
              onClick={onCloseStation}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              title="Clear selected station focus"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Station card details */}
        {(() => {
          const s = selectedStation || {
            id: 'st-2',
            name: 'Indiranagar Station',
            aqi: 42,
            category: 'Good',
            pm25: 12,
            pm10: 22,
            no2: 8,
            o3: 4,
            desc: 'Excellent residential canopy. Safe for all outdoor activities and exercise.',
            lat: '12.9719° N',
            lng: '77.6412° E'
          };

          return (
            <div className="bg-[#f0f5f2] border border-[#bcc9c6]/60 rounded-2xl p-5 shadow-sm space-y-4 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-sans text-base font-extrabold text-[#171d1c] leading-tight">
                    {s.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider mt-0.5">
                    COORDINATES: {s.lat}, {s.lng}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#00685f] bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-[#00685f] rounded-full animate-ping" />
                  Live Feed
                </span>
              </div>

              {/* Circle Gauge & Advice Summary Row */}
              <div className="flex items-center gap-5">
                <div 
                  className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 bg-white shrink-0 shadow-inner"
                  style={{ borderColor: s.aqi <= 50 ? '#00685f' : s.aqi <= 100 ? '#eab308' : '#ba1a1a' }}
                >
                  <span className={`text-2xl font-black ${getStationAqiColorClass(s.aqi)}`}>
                    {s.aqi}
                  </span>
                  <span className="text-[8px] font-bold text-[#3d4947] uppercase tracking-widest leading-none mt-0.5">AQI</span>
                </div>
                <div className="space-y-1.5">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold inline-block border ${getStationAqiPillClass(s.aqi)}`}>
                    {s.category}
                  </span>
                  <p className="text-xs leading-tight text-[#3d4947] font-semibold">
                    "{s.desc}"
                  </p>
                </div>
              </div>

              {/* Detailed Pollutants Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/80 p-3 rounded-xl border border-[#bcc9c6]/30">
                  <p className="text-[9px] font-bold text-[#3d4947] uppercase tracking-wider">PM2.5 Concentration</p>
                  <p className="text-sm font-black text-[#171d1c] mt-0.5">{s.pm25} <span className="text-[10px] font-normal text-[#3d4947]">µg/m³</span></p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-[#bcc9c6]/30">
                  <p className="text-[9px] font-bold text-[#3d4947] uppercase tracking-wider">PM10 Coarse Dust</p>
                  <p className="text-sm font-black text-[#171d1c] mt-0.5">{s.pm10} <span className="text-[10px] font-normal text-[#3d4947]">µg/m³</span></p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-[#bcc9c6]/30">
                  <p className="text-[9px] font-bold text-[#3d4947] uppercase tracking-wider">NO2 Nitrogen Dioxide</p>
                  <p className="text-sm font-black text-[#171d1c] mt-0.5">{s.no2} <span className="text-[10px] font-normal text-[#3d4947]">ppb</span></p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-[#bcc9c6]/30">
                  <p className="text-[9px] font-bold text-[#3d4947] uppercase tracking-wider">Ground Ozone O3</p>
                  <p className="text-sm font-black text-[#171d1c] mt-0.5">{s.o3} <span className="text-[10px] font-normal text-[#3d4947]">ppb</span></p>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 font-bold uppercase text-right tracking-widest pt-1">
                Data Source: CPCB Bangalore Air Central
              </p>
            </div>
          );
        })()}
      </div>

      {/* 2. Personal Health Dashboard section */}
      <div className="space-y-4">
        <h3 className="font-sans text-sm font-extrabold text-[#3d4947] uppercase tracking-widest">
          Personal Wellness Metrics
        </h3>

        {/* Bento Card: Outdoor window hours gauge */}
        <div className="bg-[#00685f] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute right-[-15px] top-[-15px] opacity-10">
            <Compass className="w-28 h-28" />
          </div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-1">SAFE OUTDOOR WINDOW</h4>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-4xl font-black">{safeHours}</span>
            <span className="text-sm font-semibold opacity-90">hours remaining today</span>
          </div>
          {/* Progress bar budget */}
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-500" 
              style={{ width: `${percentageSafeLeft}%` }}
            />
          </div>
          <p className="text-[10px] opacity-80 mt-3.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#89f5e7] shrink-0" />
            Budget shifts dynamically based on your {selectedProfile} profile.
          </p>
        </div>

        {/* Bento Card: Weekly Exposure Bar Chart */}
        <div className="bg-[#f0f5f2] p-5 rounded-2xl border border-[#bcc9c6]/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-[#3d4947] uppercase tracking-wider">Weekly Pollution Inhalation</h4>
            <BarChart3 className="w-4 h-4 text-[#00685f]" />
          </div>

          <div className="flex items-end justify-between h-24 gap-3 mb-2.5">
            {WEEKLY_EXPOSURE_DATA.map((d) => {
              const maxExposure = 100;
              const barHeight = `${(d.exposure / maxExposure) * 100}%`;
              const isToday = d.day === 'T';

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    AQI {d.avgAqi}
                  </div>
                  <div 
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isToday ? 'bg-[#316bf3]' : 'bg-[#00685f]/50 group-hover:bg-[#00685f]'
                    }`}
                    style={{ height: barHeight }}
                  />
                  <span className={`text-[10px] font-bold mt-2 ${isToday ? 'text-[#316bf3]' : 'text-[#3d4947]'}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#3d4947] leading-relaxed">
            Your cumulative inhaled particles are <span className="font-extrabold text-[#00685f]">12% lower</span> than last week, avoiding approx. <span className="font-bold">4.2 mg</span> of dust.
          </p>
        </div>

        {/* Bento Card: Personalized Advisory */}
        <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl flex items-start gap-3">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-900 shrink-0">
            <Info className="w-4.5 h-4.5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-amber-950 mb-0.5">Evening Advisory</h5>
            <p className="text-xs text-[#3d4947] leading-snug">
              Atmospheric inversion layer settles over Bangalore after sunset. Limit cardio exercise between 6 PM and 9 PM when vehicular PM2.5 levels peak.
            </p>
          </div>
        </div>

        {/* 3. Protective Actions Pills */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[10px] font-bold text-[#3d4947] uppercase tracking-widest">
            Recommended Protections Today
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {PROTECTIVE_ACTIONS.map((pa) => (
              <div 
                key={pa.action}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer ${pa.color}`}
                onClick={() => alert(`Protective measure: "${pa.action}" reduces exposure by up to 95% from local particles.`)}
              >
                {renderActionIcon(pa.icon)}
                <span>{pa.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
