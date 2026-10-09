// Global Location Service: Real Geocoding, Reverse Geocoding & Dynamic City Generator

// 1. Live Geocoding using OpenStreetMap Nominatim API (Free, global, no key needed)
export async function searchGlobalLocation(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=6&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CityLifeMobileApp/2.0'
      }
    });

    if (!response.ok) throw new Error('Geocoding request failed');
    const data = await response.json();

    return data.map(item => ({
      id: `geo-${item.place_id}`,
      name: item.display_name.split(',')[0],
      fullName: item.display_name,
      country: item.address?.country || 'Global',
      city: item.address?.city || item.address?.town || item.address?.village || item.address?.state || item.display_name.split(',')[0],
      coords: [parseFloat(item.lat), parseFloat(item.lon)],
      type: item.type,
      importance: item.importance
    }));
  } catch (error) {
    console.warn('Live geocoding network error, using fallback matching:', error);
    return getOfflineLocationFallbacks(query);
  }
}

// 2. Reverse Geocode Coordinates to Address
export async function reverseGeocodeCoords(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CityLifeMobileApp/2.0'
      }
    });

    if (!response.ok) throw new Error('Reverse geocoding failed');
    const item = await response.json();

    return {
      name: item.address?.road || item.address?.suburb || item.display_name.split(',')[0],
      fullName: item.display_name,
      city: item.address?.city || item.address?.town || item.address?.county || 'Current Area',
      country: item.address?.country || ''
    };
  } catch (e) {
    return {
      name: `Pin (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      fullName: `Custom Geographic Point at ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      city: 'Selected Location',
      country: ''
    };
  }
}

