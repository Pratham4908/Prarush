import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, Crosshair, Shield, MapPin, Eye, Search, Navigation2, 
  Map as MapIcon, Compass, Sparkles, AlertTriangle, Loader2 
} from 'lucide-react';
import { searchGlobalLocation, reverseGeocodeCoords, getBrowserGeolocation } from '../utils/locationService.js';
import { audioSystem } from '../utils/audioSystem.js';

const TILE_SERVERS = {
  dark: {
    name: 'Dark Luxe',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap'
  },
  street: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  light: {
    name: 'Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap'
  }
};

export default function InteractiveMap({
  center = [40.7128, -74.006],
  zoom = 13,
  spots = [],
  heritageSites = [],
  incidents = [],
  routeData = null,
  activeRouteType = 'safest', // 'safest', 'fastest', 'both'
  onSelectSpot,
  onSelectHeritage,
  onLocationSelected, // callback when a global place is searched or clicked
  onSetRouteDestination,
  onOpenReportAtLocation,
  height = '380px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const routesLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const clickMarkerRef = useRef(null);

  // States
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'spots', 'safety', 'heritage'
  const [activeTileTheme, setActiveTileTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false
      });

      // Default Dark tile layer
      tileLayerRef.current = L.tileLayer(TILE_SERVERS[activeTileTheme].url, {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Custom bottom-right zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);

      // Map Click Handler for Reverse Geocoding
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        if (clickMarkerRef.current) {
          map.removeLayer(clickMarkerRef.current);
        }

        const customPinIcon = L.divIcon({
          className: 'custom-click-pin',
          html: `<div style="width:24px;height:24px;background:#ec4899;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px #ec4899;">📍</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        clickMarkerRef.current = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);

        // Fetch Reverse Geocoded Address
        const geoInfo = await reverseGeocodeCoords(lat, lng);
        setClickedLocation({
          coords: [lat, lng],
          ...geoInfo
        });
      });

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // 2. Change Tile Layer theme (Dark, Street, Light)
  const handleChangeTheme = (themeKey) => {
    setActiveTileTheme(themeKey);
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = L.tileLayer(TILE_SERVERS[themeKey].url, {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapInstanceRef.current);
    }
  };

  // 3. Search Global Location via Nominatim API
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchGlobalLocation(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.warn('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setSearchResults([]);
    setSearchQuery(result.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(result.coords, 14, { duration: 1.2 });
    }
    audioSystem.playTone(660, 'sine', 0.1);

    if (onLocationSelected) {
      onLocationSelected(result.name, result.coords, result.country);
    }
  };

  // 4. Real Browser GPS Location
  const handleLocateUser = async () => {
    setIsLocating(true);
    try {
      const pos = await getBrowserGeolocation();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(pos.coords, 15, { duration: 1.2 });

        // Add GPS user marker
        const userIcon = L.divIcon({
          className: 'user-gps-pulse',
          html: `<div style="width:20px;height:20px;background:#38bdf8;border:3px solid #fff;border-radius:50%;box-shadow:0 0 16px #38bdf8;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker(pos.coords, { icon: userIcon }).addTo(layerGroupRef.current).bindPopup('<b>You are here!</b> Live GPS locked.').openPopup();

        // Reverse geocode user location
        const geoInfo = await reverseGeocodeCoords(pos.coords[0], pos.coords[1]);
        if (onLocationSelected) {
          onLocationSelected(geoInfo.city || geoInfo.name, pos.coords, geoInfo.country);
        }
      }
      audioSystem.playSuccessSound();
    } catch (err) {
      console.warn('Geolocation error:', err);
      // Fallback fly to center
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(center, 14, { duration: 1 });
      }
    } finally {
      setIsLocating(false);
    }
  };

  // 5. Update Markers & SafeRoute Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = layerGroupRef.current;
    const routesLayer = routesLayerRef.current;

    if (!map || !markersLayer || !routesLayer) return;

    markersLayer.clearLayers();
    routesLayer.clearLayers();

    // Render Explore Spots
    if (activeFilter === 'all' || activeFilter === 'spots') {
      spots.forEach((spot) => {
        const isFood = spot.category === 'food';
        const isHotel = spot.category === 'hotel';
        const iconEmoji = isFood ? '🍜' : (isHotel ? '🏨' : '✨');
        const borderColor = isFood ? '#f59e0b' : (isHotel ? '#8b5cf6' : '#06b6d4');

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: #111827;
              border: 2px solid ${borderColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.6);
              cursor: pointer;
              font-size: 14px;
            ">
              ${iconEmoji}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker(spot.coords, { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; max-width: 210px;">
            <div style="font-weight: 700; color: #fff; font-size: 13px;">${spot.name}</div>
            <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${spot.neighborhood}</div>
            <div style="display: flex; gap: 8px; margin-bottom: 6px;">
              <span style="color: #fbbf24;">★ ${spot.rating}</span>
              <span style="color: #10b981;">🛡️ ${spot.safetyScore}% Safe</span>
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px;">${spot.description.slice(0, 80)}...</div>
          </div>
        `);
        marker.on('click', () => {
          if (onSelectSpot) onSelectSpot(spot);
        });
        markersLayer.addLayer(marker);
      });
    }

    // Render Heritage Sites
    if (activeFilter === 'all' || activeFilter === 'heritage') {
      heritageSites.forEach((site) => {
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              width: 34px;
              height: 34px;
              background: #1e1b4b;
              border: 2px solid #a855f7;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(168,85,247,0.4);
              cursor: pointer;
              font-size: 15px;
            ">
              🏛️
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker(site.coords, { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; max-width: 210px;">
            <div style="font-weight: 700; color: #e9d5ff; font-size: 13px;">${site.name}</div>
            <div style="color: #c084fc; font-size: 10px; margin-bottom: 4px;">${site.period}</div>
            <div style="color: #cbd5e1; font-size: 11px;">${site.summary.slice(0, 80)}...</div>
          </div>
        `);
        marker.on('click', () => {
          if (onSelectHeritage) onSelectHeritage(site);
        });
        markersLayer.addLayer(marker);
      });
    }

    // Render Safety Incidents & Havens
    if (activeFilter === 'all' || activeFilter === 'safety') {
      incidents.forEach((inc) => {
        const isSafeHaven = inc.type === 'safe_haven';
        const color = isSafeHaven ? '#10b981' : (inc.severity === 'high' ? '#f43f5e' : '#f59e0b');
        const iconEmoji = isSafeHaven ? '🛡️' : (inc.type === 'poor_lighting' ? '💡' : '⚠️');

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background: #090d16;
              border: 2px solid ${color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 10px ${color}88;
              cursor: pointer;
              font-size: 13px;
            ">
              ${iconEmoji}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker(inc.coords, { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; max-width: 200px;">
            <div style="font-weight: 700; color: ${color}; font-size: 13px;">${inc.title}</div>
            <div style="color: #94a3b8; font-size: 10px; margin-bottom: 4px;">${inc.location}</div>
            <div style="color: #e2e8f0; font-size: 11px;">${inc.description}</div>
          </div>
        `);
        markersLayer.addLayer(marker);
      });
    }

    // Render SafeRoute Polylines
    if (routeData) {
      const { fastestRoute, safestRoute, origin, destination } = routeData;

      if (origin && origin.coords) {
        const originMarker = L.circleMarker(origin.coords, {
          radius: 8,
          fillColor: '#38bdf8',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).bindPopup(`<b>Start / Origin:</b> ${origin.name}`);
        routesLayer.addLayer(originMarker);
      }

      if (destination && destination.coords) {
        const destMarker = L.circleMarker(destination.coords, {
          radius: 8,
          fillColor: '#ec4899',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).bindPopup(`<b>Safe Destination:</b> ${destination.name}`);
        routesLayer.addLayer(destMarker);
      }

      // Fastest Route (dashed amber)
      if (fastestRoute && (activeRouteType === 'fastest' || activeRouteType === 'both')) {
        const fastestLine = L.polyline(fastestRoute.waypoints, {
          color: '#f59e0b',
          weight: activeRouteType === 'fastest' ? 6 : 4,
          dashArray: '8, 8',
          opacity: activeRouteType === 'fastest' ? 0.95 : 0.6
        }).bindPopup(`<b>Fastest Route:</b> ${fastestRoute.durationMinutes} mins`);
        routesLayer.addLayer(fastestLine);
      }

      // Safest Route (solid glowing emerald)
      if (safestRoute && (activeRouteType === 'safest' || activeRouteType === 'both')) {
        const haloLine = L.polyline(safestRoute.waypoints, {
          color: '#10b981',
          weight: 10,
          opacity: 0.35
        });
        routesLayer.addLayer(haloLine);

        const safestLine = L.polyline(safestRoute.waypoints, {
          color: '#10b981',
          weight: 5,
          opacity: 1
        }).bindPopup(`<b>SafeRoute AI™:</b> ${safestRoute.durationMinutes} mins (Safety: ${safestRoute.safetyScore}%)`);
        routesLayer.addLayer(safestLine);
      }
    }
  }, [spots, heritageSites, incidents, routeData, activeRouteType, activeFilter, onSelectSpot, onSelectHeritage]);

  return (
    <div className="map-container-wrap" style={{ height, position: 'relative' }}>
      {/* Top Global Search & Controls Overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 600,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none'
      }}>
        {/* Global Location Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(13, 19, 33, 0.92)',
            backdropFilter: 'blur(14px)',
            border: '1px solid var(--border-glass)',
            borderRadius: 999,
            padding: '4px 10px 4px 14px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            id="global-map-search-input"
            type="text"
            placeholder="Search ANY city, address, or landmark worldwide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.78rem',
              fontFamily: 'inherit'
            }}
          />
          {isSearching ? (
            <Loader2 size={16} color="#06b6d4" className="animate-spin" />
          ) : (
            <button
              type="submit"
              className="sim-btn"
              style={{ padding: '3px 8px', fontSize: '0.7rem' }}
            >
              Go
            </button>
          )}
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            pointerEvents: 'auto',
            background: 'rgba(17, 24, 39, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-glass)',
            borderRadius: 14,
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
            maxHeight: 180,
            overflowY: 'auto'
          }}>
            {searchResults.map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.74rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <MapPin size={14} color="#06b6d4" />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{res.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {res.fullName}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Filter Chips & Layer Theme Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Pins Filter Group */}
          <div className="map-pill-group" style={{ pointerEvents: 'auto' }}>
            <button
              className={`map-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`map-pill-btn ${activeFilter === 'spots' ? 'active' : ''}`}
              onClick={() => setActiveFilter('spots')}
            >
              Places
            </button>
            <button
              className={`map-pill-btn ${activeFilter === 'safety' ? 'active' : ''}`}
              onClick={() => setActiveFilter('safety')}
            >
              Safety
            </button>
            <button
              className={`map-pill-btn ${activeFilter === 'heritage' ? 'active' : ''}`}
              onClick={() => setActiveFilter('heritage')}
            >
              History
            </button>
          </div>

          {/* Map Controls: Theme Switcher + Real GPS Locator */}
          <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
            {/* Tile Layer switcher */}
            <div className="map-pill-group">
              <button
                className={`map-pill-btn ${activeTileTheme === 'dark' ? 'active' : ''}`}
                onClick={() => handleChangeTheme('dark')}
                title="Dark Vector Map"
              >
                🌙
              </button>
              <button
                className={`map-pill-btn ${activeTileTheme === 'street' ? 'active' : ''}`}
                onClick={() => handleChangeTheme('street')}
                title="Standard OpenStreetMap"
              >
                🗺️
              </button>
              <button
                className={`map-pill-btn ${activeTileTheme === 'light' ? 'active' : ''}`}
                onClick={() => handleChangeTheme('light')}
                title="Light Map"
              >
                ☀️
              </button>
            </div>

            {/* Locate Me (Real GPS) */}
            <button
              className="header-icon-btn"
              style={{
                background: 'rgba(13, 19, 33, 0.9)',
                backdropFilter: 'blur(8px)',
                width: 30,
                height: 30
              }}
              onClick={handleLocateUser}
              title="Locate My Real GPS Position"
              aria-label="Locate User GPS"
            >
              {isLocating ? (
                <Loader2 size={14} color="#38bdf8" className="animate-spin" />
              ) : (
                <Crosshair size={14} color="#38bdf8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Click Pin Quick Action Bottom Sheet */}
      {clickedLocation && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          zIndex: 650,
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-glass-glow)',
          borderRadius: 14,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: 'var(--shadow-md)',
          animation: 'slideInUp 0.25s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} color="#ec4899" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                  {clickedLocation.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  {clickedLocation.fullName.slice(0, 55)}...
                </div>
              </div>
            </div>
            <button
              className="header-icon-btn"
              style={{ width: 22, height: 22, padding: 0 }}
              onClick={() => setClickedLocation(null)}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-primary"
              style={{ padding: '6px 10px', fontSize: '0.72rem' }}
              onClick={() => {
                if (onSetRouteDestination) {
                  onSetRouteDestination({
                    name: clickedLocation.name,
                    coords: clickedLocation.coords
                  });
                }
                setClickedLocation(null);
              }}
            >
              <Navigation2 size={13} />
              Navigate Safely Here
            </button>

            <button
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.72rem' }}
              onClick={() => {
                if (onOpenReportAtLocation) {
                  onOpenReportAtLocation(clickedLocation.name, clickedLocation.coords);
                }
                setClickedLocation(null);
              }}
            >
              <AlertTriangle size={13} color="#f59e0b" />
              Report Hazard
            </button>
          </div>
        </div>
      )}

      {/* Leaflet DOM element */}
      <div ref={mapContainerRef} className="leaflet-map-element" id="interactive-leaflet-map" />
    </div>
  );
}
