export const HEALTH_PROFILES = [
  { value: 'General', desc: 'No respiratory conditions', icon: 'User' },
  { value: 'Asthma', desc: 'Highly sensitive to PM2.5 & ozone', icon: 'Wind' },
  { value: 'Heart Disease', desc: 'Sensitive to carbon monoxide & PM10', icon: 'HeartPulse' },
  { value: 'Pregnant', desc: 'Extra caution recommended', icon: 'Sparkles' },
  { value: 'Elderly', desc: 'Susceptible to respiratory strain', icon: 'TrendingUp' },
  { value: 'Child', desc: 'High breathing rate, vulnerable lungs', icon: 'Baby' }
];

export const FEELINGS = [
  { value: 'Feeling Great 😊', icon: 'Smile' },
  { value: 'Normal 😐', icon: 'Meh' },
  { value: 'Tired 😴', icon: 'Battery' },
  { value: 'Mild Cough 🤧', icon: 'Activity' },
  { value: 'Shortness of Breath 😮‍💨', icon: 'Flame' }
];

// Map size is simulated as a grid of 1000x800.
// Let's design 3 paths from Indiranagar (approx 150, 650) to MG Road (approx 850, 250).
export const BANGALORE_ROUTES = [
  {
    id: 'route-1',
    name: 'Route 1 — Cleanest Air (Via Cubbon & Ulsoor Parks)',
    distance: 12.5,
    duration: 24,
    wesScore: 92,
    averageAqi: 42,
    pm25: 12,
    pm10: 22,
    no2: 8,
    o3: 4,
    category: 'Safe',
    savingsPercent: 23,
    description: 'Reduces asthma trigger exposure by 23% vs fastest route. Traverses lower density arterial roads.',
    pathPoints: [
      [150, 650],
      [220, 610],
      [290, 580],
      [340, 530],
      [390, 500],
      [460, 480],
      [530, 490],
      [610, 480],
      [680, 440],
      [730, 360],
      [780, 290],
      [850, 250]
    ]
  },
  {
    id: 'route-2',
    name: 'Route 2 — Fastest (Direct via Old Madras Road)',
    distance: 10.2,
    duration: 18,
    wesScore: 64,
    averageAqi: 88,
    pm25: 38,
    pm10: 55,
    no2: 19,
    o3: 11,
    category: 'Moderate',
    savingsPercent: 0,
    description: 'Direct high-traffic corridor. Exposed to major construction and heavy particulate clouds.',
    pathPoints: [
      [150, 650],
      [220, 590],
      [310, 540],
      [400, 490],
      [490, 440],
      [580, 390],
      [670, 340],
      [760, 290],
      [850, 250]
    ]
  },
  {
    id: 'route-3',
    name: 'Route 3 — Alternative (Via Old Airport Highway)',
    distance: 14.1,
    duration: 31,
    wesScore: 31,
    averageAqi: 165,
    pm25: 78,
    pm10: 110,
    no2: 32,
    o3: 21,
    category: 'Dangerous',
    savingsPercent: -45, // negative indicates more exposure
    description: 'Avoid during peak transit. Severe congestion, high diesel fumes, and stagnant inversion layers.',
    pathPoints: [
      [150, 650],
      [180, 560],
      [250, 460],
      [340, 390],
      [440, 360],
      [540, 340],
      [630, 310],
      [720, 290],
      [800, 270],
      [850, 250]
    ]
  }
];

