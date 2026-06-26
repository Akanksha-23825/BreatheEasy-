import React from 'react';
import { 
  LayoutDashboard, 
  Route as RouteIcon, 
  Map, 
  Settings, 
  HelpCircle, 
  ShieldAlert 
} from 'lucide-react';

export default function Sidebar({ currentScreen, setScreen, pollenAlertActive = true }) {
  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="fixed left-0 top-0 h-screen z-40 hidden md:flex flex-col w-72 bg-[#f0f5f2] border-r border-[#bcc9c6] pt-16">
        <div className="px-6 py-6">
          <div className="flex items-center gap-2">
            <span className="font-sans text-2xl font-extrabold text-[#00685f]">BreatheEasy+</span>
          </div>
          <p className="text-xs text-[#3d4947] opacity-80 font-medium tracking-wide mt-1">Clean Air Advisor — Bangalore</p>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5">
          <button
            onClick={() => setScreen('DASHBOARD')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
              currentScreen === 'DASHBOARD'
                ? 'bg-[#316bf3] text-white shadow-sm'
                : 'text-[#3d4947] hover:bg-[#e4e9e7]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard & Stations</span>
          </button>

          <button
            onClick={() => setScreen('PLANNER')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
              currentScreen === 'PLANNER' || currentScreen === 'RESULTS'
                ? 'bg-[#316bf3] text-white shadow-sm'
                : 'text-[#3d4947] hover:bg-[#e4e9e7]'
            }`}
          >
            <RouteIcon className="w-5 h-5" />
            <span>Route Planner</span>
          </button>

          <button
            onClick={() => setScreen('NAVIGATION')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
              currentScreen === 'NAVIGATION'
                ? 'bg-[#316bf3] text-white shadow-sm'
                : 'text-[#3d4947] hover:bg-[#e4e9e7]'
            }`}
          >
            <Map className="w-5 h-5" />
            <span>Active Navigation</span>
          </button>
        </nav>

        {pollenAlertActive && (
          <div className="mt-5 pt-4 border-t border-[#bcc9c6]/50 mx-4 mb-6">
            <div className="p-4 bg-[#00685f] text-white rounded-2xl shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#89f5e7] shrink-0" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#89f5e7]">Pollen Alert</p>
              </div>
              <p className="text-xs leading-relaxed opacity-95">
                Grass pollen levels are moderate in Indiranagar today. Sensitivity protection recommended.
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-[#bcc9c6] p-4 space-y-1">
          <button
            onClick={() => alert('Settings menu: customize language, health profile settings, voice engine defaults, and system parameters.')}
            className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-semibold text-[#3d4947] hover:bg-[#e4e9e7] rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => alert('BreatheEasy+ Help & Documentation Center: learn about WES calculation, WHO exposure safe thresholds, and hardware integration guide.')}
            className="w-full flex items-center gap-4 px-4 py-2.5 text-sm font-semibold text-[#3d4947] hover:bg-[#e4e9e7] rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (visible on mobile, hidden on desktop) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 pb-safe md:hidden bg-white border-t border-[#bcc9c6] shadow-lg">
        <button
          onClick={() => setScreen('DASHBOARD')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all ${
            currentScreen === 'DASHBOARD'
              ? 'text-[#00685f] bg-[#00685f]/10 font-bold'
              : 'text-[#3d4947]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-wide mt-0.5">Dashboard</span>
        </button>

        <button
          onClick={() => setScreen('PLANNER')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all ${
            currentScreen === 'PLANNER' || currentScreen === 'RESULTS'
              ? 'text-[#00685f] bg-[#00685f]/10 font-bold'
              : 'text-[#3d4947]'
          }`}
        >
          <RouteIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-wide mt-0.5">Plan</span>
        </button>

        <button
          onClick={() => setScreen('NAVIGATION')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all ${
            currentScreen === 'NAVIGATION'
              ? 'text-[#00685f] bg-[#00685f]/10 font-bold'
              : 'text-[#3d4947]'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] tracking-wide mt-0.5">Nav</span>
        </button>
      </nav>
    </>
  );
}