// 3. User's Real Browser GPS Location
export function getBrowserGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          coords: [pos.coords.latitude, pos.coords.longitude],
          accuracy: pos.coords.accuracy
        });
      },
      (err) => {
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

// 4. Generate dynamic, localized city dataset for ANY global coordinate
export function generateCityProfileForLocation(name, coords, country = 'World') {
  const [lat, lon] = coords;
  const offset = 0.006;

  return {
    id: `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(lat * 100)}`,
    name: `${name} (Global Location)`,
    country: country,
    center: [lat, lon],
    zoom: 14,
    weather: {
      temp: Math.round(18 + (Math.sin(lat) * 8)),
      condition: 'Partly Sunny',
      aqi: Math.round(30 + Math.abs(Math.sin(lon) * 35)),
      aqiStatus: 'Moderate',
      rainChance: Math.round(20 + Math.abs(Math.cos(lat) * 40)),
      humidity: 62,
      uv: 5
    },
    trafficIndex: Math.round(45 + Math.abs(Math.sin(lat * lon) * 40)),
    // Dynamically generated local spots around this coordinate
    spots: [
      {
        id: `gen-food-1`,
        name: `${name} Artisan Street Bistro & Local Cafe`,
        category: 'food',
        subCategory: 'Local Food Pick',
        neighborhood: `${name} Central Plaza`,
        coords: [lat + offset * 0.7, lon - offset * 0.5],
        rating: 4.8,
        reviewsCount: 340,
        priceTier: '$$',
        costAvg: '$12 - $20',
        isBudgetPick: true,
        isLocalFavorite: true,
        safetyScore: 94,
        cleanlinessScore: 92,
        openingHours: '10:00 AM - 11:30 PM',
        busyLevel: 'Moderate',
        description: `Cozy local gathering spot in ${name} celebrated for authentic regional culinary specialties and warm hospitality.`,
        tags: ['Authentic', 'Local Flavors', 'Outdoor Seating'],
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        insiderTip: 'Ask the barista for today’s seasonal roast and freshly baked morning pastries.',
        audioStory: `Beloved neighborhood anchor where locals gather every morning to debate daily news and exchange community notices.`
      },
      {
        id: `gen-landmark-1`,
        name: `${name} Historic Square & Memorial Bell`,
        category: 'attraction',
        subCategory: 'Heritage Landmark',
        neighborhood: `${name} Historic Quarter`,
        coords: [lat - offset * 0.6, lon + offset * 0.8],
        rating: 4.9,
        reviewsCount: 1240,
        priceTier: '$',
        costAvg: 'Free Public Access',
        isBudgetPick: true,
        isLocalFavorite: false,
        safetyScore: 96,
        cleanlinessScore: 95,
        openingHours: 'Open 24/7',
        busyLevel: 'Popular Vista',
        description: `Iconic town center square surrounded by historic civic architecture, stone colonnades, and lively street buskers.`,
        tags: ['Architecture', 'Monument', 'Pedestrian Promenade'],
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
        insiderTip: 'Visit during twilight when the stone facades are bathed in warm golden illumination.',
        audioStory: `Constructed during the town’s first municipal charter, this square served as a trading nexus for early merchant wagons.`
      },
      {
        id: `gen-hotel-1`,
        name: `The Sanctuary Boutique Stay & Pods`,
        category: 'hotel',
        subCategory: 'Budget-Friendly Stay',
        neighborhood: `${name} Transit Walk`,
        coords: [lat + offset * 1.1, lon + offset * 0.3],
        rating: 4.6,
        reviewsCount: 520,
        priceTier: '$',
        costAvg: '$45 / night',
        isBudgetPick: true,
        isLocalFavorite: false,
        safetyScore: 93,
        cleanlinessScore: 94,
        openingHours: '24/7 Check-in',
        busyLevel: 'Low',
        description: `Modern minimalist eco-stay offering ergonomic sound-isolated rooms, rooftop terrace, and fast fiber Wi-Fi.`,
        tags: ['Digital Nomad', 'Secure', 'Transit Friendly'],
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
        insiderTip: 'Book upper-level rooms for quiet night rest and sweeping city views.',
        audioStory: `Converted from an artisan leather tannery in 2019 into a sustainable, solar-powered boutique hotel.`
      }
    ],
    // Dynamically generated safety incidents around this location
    incidents: [
      {
        id: `gen-safe-haven`,
        type: 'safe_haven',
        severity: 'safe',
        title: `${name} Police Substation & Emergency Kiosk`,
        location: `${name} Central Boulevard`,
        coords: [lat + offset * 0.2, lon - offset * 0.3],
        reportsCount: 0,
        verified: true,
        description: `Active municipal patrol hub with 24/7 dispatch officers, emergency call box, and bright LED illumination.`,
        safetyScoreImpact: 20,
        timestamp: 'Always Active',
        category: 'Safe Haven'
      },
      {
        id: `gen-hazard-1`,
        type: 'poor_lighting',
        severity: 'medium',
        title: `Dimly Lit Alley Shortcut`,
        location: `${name} North Alleyway`,
        coords: [lat - offset * 0.5, lon - offset * 0.6],
        reportsCount: 14,
        verified: true,
        description: `Narrow pedestrian path with intermittent streetlamp coverage after dark. SafeRoute AI recommends the lit main avenue.`,
        safetyScoreImpact: -15,
        timestamp: '3 hours ago',
        category: 'Infrastructure'
      }
    ],
    // Dynamic SafeRoute coordinates
    routes: {
      origin: {
        name: `${name} Central Transit Station`,
        coords: [lat - offset * 0.8, lon - offset * 0.7]
      },
      destination: {
        name: `${name} Artisan Street Bistro`,
        coords: [lat + offset * 0.7, lon - offset * 0.5]
      },
      fastestRoute: {
        id: 'route-fastest',
        label: 'Fastest Path (Shortcut through Alley)',
        durationMinutes: 9,
        distanceKm: '0.9 km',
        safetyScore: 64,
        lightingIndex: '52% Lit',
        footfall: 'Low Footfall',
        cctvCoverage: '35% CCTV',
        waypoints: [
          [lat - offset * 0.8, lon - offset * 0.7],
          [lat - offset * 0.5, lon - offset * 0.6], // cuts through dark alley
          [lat + offset * 0.7, lon - offset * 0.5]
        ]
      },
      safestRoute: {
        id: 'route-safest',
        label: 'SafeRoute AI™ (High-Output LED & Monitored)',
        durationMinutes: 12,
        distanceKm: '1.2 km',
        safetyScore: 96,
        lightingIndex: '97% LED Lighting',
        footfall: 'High Footfall (Bustling)',
        cctvCoverage: '92% Monitored',
        waypoints: [
          [lat - offset * 0.8, lon - offset * 0.7],
          [lat - offset * 0.2, lon - offset * 0.4],
          [lat + offset * 0.2, lon - offset * 0.3], // passes police kiosk
          [lat + offset * 0.7, lon - offset * 0.5]
        ]
      }
    }
  };
}

// Fallback search database if offline
function getOfflineLocationFallbacks(query) {
  const q = query.toLowerCase();
  const presets = [
    { name: 'Paris', city: 'Paris', country: 'France', coords: [48.8566, 2.3522] },
    { name: 'Tokyo', city: 'Tokyo', country: 'Japan', coords: [35.6762, 139.6503] },
    { name: 'New York', city: 'New York', country: 'United States', coords: [40.7128, -74.006] },
    { name: 'London', city: 'London', country: 'United Kingdom', coords: [51.5074, -0.1278] },
    { name: 'Berlin', city: 'Berlin', country: 'Germany', coords: [52.52, 13.405] },
    { name: 'Mumbai', city: 'Mumbai', country: 'India', coords: [19.076, 72.8777] },
    { name: 'Sydney', city: 'Sydney', country: 'Australia', coords: [-33.8688, 151.2093] },
    { name: 'Rome', city: 'Rome', country: 'Italy', coords: [41.9028, 12.4964] },
    { name: 'Cairo', city: 'Cairo', country: 'Egypt', coords: [30.0444, 31.2357] },
    { name: 'Singapore', city: 'Singapore', country: 'Singapore', coords: [1.3521, 103.8198] }
  ];

  return presets
    .filter(p => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q))
    .map(p => ({
      id: `fallback-${p.name.toLowerCase()}`,
      name: p.name,
      fullName: `${p.name}, ${p.country}`,
      country: p.country,
      city: p.city,
      coords: p.coords
    }));
}