export const AQI_STATIONS = [
  {
    id: 'st-1',
    name: 'MG Road Station',
    aqi: 82,
    category: 'Moderate',
    pm25: 24,
    pm10: 45,
    no2: 12,
    o3: 5,
    desc: 'Moderate traffic region. Asthma patients should limit prolonged outdoor exertion.',
    lat: '12.9756° N',
    lng: '77.6067° E',
    x: 850,
    y: 250
  },
  {
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
    lng: '77.6412° E',
    x: 150,
    y: 650
  },
  {
    id: 'st-3',
    name: 'Silk Board Junction',
    aqi: 188,
    category: 'Unhealthy',
    pm25: 88,
    pm10: 145,
    no2: 34,
    o3: 28,
    desc: 'Extreme traffic choke point. Heavy diesel particulates. Wear N95 respirator.',
    lat: '12.9176° N',
    lng: '77.6244° E',
    x: 480,
    y: 720
  },
  {
    id: 'st-4',
    name: 'Whitefield Industrial Station',
    aqi: 156,
    category: 'Unhealthy',
    pm25: 72,
    pm10: 112,
    no2: 29,
    o3: 18,
    desc: 'High industrial presence. PM10 suspension elevated due to heavy logistics vehicles.',
    lat: '12.9698° N',
    lng: '77.7499° E',
    x: 920,
    y: 440
  },
  {
    id: 'st-5',
    name: 'Cubbon Park Air Sentinel',
    aqi: 31,
    category: 'Good',
    pm25: 8,
    pm10: 15,
    no2: 5,
    o3: 3,
    desc: 'Dense green lungs of Bangalore. Ideal microclimate, very safe.',
    lat: '12.9731° N',
    lng: '77.5909° E',
    x: 420,
    y: 380
  },
  {
    id: 'st-6',
    name: 'Hebbal Flyover Station',
    aqi: 110,
    category: 'Sensitive',
    pm25: 41,
    pm10: 68,
    no2: 18,
    o3: 9,
    desc: 'Suspended flyover dust particles. Sensitive individuals may experience mild throat irritation.',
    lat: '13.0359° N',
    lng: '77.5978° E',
    x: 520,
    y: 120
  }
];

export const DEFAULT_ALERTS = [
  {
    id: 'al-1',
    title: 'Pollen Alert — Indiranagar',
    message: 'Grass pollen levels are moderate in Indiranagar today. Sensitive individuals should consider wearing a mask.',
    type: 'warning'
  },
  {
    id: 'al-2',
    title: 'High Pollution Warning — Silk Board',
    message: 'Gridlock has caused AQI spikes to 188. Re-routing through low-exposure transit paths strongly recommended.',
    type: 'danger'
  }
];

export const WEEKLY_EXPOSURE_DATA = [
  { day: 'M', exposure: 42, avgAqi: 48 },
  { day: 'T', exposure: 68, avgAqi: 75 },
  { day: 'W', exposure: 31, avgAqi: 35 },
  { day: 'T', exposure: 85, avgAqi: 92 },
  { day: 'F', exposure: 55, avgAqi: 62 },
  { day: 'S', exposure: 20, avgAqi: 24 },
  { day: 'S', exposure: 45, avgAqi: 50 }
];

export const PROTECTIVE_ACTIONS = [
  { action: 'Wear N95 Mask', icon: 'Masks', color: 'bg-primary/10 text-primary border-primary/20' },
  { action: 'Avoid High-Traffic Hours', icon: 'CalendarDays', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  { action: 'Use Asthma Inhaler Proactively', icon: 'Wind', color: 'bg-blue-50 text-blue-900 border-blue-200' },
  { action: 'Keep Windows Closed At Home', icon: 'Home', color: 'bg-purple-50 text-purple-900 border-purple-200' },
  { action: 'Limit Cardio Outside Today', icon: 'Footprints', color: 'bg-red-50 text-red-900 border-red-200' }
];

// Turn-by-turn simulation data
export const TURN_BY_TURN_STEPS = [
  { distance: '200m', instruction: 'Head east on Indiranagar 100 Feet Road', icon: 'MoveUp' },
  { distance: '400m', instruction: 'Turn right onto MG Road', icon: 'CornerUpRight' },
  { distance: '1.2km', instruction: 'Keep left past Cubbon Park Air Sentinel', icon: 'ArrowUpLeft' },
  { distance: '800m', instruction: 'At Trinity Circle, take the 2nd exit', icon: 'RotateCw' },
  { distance: '100m', instruction: 'Arrive safely at MG Road Station destination', icon: 'MapPin' }
];
