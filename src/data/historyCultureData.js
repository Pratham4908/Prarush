// City Life: History & Culture Dataset
export const HERITAGE_SITES = [
  {
    id: 'heritage-1',
    name: 'The Clocktower Citadel of 1889',
    period: 'Late Victorian Industrial',
    coords: [40.7142, -74.0045],
    architect: 'Archibald Sterling',
    significance: 'Historic Municipal Landmark #4',
    rating: 4.9,
    visitorsAnnually: '1.2M',
    summary: 'The epicenter of the city’s early transit and telegraph network. Its bronze bell still rings on the hour, hand-wound weekly by a 4th-generation horologist.',
    fullHistory: 'Commissioned following the Great Industrial Exposition of 1889, the Citadel stood as the tallest building in the region for four decades. During World War II, its copper dome served as an aerial observation post. Today, the restored underground crypt houses interactive holograms of the historic underground steam tunnels.',
    traditions: [
      {
        title: 'The Noon Chime Echo',
        description: 'Locals stop for 10 seconds at 12:00 PM as the Citadel bell resonates across the plaza, often accompanied by impromptu acoustic buskers.'
      },
      {
        title: 'Harvest Lantern Festival',
        description: 'Every October, thousands of illuminated silk lanterns are hung from the arches to celebrate early harbor merchant history.'
      }
    ],
    audioGuide: {
      duration: '1:45',
      narrator: 'Dr. Evelyn Ward, Chief City Historian',
      transcript: 'Welcome to the Citadel. Look up at the quadruple brass faces of the clock. Each Roman numeral was forged from melted locomotive pistons from the first trans-urban railway line. If you step through the arched gateway, notice the wear on the bluestone pavers beneath your feet — over 130 years of merchants, dreamers, and night travelers walking the exact same corridor.'
    },
    dosAndDonts: [
      { type: 'do', text: 'Wear comfortable walking shoes for the 240-step spiral spire ascent.' },
      { type: 'do', text: 'Respect the quiet courtyard prayer nook.' },
      { type: 'dont', text: 'No flash photography inside the archival manuscript vault.' }
    ],
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
    tags: ['Victorian', 'Architecture', 'Audio Tour', 'Free Admission']
  },
  {
    id: 'heritage-2',
    name: 'Old Guildhall & Artisan Arcade',
    period: 'Early Colonial & Trade Era (1740s)',
    coords: [40.7171, -74.0018],
    architect: 'Guild Master Hans Lehmann',
    significance: 'UNESCO World Heritage Nominee',
    rating: 4.8,
    visitorsAnnually: '850K',
    summary: 'Cobblestone arcade where traditional bookbinders, leatherworkers, and spice apothecaries have maintained trade guilds for almost three centuries.',
    fullHistory: 'Originally established as a barter guild for incoming overseas merchant vessels. The timber beams in the main hall were salvaged from disassembled Dutch trade schooners.',
    traditions: [
      {
        title: 'Guild Stamp Passport',
        description: 'Visitors collect wax seals and ink stamps from 12 remaining guild artisans to redeem a handmade parchment certificate.'
      },
      {
        title: 'Winter Solstice Mulled Cider',
        description: 'Shopkeepers serve hot spiced cider in clay cups while traditional hurdy-gurdy folk songs echo through the arcade.'
      }
    ],
    audioGuide: {
      duration: '1:30',
      narrator: 'Marco Rossi, 5th-Gen Bookbinder',
      transcript: 'You are now breathing the scent of aged cedar and oil-tanned leather. Here in the Old Guildhall, modern mass production has never won. Every door you pass leads to a craft that has survived world wars, recessions, and the digital age. Listen carefully: the rhythmic tapping you hear is Master Thorne tooling calfskin just as his grandfather did in 1912.'
    },
    dosAndDonts: [
      { type: 'do', text: 'Ask artisans about their lineage and techniques; they love sharing stories.' },
      { type: 'dont', text: 'Do not haggle aggressively; guild prices reflect fair artisan wages.' }
    ],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    tags: ['Cobblestone', 'Craft Guilds', 'Handmade', 'Living History']
  },
  {
    id: 'heritage-3',
    name: 'Seafarer’s Memorial Lighthouse & Harbor Ramparts',
    period: 'Maritime Era (1832)',
    coords: [40.706, -74.0135],
    architect: 'Captain Thomas Vance',
    significance: 'National Maritime Sanctuary',
    rating: 4.7,
    visitorsAnnually: '620K',
    summary: 'Granite beacon overlooking the harbor straits, dedicated to generations of mariners who navigated hazardous ocean reefs.',
    fullHistory: 'Equipped with an authentic 1st-order Fresnel lens installed in 1856, the lighthouse guided over 40,000 ships into the natural harbor before automated GPS navigation took over.',
    traditions: [
      {
        title: 'Sunset Bell of the Mariners',
        description: 'At twilight, the fog bell is tapped three times to honor sailors lost at sea.'
      }
    ],
    audioGuide: {
      duration: '1:15',
      narrator: 'Sarah Jenkins, Marine Conservator',
      transcript: 'Feel the ocean spray against the granite ramparts. The granite blocks were hauled by barge from northern quarries in the bitter winter of 1831. When the fog rolled into this channel, the sound of the horn and the green sweep of this Fresnel lens were literally the difference between life and shipwrecks.'
    },
    dosAndDonts: [
      { type: 'do', text: 'Arrive 30 minutes before sunset for unmatched golden hour photography.' },
      { type: 'dont', text: 'Do not climb outer sea wall railings during high tide warnings.' }
    ],
    image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&auto=format&fit=crop&q=80',
    tags: ['Maritime', 'Lighthouse', 'Sunset Vista', 'Seacoast']
  }
];

export const CULTURAL_ETIQUETTE_GUIDE = [
  {
    topic: 'Metro & Public Transit',
    tip: 'Stand on the right on escalators, walk on the left. Keep backpacks in front of you during peak hours (8-10 AM & 5-7 PM). Avoid phone loudspeaker calls.',
    icon: 'train'
  },
  {
    topic: 'Tipping & Hospitality',
    tip: '15-20% is customary in sit-down restaurants. At casual food stalls and food carts, small change in the tip jar is appreciated but not mandatory.',
    icon: 'coffee'
  },
  {
    topic: 'Street Photography & Sacred Spaces',
    tip: 'Always nod or politely ask before taking close-up portraits of street vendors or community elders. Modest attire is required when visiting historic chapels.',
    icon: 'camera'
  },
  {
    topic: 'Bargaining & Market Etiquette',
    tip: 'Bargaining is accepted at open-air flea markets, but never at brick-and-mortar stores, artisan guilds, or street food stalls with printed menus.',
    icon: 'shopping-bag'
  }
];
