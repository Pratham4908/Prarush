// City Life: Best vs. Worst Places Benchmark & Comparison Dataset

export const NEIGHBORHOOD_BENCHMARKS = [
  {
    id: 'old-quarter',
    name: 'Old Quarter (Historic Center)',
    tagline: 'Vibrant cobblestone alleys & culinary soul',
    overallScore: 84,
    metrics: {
      safety: 82,
      cleanliness: 76,
      affordability: 88, // 100 = very budget friendly
      ratings: 94,
      accessibility: 90,
      noiseLevel: 58 // 100 = peaceful, lower = loud/chaotic
    },
    pros: [
      'Unrivaled street food and historic heritage',
      'Ultra walkable pedestrian zones',
      'High density of budget-friendly hostels & izakayas'
    ],
    cons: [
      'High noise levels during late-night tavern hours',
      'Narrow passages can have dim lighting spots'
    ],
    bestFor: 'Culture Seekers, Foodies & Solo Explorers',
    worstFor: 'Light Sleepers & Large Vehicle Access',
    crimeStat: 'Low violent crime; occasional bag pickpocketing in crowded bazaars',
    avgMealPrice: '$12 - $18',
    transitScore: '9.2/10 (3 Metro Stations, 12 Tram lines)',
    safetyRank: '#3 in City'
  },
  {
    id: 'financial-uptown',
    name: 'Financial & Skyline Uptown',
    tagline: 'Polished skyscrapers & pristine corporate plazas',
    overallScore: 88,
    metrics: {
      safety: 96,
      cleanliness: 98,
      affordability: 35, // expensive!
      ratings: 86,
      accessibility: 94,
      noiseLevel: 78
    },
    pros: [
      'Top-tier 24/7 security & flawless street lighting',
      'Pristine streets and manicured high-rise boulevards',
      'Direct rapid express trains to airport'
    ],
    cons: [
      'Extremely high dining and hotel prices',
      'Lacks organic street culture; feels sterile after 8 PM'
    ],
    bestFor: 'Business Travelers, Luxury Stays & Night Solitude',
    worstFor: 'Backpackers & Cultural Immersion',
    crimeStat: 'Lowest crime rate in metropolitan registry (< 1.2 incidents / 10k)',
    avgMealPrice: '$35 - $75',
    transitScore: '9.8/10 (Express Lines & Helipads)',
    safetyRank: '#1 in City'
  },
  {
    id: 'arts-district',
    name: 'Arts & Warehouse District',
    tagline: 'Edgy murals, underground music & loft galleries',
    overallScore: 79,
    metrics: {
      safety: 72,
      cleanliness: 70,
      affordability: 82,
      ratings: 91,
      accessibility: 85,
      noiseLevel: 62
    },
    pros: [
      'Dynamic creative community and independent coffee roasters',
      'Budget capsule stays and vintage thrift markets',
      'Vibrant nightlife and live warehouse venues'
    ],
    cons: [
      'Poor street lighting on peripheral industrial blocks',
      'Occasional property vandalism and scooter speeding'
    ],
    bestFor: 'Artists, Young Nomads & Night Owls',
    worstFor: 'Families with young children after dark',
    crimeStat: 'Moderate petty theft and bicycle theft hot spots',
    avgMealPrice: '$14 - $22',
    transitScore: '8.4/10 (Bus Rapid Transit & Bike Lanes)',
    safetyRank: '#4 in City'
  },
  {
    id: 'harbor-bay',
    name: 'Harbor Bay Waterfront',
    tagline: 'Ocean air, wooden promenades & fresh seafood docks',
    overallScore: 90,
    metrics: {
      safety: 93,
      cleanliness: 92,
      affordability: 52,
      ratings: 96,
      accessibility: 82,
      noiseLevel: 88
    },
    pros: [
      'Panoramic ocean sunsets and fresh salt air',
      'Zero vehicle pollution on seaside esplanade',
      'Extremely high public hygiene and clean public restrooms'
    ],
    cons: [
      'Wind chill and sudden sea squalls during evening',
      'Limited late-night transport frequencies'
    ],
    bestFor: 'Couples, Leisure Walkers & Sunset Dining',
    worstFor: 'Quick budget commuter stays',
    crimeStat: 'Very safe; maritime patrols and family crowd',
    avgMealPrice: '$28 - $55',
    transitScore: '7.8/10 (Ferry Terminals & Tramway 4)',
    safetyRank: '#2 in City'
  },
  {
    id: 'north-terminal-zone',
    name: 'North Freight & Transit Terminal',
    tagline: 'High chaos logistics corridor & heavy freight hub',
    overallScore: 54,
    metrics: {
      safety: 52,
      cleanliness: 45,
      affordability: 95, // ultra cheap food
      ratings: 62,
      accessibility: 88,
      noiseLevel: 28 // very loud
    },
    pros: [
      'Cheapest street eats and 24-hour truck stop diners',
      'Massive intercity bus terminal connections'
    ],
    cons: [
      'High vehicle emissions, dust, and heavy truck vibrations',
      'Poor pedestrian crossings with high accident frequency',
      'Several dark underpasses with low security presence'
    ],
    bestFor: 'Urgent early-morning bus connections',
    worstFor: 'Casual tourism, leisure walking or night solo travel',
    crimeStat: 'Highest accident collision rate and reported pickpocketing',
    avgMealPrice: '$5 - $10',
    transitScore: '8.9/10 (Heavy Rail & Bus Transit)',
    safetyRank: '#6 (Caution Advised)'
  },
  {
    id: 'eco-garden-haven',
    name: 'Eco Garden Haven & Green Valley',
    tagline: 'Serene botanical slopes & community permaculture',
    overallScore: 89,
    metrics: {
      safety: 95,
      cleanliness: 96,
      affordability: 68,
      ratings: 93,
      accessibility: 74,
      noiseLevel: 95
    },
    pros: [
      'Cleanest air quality index (AQI < 20) in the metro area',
      'Serene forest trails and organic farm-to-table tea houses',
      'Virtually zero street noise'
    ],
    cons: [
      'Steep inclines require good stamina or e-bikes',
      'Fewer metro stations; 15-minute walk between transit stops'
    ],
    bestFor: 'Wellness, Nature Lovers & Restful Sleep',
    worstFor: 'Fast-paced party seekers',
    crimeStat: 'Near zero reported offenses',
    avgMealPrice: '$18 - $30',
    transitScore: '6.9/10 (Green Shuttle & E-Bike docks)',
    safetyRank: '#1 tie for Residential Peace'
  }
];

export const COMPARISON_METRIC_CONFIG = [
  { key: 'safety', label: 'Safety & Security', icon: 'shield', color: '#10b981', desc: 'Street lighting, CCTV, low crime rates' },
  { key: 'cleanliness', label: 'Cleanliness & Hygiene', icon: 'sparkles', color: '#3b82f6', desc: 'Sanitation, waste management, fresh air' },
  { key: 'affordability', label: 'Affordability', icon: 'dollar-sign', color: '#f59e0b', desc: 'Value for money, dining & lodging rates' },
  { key: 'ratings', label: 'Visitor Ratings', icon: 'star', color: '#ec4899', desc: 'Aggregated reviews and tourist satisfaction' },
  { key: 'accessibility', label: 'Transit & Accessibility', icon: 'map-pin', color: '#8b5cf6', desc: 'Metro density, walkability, wheelchair ramps' },
  { key: 'noiseLevel', label: 'Peace & Quietness', icon: 'volume-x', color: '#06b6d4', desc: 'Absence of traffic roars, siren noise, loud bars' }
];
