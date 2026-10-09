// City Life: Safety, Security & SafeRoute Intelligence Dataset

export const SAFETY_INCIDENTS = [
  {
    id: 'inc-1',
    type: 'poor_lighting',
    severity: 'medium', // low, medium, high
    title: 'Dim Street Lighting / Broken Lampposts',
    location: 'Elm Lane (between 3rd & 5th Ave)',
    coords: [40.7162, -74.0048],
    reportsCount: 19,
    verified: true,
    description: '3 consecutive municipal street lamps flickering or dark since Tuesday. Caution advised after 21:00.',
    safetyScoreImpact: -15,
    timestamp: '2 hours ago',
    category: 'Infrastructure',
    icon: 'lightbulb-off'
  },
  {
    id: 'inc-2',
    type: 'accident_zone',
    severity: 'high',
    title: 'High-Collision Intersection Hazard',
    location: 'Broad St & Market Crossing',
    coords: [40.7135, -74.0075],
    reportsCount: 34,
    verified: true,
    description: 'Blind corner with rapid delivery scooters and heavy bus traffic. 4 minor fender-benders logged this month.',
    safetyScoreImpact: -25,
    timestamp: '4 hours ago',
    category: 'Traffic Hazard',
    icon: 'alert-triangle'
  },
  {
    id: 'inc-3',
    type: 'harassment_risk',
    severity: 'high',
    title: 'Reported Unsafe Area / Solitary Alley',
    location: 'Shadow Alleyway Cut-Through',
    coords: [40.7188, -74.0062],
    reportsCount: 42,
    verified: true,
    description: 'Narrow passageway with zero pedestrian activity after dark and blocked CCTV visibility.',
    safetyScoreImpact: -35,
    timestamp: 'Yesterday',
    category: 'Personal Safety',
    icon: 'shield-alert'
  },
  {
    id: 'inc-4',
    type: 'safe_haven',
    severity: 'safe',
    title: '24/7 Police Substation & Emergency Kiosk',
    location: 'Civic Plaza North',
    coords: [40.7148, -74.0025],
    reportsCount: 0,
    verified: true,
    description: 'Manned police patrol post with blue emergency call box, defibrillator (AED), and bright LED illumination.',
    safetyScoreImpact: +20,
    timestamp: 'Always Active',
    category: 'Safe Haven',
    icon: 'shield-check'
  },
  {
    id: 'inc-5',
    type: 'construction',
    severity: 'low',
    title: 'Pavement Dig & Scaffolding Debris',
    location: 'Waterfront Esplanade Pier 4',
    coords: [40.7092, -74.011],
    reportsCount: 8,
    verified: true,
    description: 'Sidewalk partially restricted due to gas pipe upgrades. Temporary wooden ramp is slippery when wet.',
    safetyScoreImpact: -10,
    timestamp: '6 hours ago',
    category: 'Pedestrian Obstacle',
    icon: 'cone'
  }
];

export const ROUTE_OPTIONS = {
  origin: {
    name: 'Metropolis Central Train Station',
    coords: [40.7182, -74.0085]
  },
  destination: {
    name: 'The Rusty Lantern Ramen (Old Quarter)',
    coords: [40.7155, -74.003]
  },
  fastestRoute: {
    id: 'route-fastest',
    label: 'Fastest Route (Shortest Distance)',
    durationMinutes: 11,
    distanceKm: '1.1 km',
    safetyScore: 62,
    safetyGrade: 'C+ (Caution After Dark)',
    lightingIndex: '48% Lit',
    footfall: 'Low Footfall in Passageways',
    cctvCoverage: '32% Monitored',
    hazardsAvoided: '0 of 2 hazards avoided',
    summary: 'Cuts through Shadow Alley and unlit Elm Lane. 3 minutes faster, but exposes walker to blind spots.',
    color: '#f59e0b',
    waypoints: [
      [40.7182, -74.0085],
      [40.7185, -74.0065],
      [40.7162, -74.0048], // through dark Elm lane
      [40.7155, -74.003]
    ]
  },
  safestRoute: {
    id: 'route-safest',
    label: 'SafeRoute AI™ (Maximum Security & Well-Lit)',
    durationMinutes: 14,
    distanceKm: '1.4 km',
    safetyScore: 97,
    safetyGrade: 'A+ (Guardian Verified)',
    lightingIndex: '98% High-Output LED',
    footfall: 'High Active Footfall (Bustling)',
    cctvCoverage: '94% Smart Camera Coverage',
    hazardsAvoided: 'All 2 Hazards Avoided',
    summary: 'Follows vibrant Grand Boulevard, passes Civic Plaza Police Booth, stays on wide lit sidewalks.',
    color: '#10b981',
    waypoints: [
      [40.7182, -74.0085],
      [40.7145, -74.008],
      [40.7148, -74.0025], // passes police substation
      [40.7155, -74.003]
    ]
  }
};

export const EMERGENCY_CONTACTS = [
  { name: 'Emergency Police Dispatch', number: '911 / 112', type: 'police', desc: 'Immediate emergency response' },
  { name: 'City Tourist Helpline', number: '+1 (800) 555-CITY', type: 'tourist', desc: 'Multilingual traveler safety & directions' },
  { name: 'Transit Safety Patrol', number: '+1 (800) 555-RAIL', type: 'transit', desc: 'Subway & bus incident line' },
  { name: 'Women & Nightwalker Escort', number: '+1 (800) 555-SAFE', type: 'escort', desc: 'Free volunteer campus/district walking escorts' }
];
