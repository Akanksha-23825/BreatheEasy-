import React from 'react';
import { 
  ArrowLeft, 
  Map, 
  Clock, 
  TrendingDown, 
  Sparkles, 
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

export default function RouteResults({
  routes,
  selectedRouteId,
  onSelectRoute,
  onBackToPlanner,
  onStartNavigation,
  sourceText,
  destinationText
}) {

  // Sort routes so safe is usually first
  const sortedRoutes = [...routes].sort((a, b) => b.wesScore - a.wesScore);

  return (
    <div className="w-full md:w-[420px] bg-white h-full overflow-y-auto custom-scrollbar border-r border-[#bcc9c6] z-10 flex flex-col p-4 md:p-6 select-none shadow-md">
      {/* Header panel */}
      <div className="flex flex-col gap-3 mb-6">
        <button 
          onClick={onBackToPlanner}
          className="flex items-center gap-2 text-xs font-bold text-[#00685f] hover:text-[#005049] transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Route Parameters</span>
        </button>
        <div className="flex justify-between items-baseline">
          <h2 className="font-sans text-xl font-extrabold text-[#171d1c]">Route Options</h2>
          <span className="text-[11px] font-bold text-[#3d4947] bg-[#eaefed] px-2 py-1 rounded">
            {sortedRoutes.length} options found
          </span>
        </div>
        <p className="text-xs text-[#3d4947] leading-relaxed">
          From <span className="font-bold text-[#171d1c]">{sourceText.split(',')[0]}</span> to{' '}
          <span className="font-bold text-[#171d1c]">{destinationText.split(',')[0]}</span>
        </p>
      </div>

      {/* List of Route Cards */}
      <div className="flex-1 space-y-4">
        {sortedRoutes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isSafe = route.category === 'Safe';
          const isDangerous = route.category === 'Dangerous';

          // Score bar configurations
          let barBgColor = 'bg-[#00685f]';
          let textColor = 'text-[#00685f]';
          let pillBg = 'bg-[#e6f4f1] text-[#00685f]';

          if (isDangerous) {
            barBgColor = 'bg-[#ba1a1a]';
            textColor = 'text-[#ba1a1a]';
            pillBg = 'bg-[#ffebee] text-[#ba1a1a]';
          } else if (route.category === 'Moderate') {
            barBgColor = 'bg-amber-500';
            textColor = 'text-amber-700';
            pillBg = 'bg-[#fff9e6] text-[#8a6d00]';
          }

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`rounded-2xl p-5 shadow-sm space-y-4 transition-all duration-300 cursor-pointer border ${
                isSelected 
                  ? 'border-2 border-[#00685f] ring-2 ring-[#00685f]/15 bg-emerald-50/10' 
                  : 'border-[#bcc9c6] bg-white hover:border-slate-400'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5">
                  {isSafe && (
                    <div className="bg-[#00685f] text-white px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider max-w-max">
                      ⭐ RECOMMENDED
                    </div>
                  )}
                  <h3 className="font-sans text-sm font-extrabold text-[#171d1c] line-clamp-1">
                    {route.name.split(' — ')[1] || route.name}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shrink-0 ${pillBg}`}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'currentColor' }} />
                  {route.category}
                </span>
              </div>

              {/* Stats: Distance / Time */}
              <div className="flex items-center gap-4 text-[#3d4947] text-xs font-semibold">
                <span className="flex items-center gap-1">
                  <Map className="w-4 h-4 text-slate-400" />
                  <span>{route.distance} km</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className={isSafe ? 'text-[#00685f] font-bold' : ''}>{route.duration} min</span>
                </span>
                {route.savingsPercent !== undefined && route.savingsPercent > 0 && (
                  <span className="bg-[#e6f4f1] text-[#00685f] px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>-{route.savingsPercent}% pollution</span>
                  </span>
                )}
              </div>

              {/* WES Score Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-[#3d4947]">
                  <span>Wellness Exposure Score (WES)</span>
                  <span className={`font-extrabold ${textColor}`}>{route.wesScore}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${barBgColor}`}
                    style={{ width: `${route.wesScore}%` }}
                  />
                </div>
              </div>

              {/* Pollutants Breakdowns if selected */}
              <div className="flex items-center gap-6 pt-1 border-t border-slate-50">
                <div className="text-center">
                  <div className={`text-2xl font-black ${textColor}`}>{route.averageAqi}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#3d4947]">Avg AQI</div>
                </div>
                <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                  <span className="bg-slate-50 px-2 py-1 rounded text-[10px] font-bold border border-[#bcc9c6]/40 text-slate-700 shrink-0">
                    PM2.5: {route.pm25}
                  </span>
                  <span className="bg-slate-50 px-2 py-1 rounded text-[10px] font-bold border border-[#bcc9c6]/40 text-slate-700 shrink-0">
                    NO2: {route.no2}
                  </span>
                  <span className="bg-slate-50 px-2 py-1 rounded text-[10px] font-bold border border-[#bcc9c6]/40 text-slate-700 shrink-0">
                    PM10: {route.pm10}
                  </span>
                </div>
              </div>

              {/* Insight Text block */}
              {isSafe && (
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 flex gap-2.5">
                  <Lightbulb className="w-4.5 h-4.5 text-[#00685f] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-[#3d4947]">
                    Reduces asthma and respiratory trigger exposure by <span className="font-bold text-[#00685f]">23%</span> vs fastest route. Highly shaded residential park canopy.
                  </p>
                </div>
              )}

              {/* Card buttons if selected */}
              {isSelected && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Showing detailed visual overlays on map for ${route.name}`);
                    }}
                    className="h-10 border border-[#316bf3] text-[#316bf3] font-bold rounded-xl text-xs hover:bg-[#316bf3]/5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Map className="w-4 h-4" />
                    <span>Show Route</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartNavigation(true);
                    }}
                    className="h-10 bg-[#00685f] hover:bg-[#005049] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Nav with Voice</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
