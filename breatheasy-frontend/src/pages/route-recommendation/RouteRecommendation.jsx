import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  CheckCircle2 
} from 'lucide-react';
import { 
  BANGALORE_ROUTES, 
  AQI_STATIONS 
} from './data';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';
import RoutePlanner from './components/RoutePlanner';
import RouteResults from './components/RouteResults';
import NavigationPanel from './components/NavigationPanel';
import HealthDashboard from './components/HealthDashboard';
import { useNavigate } from 'react-router-dom';

export default function RouteRecommendation() {
  const navigate = useNavigate();

  // Navigation & Screen Router States
  const [currentScreen, setScreen] = useState('PLANNER');
  const [sourceText, setSourceText] = useState('Indiranagar, Bangalore');
  const [destinationText, setDestinationText] = useState('MG Road Metro, Bangalore');
  
  // Health Profiles & Feeling States
  const [selectedProfile, setSelectedProfile] = useState('Asthma');
  const [selectedFeeling, setSelectedFeeling] = useState('Feeling Great 😊');
  
  // Selected Route & GPS Simulator States
  const [selectedRouteId, setSelectedRouteId] = useState('route-1'); // Default to Cleanest Air
  const [selectedStation, setSelectedStation] = useState(null);
  
  // Navigation Simulation Engine State
  const [navState, setNavState] = useState({
    isActive: false,
    isPaused: true,
    currentPointIndex: 0,
    speed: 2,
    voiceEnabled: true
  });

  // Success Modal on simulation completion
  const [showArrivalModal, setShowArrivalModal] = useState(false);

  // Active routes list reference
  const routes = BANGALORE_ROUTES;
  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // GPS Simulation interval loop
  useEffect(() => {
    let timer;
    
    if (navState.isActive && !navState.isPaused) {
      const intervalMs = Math.max(2500 / navState.speed, 300);
      
      timer = setInterval(() => {
        setNavState((prev) => {
          const nextIndex = prev.currentPointIndex + 1;
          const maxIndex = activeRoute.pathPoints.length - 1;
          
          if (nextIndex > maxIndex) {
            // Arrival reached!
            clearInterval(timer);
            setShowArrivalModal(true);
            return {
              ...prev,
              isActive: false,
              isPaused: true,
              currentPointIndex: 0
            };
          }
          
          // Audio simulation announcement if voice is on
          if (prev.voiceEnabled && nextIndex % 3 === 0 && 'speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance();
            if (nextIndex === 3) {
              utter.text = "Navigation alert: entering moderate AQI sector. System suggests maintaining speed.";
            } else if (nextIndex === 6) {
              utter.text = "Route advisory: entering residential green corridor. Particulate concentration reduced.";
            } else {
              utter.text = "Continue straight along safest corridor.";
            }
            utter.volume = 0.4;
            window.speechSynthesis.speak(utter);
          }
          
          return {
            ...prev,
            currentPointIndex: nextIndex
          };
        });
      }, intervalMs);
    }
    
    return () => clearInterval(timer);
  }, [navState.isActive, navState.isPaused, navState.speed, activeRoute]);

  // Handle Search Trigger
  const handleSearch = () => {
    // Navigate to RESULTS Screen
    setScreen('RESULTS');
    // Default to cleanest route when searched
    setSelectedRouteId('route-1');
  };

  // Start navigation trigger
  const handleStartNavigation = (voiceEnabled) => {
    setNavState({
      isActive: true,
      isPaused: false,
      currentPointIndex: 0,
      speed: 2,
      voiceEnabled: voiceEnabled
    });
    setScreen('NAVIGATION');

    // Trigger starting audio announcement
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(
        `Starting health-optimized navigation to ${destinationText.split(',')[0]} via ${activeRoute.name.split(' — ')[1]}. Weighted Exposure Score is ${activeRoute.wesScore} out of 100.`
      );
      utter.volume = 0.5;
      window.speechSynthesis.speak(utter);
    }
  };

  // Stop navigation
  const handleStopNavigation = () => {
    setNavState((prev) => ({
      ...prev,
      isActive: false,
      isPaused: true,
      currentPointIndex: 0
    }));
    setScreen('RESULTS');
  };

  return (
    <div className="bg-[#f5faf8] text-[#171d1c] h-screen w-screen flex overflow-hidden font-sans antialiased">
      
      {/* Top Header App Bar (fixed height, responsive branding matches design assets) */}
      <header className="bg-white border-b border-[#bcc9c6]/80 flex justify-between items-center w-full px-4 md:px-8 h-16 z-50 fixed top-0 left-0 shadow-sm select-none">
        <div className="flex items-center gap-3">
          {/* Logo representation */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-xl bg-[#00685f]/10 flex items-center justify-center text-[#00685f] cursor-pointer hover:scale-105 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" />
            </svg>
          </div>
          <span 
            onClick={() => navigate('/dashboard')}
            className="text-lg md:text-xl font-black text-[#00685f] tracking-tight cursor-pointer hover:text-[#005049] transition-colors"
          >
            BreatheEasy+
          </span>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-[#00685f] font-extrabold uppercase tracking-widest border border-emerald-200">
            AQI: Good
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="ml-4 bg-[#f0f5f2] border border-[#bcc9c6] hover:bg-[#e4e9e7] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#00685f] transition-all hover:shadow-sm"
          >
            ← Back to Main Dashboard
          </button>
        </div>

        {/* Right side Profile & Notifications icons */}
        <div className="flex items-center gap-5 lg:gap-6">
          <div className="hidden lg:flex items-center gap-2 bg-[#f0f5f2] px-3 py-1 rounded-full text-xs font-semibold text-[#3d4947]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-aqi" />
            <span>Bangalore Live Metrics Sentinel Active</span>
          </div>

          <div className="flex items-center gap-3 text-[#3d4947]">
            <button 
              onClick={() => alert('Real-time alerts inbox: pollen concentrations are currently safe, PM2.5 levels are stable across outer arterial lanes.')}
              className="p-2 hover:bg-[#e4e9e7] rounded-full transition-colors active:scale-95"
              title="Alert Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => alert('Opening advanced system parameters: calibrate WES equations, configure Bluetooth sensor bands, or set audio voice speed.')}
              className="p-2 hover:bg-[#e4e9e7] rounded-full transition-colors active:scale-95"
              title="System Config"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User profile avatar box */}
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-[#bcc9c6] shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHYvkmyTqScqjo0hs7Emy_mhhwVCy0WsQI_IUOejyDmxZkbkWG6Za03e9ee2DOJuaTVbyYKKnb1ceiAcWlsbLoEk67XwAlkLB870yoeMYWzpcuXs_SI4LaVkKOh46VpPEjmhHKPR6s0q828Y5z6iZc3sgDe6RdRvnfADc5XbKLc8MkAVTkuBXSJ5ECen7Y8zwSP51N6JFrQb9gKJCmBMW41w-Bp9cjPNx6IasomVm6DZ2tbguYQCW93m7moZaaS34c-FFbWYUIwTHM" 
                alt="Health Profile Avatar" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation Panel (responsive) */}
      <Sidebar 
        currentScreen={currentScreen} 
        setScreen={(scr) => {
          setScreen(scr);
          // If switching to dashboard, we also clear any focus station
          if (scr === 'DASHBOARD') {
            setSelectedStation(null);
          }
        }} 
      />

      {/* Primary Layout Frame */}
      <main className="flex-1 md:ml-72 pt-16 flex flex-col md:flex-row h-full relative overflow-hidden">
        
        {/* Background Map Viewport (persistent under overlays for flawless transition) */}
        <section className="flex-1 relative h-full">
          <MapArea
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => {
              setSelectedRouteId(id);
              // Clear popups to focus route
              setSelectedStation(null);
            }}
            stations={AQI_STATIONS}
            selectedStation={selectedStation}
            onSelectStation={(st) => {
              setSelectedStation(st);
              // When clicking a station, switch to Dashboard screen to display detailed metrics bento card side panel!
              setScreen('DASHBOARD');
            }}
            navigationActive={currentScreen === 'NAVIGATION'}
            navState={navState}
            sourceText={sourceText}
            destinationText={destinationText}
          />

          {/* Screen 1 Overlays: Route Planner Form */}
          {currentScreen === 'PLANNER' && (
            <div className="absolute left-4 top-4 bottom-16 md:bottom-auto pointer-events-none z-20 flex flex-col justify-between">
              <RoutePlanner
                sourceText={sourceText}
                setSourceText={setSourceText}
                destinationText={destinationText}
                setDestinationText={setDestinationText}
                selectedProfile={selectedProfile}
                setSelectedProfile={setSelectedProfile}
                selectedFeeling={selectedFeeling}
                setSelectedFeeling={setSelectedFeeling}
                onSearch={handleSearch}
              />
            </div>
          )}

          {/* Screen 3 Overlays: Navigation Telemetry & Panel (Full-screen Absolute overlay over map) */}
          {currentScreen === 'NAVIGATION' && (
            <NavigationPanel
              activeRoute={activeRoute}
              navState={navState}
              onTogglePlay={() => setNavState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
              onToggleVoice={() => setNavState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
              onStopNavigation={handleStopNavigation}
              onChangeSpeed={(spd) => setNavState(prev => ({ ...prev, speed: spd }))}
            />
          )}
        </section>

        {/* Screen 2 Overlays: Sidebar Results List (Renders alongside the map on left side) */}
        {currentScreen === 'RESULTS' && (
          <RouteResults
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
            onBackToPlanner={() => setScreen('PLANNER')}
            onStartNavigation={handleStartNavigation}
            sourceText={sourceText}
            destinationText={destinationText}
          />
        )}

        {/* Screen 4 Overlays: Right-side Bento Health Dashboard Panel (Renders alongside map on right side) */}
        {currentScreen === 'DASHBOARD' && (
          <HealthDashboard
            selectedStation={selectedStation}
            onCloseStation={() => setSelectedStation(null)}
            selectedProfile={selectedProfile}
            selectedFeeling={selectedFeeling}
            pollenAlertActive={true}
          />
        )}
      </main>

      {/* Arrival Destination Congrats Success Modal */}
      {showArrivalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-[#00685f] mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-sans text-xl font-extrabold text-[#171d1c]">Arrival Completed Safely!</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                MG Road Metro Destination Reached
              </p>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-left space-y-2">
              <p className="text-xs font-semibold text-[#3d4947] leading-relaxed">
                By choosing the <span className="font-bold text-[#00685f]">Cleanest Air Corridors</span>, you limited PM2.5 deposition in your lung passages by <span className="font-bold text-[#00685f]">23%</span> compared to the standard high-traffic routes.
              </p>
              <div className="flex justify-between items-center text-[10px] font-bold text-[#3d4947] pt-1 border-t border-emerald-100/40">
                <span>WES Score achieved: {activeRoute.wesScore}/100</span>
                <span className="text-[#00685f]">Asthma trigger minimized</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowArrivalModal(false);
                  setScreen('DASHBOARD');
                }}
                className="w-full bg-[#00685f] hover:bg-[#005049] text-white font-bold py-3.5 rounded-2xl transition-transform active:scale-95 text-sm"
              >
                View Air Quality Stats Dashboard
              </button>
              <button
                onClick={() => setShowArrivalModal(false)}
                className="w-full text-slate-400 hover:text-slate-600 font-bold text-xs mt-3 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
