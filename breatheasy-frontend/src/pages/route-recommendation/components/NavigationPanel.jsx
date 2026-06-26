import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  AlertTriangle, 
  CornerUpRight, 
  MoveUp, 
  ArrowUpLeft, 
  RotateCw, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  Heart, 
  Compass, 
  Sliders 
} from 'lucide-react';
import { TURN_BY_TURN_STEPS } from '../data';

export default function NavigationPanel({
  activeRoute,
  navState,
  onTogglePlay,
  onToggleVoice,
  onStopNavigation,
  onChangeSpeed
}) {

  // Map step index to turn instructions
  const currentStepIndex = Math.min(
    Math.floor((navState.currentPointIndex / activeRoute.pathPoints.length) * TURN_BY_TURN_STEPS.length),
    TURN_BY_TURN_STEPS.length - 1
  );

  const currentStep = TURN_BY_TURN_STEPS[currentStepIndex];

  // Helper to render turn icons
  const renderTurnIcon = (iconName) => {
    switch (iconName) {
      case 'MoveUp': return <MoveUp className="w-8 h-8 text-white" />;
      case 'CornerUpRight': return <CornerUpRight className="w-8 h-8 text-white" />;
      case 'ArrowUpLeft': return <ArrowUpLeft className="w-8 h-8 text-white" />;
      case 'RotateCw': return <RotateCw className="w-8 h-8 text-white" />;
      case 'MapPin': return <MapPin className="w-8 h-8 text-white animate-bounce" />;
      default: return <MoveUp className="w-8 h-8 text-white" />;
    }
  };

  // Determine pollution alert state dynamically based on the path progress
  const inPollutedZone = navState.currentPointIndex >= 3 && navState.currentPointIndex <= 6;

  // Calculate dynamic metrics during simulation
  const percentageCompleted = navState.currentPointIndex / (activeRoute.pathPoints.length - 1);
  const remainingDistance = Math.max(
    Number((activeRoute.distance * (1 - percentageCompleted)).toFixed(1)),
    0
  );
  const remainingDuration = Math.max(
    Math.round(activeRoute.duration * (1 - percentageCompleted)),
    0
  );

  // Pollutant concentrations
  const dynamicPM25 = inPollutedZone ? 114 : Math.round(activeRoute.pm25 * (1 + 0.15 * Math.sin(navState.currentPointIndex)));
  const pm25VsWho = Math.round((dynamicPM25 / 5) * 100); // WHO annual guideline is 5 ug/m3

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 md:p-6 select-none font-sans">
      
      {/* Top Banner: Turn-by-Turn GPS Instruction (Matches visual screenshots) */}
      <div className="w-full max-w-xl mx-auto pointer-events-auto">
        <div className="glass-panel border border-[#bcc9c6]/40 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          {/* Instruction Arrow Icon Container */}
          <div className="w-14 h-14 bg-[#00685f] rounded-2xl flex items-center justify-center text-white shadow-inner shrink-0">
            {renderTurnIcon(currentStep.icon)}
          </div>
          {/* Main direction text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-extrabold text-[#171d1c] tracking-tight truncate">
              {currentStep.instruction}
            </h3>
            <p className="text-[10px] md:text-xs font-bold text-[#3d4947] uppercase tracking-widest mt-1">
              IN {currentStep.distance}
            </p>
          </div>
          <div className="h-10 w-px bg-[#bcc9c6]/60" />
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-[#316bf3] leading-none">
              {remainingDistance} <span className="text-xs font-bold text-[#3d4947]">KM</span>
            </p>
            <p className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wide mt-1">total left</p>
          </div>
        </div>
      </div>

      {/* Middle: Live Warning Overlay Banner (appears when in polluted zone) */}
      <div className="w-full max-w-md mx-auto transform translate-y-[-20%] transition-all duration-500 pointer-events-auto">
        {inPollutedZone ? (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-2xl p-4 flex items-start gap-3.5 shadow-lg animate-bounce">
            <AlertTriangle className="w-6 h-6 text-[#ba1a1a] shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#93000a]">
                HIGH POLLUTION ZONE AHEAD
              </h4>
              <p className="text-xs text-[#3d4947] leading-relaxed mt-0.5">
                Live AQI is <span className="font-extrabold text-[#ba1a1a]">156 (Unhealthy)</span>. Asthma patients: close vents, speed up travel if safe to minimize exposure.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#f4fffc] border border-[#00685f]/20 rounded-2xl p-3.5 flex items-center gap-2.5 shadow-md justify-center">
            <ShieldCheck className="w-5 h-5 text-[#00685f] shrink-0" />
            <span className="text-xs font-semibold text-[#3d4947]">
              You are on the <span className="font-bold text-[#00685f]">Safest Health Corridor</span>. AQI remains stable.
            </span>
          </div>
        )}
      </div>

      {/* Side Overlays: Live AQI Telemetry & Health Guidelines (Floating Right) */}
      <div className="absolute right-4 top-28 bottom-44 w-64 hidden xl:flex flex-col gap-4 pointer-events-auto justify-center">
        {/* Live AQI details widget */}
        <div className="glass-panel border border-[#bcc9c6]/40 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider">LIVE AIR ANALYSIS</span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              Live Feed
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg border-4" 
              style={{ 
                borderColor: inPollutedZone ? '#ba1a1a' : '#00685f',
                color: inPollutedZone ? '#ba1a1a' : '#00685f',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }}
            >
              {dynamicPM25 * 2}
            </div>
            <div>
              <div className="text-xs font-bold text-[#171d1c]">
                {inPollutedZone ? 'Unhealthy Zone' : 'Safe Air Corridors'}
              </div>
              <div className="text-[10px] text-[#3d4947] mt-0.5">PM2.5: {dynamicPM25} µg/m³</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#bcc9c6]/30">
            <div className="flex justify-between text-[10px] font-bold text-[#3d4947]">
              <span>vs WHO Guideline limit</span>
              <span className="font-extrabold text-red-600">{pm25VsWho}% over</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#ba1a1a] transition-all duration-300"
                style={{ width: `${Math.min(pm25VsWho / 4, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Live Biometrics telemetry simulation */}
        <div className="glass-panel border border-[#bcc9c6]/40 rounded-2xl p-4 shadow-xl space-y-3">
          <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider">LUNG LOAD PROFILE</span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4.5 h-4.5 text-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-[#3d4947]">Heart Rate</span>
            </div>
            <span className="text-xs font-extrabold text-[#171d1c]">78 bpm</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-[#00685f]" />
              <span className="text-xs font-semibold text-[#3d4947]">Minute Vent</span>
            </div>
            <span className="text-xs font-extrabold text-[#171d1c]">14.2 L/min</span>
          </div>
        </div>
      </div>

      {/* Bottom docking bay: Simulation Navigation Control Station */}
      <div className="w-full max-w-3xl mx-auto pointer-events-auto">
        <div className="bg-white border border-[#bcc9c6]/40 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.12)] p-4 md:p-6 pb-6 md:pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Simulation Playback controls */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Play/Pause Button */}
              <button 
                onClick={onTogglePlay}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md active:scale-90 transition-transform ${
                  navState.isPaused ? 'bg-[#316bf3]' : 'bg-amber-500'
                }`}
                title={navState.isPaused ? 'Resume Navigation Simulation' : 'Pause Navigation Simulation'}
              >
                {navState.isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5" />}
              </button>

              <div className="flex-1 md:flex-none">
                <p className="text-xs font-extrabold text-[#171d1c]">
                  {navState.isPaused ? 'Simulation Paused' : 'Simulating Live Travel'}
                </p>
                <p className="text-[10px] text-[#3d4947] font-semibold">GPS position tracking online</p>
              </div>
            </div>

            {/* Middle: Live ETA remaining indicators */}
            <div className="flex items-center justify-center gap-6 md:gap-8 bg-[#f0f5f2] px-6 py-3.5 rounded-2xl w-full md:w-auto">
              <div className="text-center">
                <p className="text-lg font-black text-[#00685f] leading-none">
                  {remainingDistance} <span className="text-xs font-bold text-[#3d4947]">KM</span>
                </p>
                <p className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wide mt-1">remaining</p>
              </div>
              <div className="h-8 w-px bg-[#bcc9c6]" />
              <div className="text-center">
                <p className="text-lg font-black text-slate-800 leading-none">
                  {remainingDuration} <span className="text-xs font-bold text-[#3d4947]">MIN</span>
                </p>
                <p className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wide mt-1">travel time</p>
              </div>
            </div>

            {/* Right: Sound Toggle / Speed sliders & Stop controls */}
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
              
              {/* Speed multiplier control */}
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider">Speed:</span>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={navState.speed}
                  onChange={(e) => onChangeSpeed(Number(e.target.value))}
                  className="w-16 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#316bf3]"
                />
                <span className="text-xs font-bold text-[#316bf3] shrink-0 w-4">{navState.speed}x</span>
              </div>

              {/* Voice toggle button */}
              <button 
                onClick={onToggleVoice}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  navState.voiceEnabled 
                    ? 'bg-emerald-50 text-[#00685f] border-[#00685f]/30' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
                title={navState.voiceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
              >
                {navState.voiceEnabled ? <Volume2 className="w-4.5 h-4.5 animate-pulse" /> : <VolumeX className="w-4.5 h-4.5" />}
              </button>

              {/* End simulation button */}
              <button 
                onClick={onStopNavigation}
                className="bg-[#ba1a1a] hover:bg-red-700 text-white font-bold h-12 px-5 rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
