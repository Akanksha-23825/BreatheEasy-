import React from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  Activity, 
  Info, 
  Wind,
  HeartPulse,
  Sparkles,
  Baby,
  TrendingUp,
  User,
  Smile,
  Meh,
  Battery,
  Flame
} from 'lucide-react';
import { HEALTH_PROFILES, FEELINGS } from '../data';

export default function RoutePlanner({
  sourceText,
  setSourceText,
  destinationText,
  setDestinationText,
  selectedProfile,
  setSelectedProfile,
  selectedFeeling,
  setSelectedFeeling,
  onSearch
}) {

  // Map profile type to suitable Lucide Icon component
  const getProfileIcon = (profile) => {
    switch (profile) {
      case 'General': return <User className="w-5 h-5 text-emerald-600" />;
      case 'Asthma': return <Wind className="w-5 h-5 text-[#316bf3]" />;
      case 'Heart Disease': return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'Pregnant': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'Elderly': return <TrendingUp className="w-5 h-5 text-amber-600" />;
      case 'Child': return <Baby className="w-5 h-5 text-pink-600" />;
      default: return <User className="w-5 h-5 text-slate-600" />;
    }
  };

  const getFeelingIcon = (feeling) => {
    switch (feeling) {
      case 'Feeling Great 😊': return <Smile className="w-5 h-5 text-emerald-600" />;
      case 'Normal 😐': return <Meh className="w-5 h-5 text-slate-600" />;
      case 'Tired 😴': return <Battery className="w-5 h-5 text-amber-600" />;
      case 'Mild Cough 🤧': return <Activity className="w-5 h-5 text-orange-600" />;
      case 'Shortness of Breath 😮‍💨': return <Flame className="w-5 h-5 text-red-600" />;
      default: return <Smile className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="glass-panel w-full max-w-sm rounded-3xl shadow-xl p-6 border border-[#bcc9c6]/40 flex flex-col gap-5 select-none pointer-events-auto">
      <div>
        <h1 className="font-sans text-xl font-extrabold text-[#171d1c]">Plan Your Safe Route</h1>
        <p className="text-xs text-[#3d4947] mt-1">Select parameters to minimize pollution exposure during your travel.</p>
      </div>

      <div className="space-y-4">
        {/* Source Address */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold tracking-widest text-[#3d4947] uppercase ml-1">
            STARTING POINT
          </label>
          <div className="flex items-center bg-white border border-[#bcc9c6] rounded-2xl px-4 py-3 focus-within:border-[#316bf3] focus-within:ring-2 focus-within:ring-[#316bf3]/20 transition-all">
            <MapPin className="w-5 h-5 text-[#00685f] shrink-0 mr-3" />
            <input 
              type="text" 
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full bg-transparent border-none outline-none focus:outline-none p-0 text-sm font-semibold text-[#171d1c] placeholder-slate-400"
              placeholder="Enter starting neighborhood"
            />
          </div>
          {/* Quick neighborhood buttons */}
          <div className="flex gap-2.5 mt-1 ml-1 overflow-x-auto no-scrollbar">
            {['Indiranagar', 'Koramangala', 'HSR Layout'].map(loc => (
              <button 
                key={loc}
                onClick={() => setSourceText(`${loc}, Bangalore`)}
                className="text-[10px] bg-slate-100 hover:bg-[#eaefed] px-2 py-1 rounded-md text-[#3d4947] font-semibold shrink-0 transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Address */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold tracking-widest text-[#3d4947] uppercase ml-1">
            DESTINATION
          </label>
          <div className="flex items-center bg-white border border-[#bcc9c6] rounded-2xl px-4 py-3 focus-within:border-[#316bf3] focus-within:ring-2 focus-within:ring-[#316bf3]/20 transition-all">
            <Compass className="w-5 h-5 text-[#316bf3] shrink-0 mr-3" />
            <input 
              type="text" 
              value={destinationText}
              onChange={(e) => setDestinationText(e.target.value)}
              className="w-full bg-transparent border-none outline-none focus:outline-none p-0 text-sm font-semibold text-[#171d1c] placeholder-slate-400"
              placeholder="Enter ending neighborhood"
            />
          </div>
          {/* Quick destination neighborhood buttons */}
          <div className="flex gap-2.5 mt-1 ml-1 overflow-x-auto no-scrollbar">
            {['MG Road', 'Whitefield', 'Electronic City'].map(loc => (
              <button 
                key={loc}
                onClick={() => setDestinationText(`${loc} Metro, Bangalore`)}
                className="text-[10px] bg-slate-100 hover:bg-[#eaefed] px-2 py-1 rounded-md text-[#3d4947] font-semibold shrink-0 transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Vulnerability Health Profile dropdown-mimic */}
        <div className="space-y-1">
          <div className="flex justify-between items-center ml-1">
            <label className="block text-[11px] font-bold tracking-widest text-[#3d4947] uppercase">
              VULNERABILITY PROFILE
            </label>
            <span className="text-[10px] text-[#00685f] font-semibold flex items-center gap-1 cursor-pointer" onClick={() => alert('WES scores adapt dynamically to shield sensitive respiratory conditions from triggers.')}>
              <Info className="w-3.5 h-3.5" /> Adapts WES
            </span>
          </div>
          <div className="relative">
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full bg-white border border-[#bcc9c6] rounded-2xl px-4 py-3 text-sm font-semibold text-[#171d1c] appearance-none focus:border-[#316bf3] focus:ring-1 focus:ring-[#316bf3] outline-none cursor-pointer transition-all"
            >
              {HEALTH_PROFILES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.value} ({p.desc})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3d4947] flex items-center gap-1.5">
              {getProfileIcon(selectedProfile)}
            </div>
          </div>
        </div>

        {/* Current Wellness Feeling Select */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold tracking-widest text-[#3d4947] uppercase ml-1">
            HOW ARE YOU FEELING?
          </label>
          <div className="relative">
            <select
              value={selectedFeeling}
              onChange={(e) => setSelectedFeeling(e.target.value)}
              className="w-full bg-white border border-[#bcc9c6] rounded-2xl px-4 py-3 text-sm font-semibold text-[#171d1c] appearance-none focus:border-[#316bf3] focus:ring-1 focus:ring-[#316bf3] outline-none cursor-pointer transition-all"
            >
              {FEELINGS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.value}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#3d4947] flex items-center gap-1.5">
              {getFeelingIcon(selectedFeeling)}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSearch}
        className="w-full bg-[#00685f] hover:bg-[#005049] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-2"
      >
        <Search className="w-5 h-5 text-[#89f5e7]" />
        <span>Find Safest Route</span>
      </button>
    </div>
  );
}
