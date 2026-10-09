// City Life: Smart City Insights, Traffic, Weather & Citizen Crowdsourced Reports

export const INITIAL_CITIZEN_REPORTS = [
  {
    id: 'report-101',
    category: 'hazard', // hazard, food_gem, culture, traffic, lighting
    categoryLabel: 'Street Hazard',
    title: 'Deep Pothole near Tram Stop 4',
    author: 'Elena Vance (Local Cyclist)',
    authorBadge: 'Level 4 Urban Scout',
    location: 'Corner of 4th Ave & Spruce',
    coords: [40.7168, -74.0042],
    timestamp: '28 mins ago',
    upvotes: 43,
    verified: true,
    verificationAgency: 'Public Works Dept (Dispatched)',
    description: 'Submerged pothole filled with rainwater, easily hides sharp curb edge. Several cyclists almost wiped out.',
    hasVoiceNote: true,
    voiceDuration: '0:18',
    voiceTranscript: 'Heads up if you are biking or riding an e-scooter past Spruce St. The front wheel can sink almost 6 inches here.',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    sentiment: 'negative',
    severity: 'high'
  },
  {
    id: 'report-102',
    category: 'food_gem',
    categoryLabel: 'Hidden Gem Alert',
    title: 'Secret Midnight Matcha Donut Cart!',
    author: 'Chef Kenji M.',
    authorBadge: 'Verified Foodie Critic',
    location: 'Behind Clocktower Archway',
    coords: [40.7145, -74.004],
    timestamp: '45 mins ago',
    upvotes: 89,
    verified: true,
    verificationAgency: 'Community Upvoted',
    description: 'Freshly fried mochi donuts dusted in organic Uji matcha. Only pops up after 9 PM until dough runs out.',
    hasVoiceNote: true,
    voiceDuration: '0:24',
    voiceTranscript: 'You have to try this! The grandmother running it makes every batch by hand. Crisp outside, chewy inside.',
    image: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=600&auto=format&fit=crop&q=80',
    sentiment: 'positive',
    severity: 'info'
  },
  {
    id: 'report-103',
    category: 'lighting',
    categoryLabel: 'Poor Lighting Alert',
    title: 'Flickering High-Voltage Streetlight',
    author: 'Marcus Cole',
    authorBadge: 'Night Shift Commuter',
    location: 'Underpass on Willow St',
    coords: [40.7175, -74.0068],
    timestamp: '1 hour ago',
    upvotes: 27,
    verified: false,
    verificationAgency: 'Needs 3 more verifications',
    description: 'Flickering stroboscopic light makes the sidewalk pitch black in 5-second intervals. Walk in pairs.',
    hasVoiceNote: false,
    voiceDuration: null,
    voiceTranscript: null,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    sentiment: 'negative',
    severity: 'medium'
  },
  {
    id: 'report-104',
    category: 'culture',
    categoryLabel: 'Cultural Pop-Up',
    title: 'Acoustic Cello Ensemble under Bridge',
    author: 'Sora Tanaka',
    authorBadge: 'Music Explorer',
    location: 'Arch of the Harbor Aqueduct',
    coords: [40.7085, -74.0115],
    timestamp: '2 hours ago',
    upvotes: 114,
    verified: true,
    verificationAgency: 'City Arts Collective',
    description: 'Four conservatory students performing Bach and Vivaldi. The stone arch acoustics are mind-blowing.',
    hasVoiceNote: true,
    voiceDuration: '0:32',
    voiceTranscript: 'Listen to the natural reverb here under the arch. Free admission, brings out pure magic in the harbor breeze.',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    sentiment: 'positive',
    severity: 'info'
  }
];

export const TRAFFIC_CORRIDORS = [
  {
    id: 'corridor-1',
    name: 'Grand Central Avenue & Arterial 1',
    status: 'heavy',
    delayMin: '+16 mins',
    speedKmh: '14 km/h',
    cause: 'Traffic signal re-calibration & water main check',
    congestionPct: 86
  },
  {
    id: 'corridor-2',
    name: 'Harbor Coastal Promenade & Bridge Approach',
    status: 'flowing',
    delayMin: 'On Time',
    speedKmh: '48 km/h',
    cause: 'Clear lanes, steady maritime breeze',
    congestionPct: 22
  },
  {
    id: 'corridor-3',
    name: 'Old Quarter Ring Tunnel',
    status: 'moderate',
    delayMin: '+6 mins',
    speedKmh: '29 km/h',
    cause: 'Delivery van loading bay queues',
    congestionPct: 54
  },
  {
    id: 'corridor-4',
    name: 'North Rail Express Corridor',
    status: 'heavy',
    delayMin: '+22 mins',
    speedKmh: '9 km/h',
    cause: 'Freight train switching delay at Mile 4',
    congestionPct: 91
  }
];

export const WEATHER_ALERTS = [
  {
    id: 'wx-1',
    type: 'rain_surge',
    title: 'Flash Cloudburst Watch',
    severity: 'warning',
    window: '17:30 - 19:15',
    detail: '70% probability of rapid 25mm downpour. Low-lying market alleys may experience minor gutter flooding.',
    recommendation: 'Use covered pedestrian concourses; carry rain gear.'
  },
  {
    id: 'wx-2',
    type: 'aqi_good',
    title: 'Clean Marine Airflow',
    severity: 'info',
    window: 'All Day',
    detail: 'AQI 38 (Clean). Favorable sea breezes sweeping particulates inland. Ideal for waterfront jogging.',
    recommendation: 'Great time for outdoor walking tours and open rooftop dining.'
  }
];

export const SOCIAL_BUZZ_STREAM = [
  {
    id: 'soc-1',
    handle: '@MetroCommuteGuru',
    time: '4m ago',
    text: 'SafeRoute AI just rerouted me around the broken lamppost on Elm! So glad I didn’t stumble in the pitch black 🔦✨ #CityLife #SafeWalk',
    tag: '#SafeWalk'
  },
  {
    id: 'soc-2',
    handle: '@FoodieVagabond',
    time: '12m ago',
    text: 'Found the secret midnight matcha donuts behind the Clocktower Citadel! The line is 15 people long but moving fast 🍩🔥 #HiddenGem #CityEats',
    tag: '#CityEats'
  },
  {
    id: 'soc-3',
    handle: '@UrbanPulsePolice',
    time: '25m ago',
    text: 'Foot patrols active across Old Quarter & Civic Plaza. Remember to utilize blue emergency kiosks if you need immediate assistance 🛡️',
    tag: '#CitySafety'
  },
  {
    id: 'soc-4',
    handle: '@GreenUrbanite',
    time: '41m ago',
    text: 'Eco Garden Sector AQI is currently 18! Spent lunch break in the vertical pocket park. Pure zen sanctuary 🌿',
    tag: '#UrbanWellness'
  }
];
