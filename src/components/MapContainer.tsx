import React, { useEffect, useRef, useState } from 'react';
import { Navigation2 } from 'lucide-react';

interface POI {
  id: string;
  name: string;
  type: 'restroom' | 'fuel' | 'parking' | 'water';
  lat: number;
  lng: number;
  details: string;
}

interface MapContainerProps {
  googleMapsApiKey: string | null;
  userLocation: { lat: number; lng: number } | null;
  pois: POI[];
  activeFilters: {
    restroom: boolean;
    fuel: boolean;
    parking: boolean;
    water: boolean;
  };
  onSelectPoi: (poi: POI | null) => void;
}

const mapDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#10b981" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#475569" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f8fafc" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b0f19" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] }
];

export const MapContainer: React.FC<MapContainerProps> = ({
  googleMapsApiKey,
  userLocation,
  pois,
  activeFilters,
  onSelectPoi,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [googleMapInstance, setGoogleMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [userMarker, setUserMarker] = useState<any>(null);

  // Initialize and load Google Map
  useEffect(() => {
    if (!googleMapsApiKey || !mapRef.current) {
      setGoogleMapInstance(null);
      return;
    }

    const initMap = () => {
      if (!mapRef.current) return;
      const maps = (window as any).google.maps;
      const center = userLocation || { lat: 37.7749, lng: -122.4194 };
      
      try {
        const map = new maps.Map(mapRef.current, {
          center: center,
          zoom: 15,
          styles: mapDarkStyle,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        });

        setGoogleMapInstance(map);
        setMapError(null);
      } catch (err: any) {
        console.error("Error creating map object:", err);
        setMapError("Failed to initialize Google Maps UI.");
      }
    };

    // Check if script is already present
    if ((window as any).google && (window as any).google.maps) {
      initMap();
      return;
    }

    const callbackName = 'initGoogleMapCallback';
    (window as any)[callbackName] = () => {
      initMap();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setMapError("Failed to load Google Maps script. Check key/connection.");
    };
    
    document.head.appendChild(script);

    return () => {
      // Clean up callback
      delete (window as any)[callbackName];
    };
  }, [googleMapsApiKey]);

  // Center Map on User Location and update User Location marker
  useEffect(() => {
    if (googleMapInstance && userLocation) {
      const maps = (window as any).google.maps;
      googleMapInstance.setCenter(userLocation);
      
      // Update or create User Marker
      if (userMarker) {
        userMarker.setPosition(userLocation);
      } else {
        const marker = new maps.Marker({
          position: userLocation,
          map: googleMapInstance,
          title: "Your Location (Driver)",
          icon: {
            path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#ff6b00",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
            rotation: 45
          }
        });
        setUserMarker(marker);
      }
    }
  }, [googleMapInstance, userLocation, userMarker]);

  // Update POI markers on map
  useEffect(() => {
    if (!googleMapInstance) return;

    const maps = (window as any).google.maps;

    // Clear old markers
    markers.forEach(m => m.setMap(null));
    const newMarkers: any[] = [];

    // Filter POIs
    const filteredPois = pois.filter(poi => activeFilters[poi.type]);

    filteredPois.forEach(poi => {
      let markerColor = "#ffffff";
      if (poi.type === 'restroom') markerColor = "#3b82f6";
      else if (poi.type === 'fuel') markerColor = "#eab308";
      else if (poi.type === 'parking') markerColor = "#ff6b00";
      else if (poi.type === 'water') markerColor = "#06b6d4";

      const marker = new maps.Marker({
        position: { lat: poi.lat, lng: poi.lng },
        map: googleMapInstance,
        title: poi.name,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        }
      });

      const infoWindow = new maps.InfoWindow({
        content: `
          <div style="color: #0f172a; padding: 6px; font-family: sans-serif; font-size: 12px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold;">${poi.name}</h4>
            <p style="margin: 0 0 6px 0; color: #475569;">${poi.details}</p>
            <span style="font-weight: bold; color: ${markerColor}; text-transform: uppercase; font-size: 9px;">${poi.type}</span>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapInstance, marker);
        onSelectPoi(poi);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [googleMapInstance, pois, activeFilters]);

  // RENDER FALLBACK / DEMO INTERACTIVE MAP IF GOOGLE MAPS API KEY NOT LOADED
  if (!googleMapsApiKey || mapError) {
    const defaultCenter = userLocation || { lat: 37.7749, lng: -122.4194 };
    const filteredPois = pois.filter(poi => activeFilters[poi.type]);
    
    return (
      <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center min-h-[400px] rounded-xl overflow-hidden">
        {/* Visual Map Canvas Grid */}
        <div className="absolute inset-0 bg-[#0f172a] overflow-hidden select-none">
          <svg width="100%" height="100%" className="w-full h-full opacity-95">
            <defs>
              <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />

            {/* Water Body (River) */}
            <path 
              d="M -100,80 Q 200,120 450,70 T 1100,90" 
              fill="none" 
              stroke="#0f2038" 
              strokeWidth="48" 
              strokeLinecap="round"
              opacity="0.8" 
            />
            <path 
              d="M -100,80 Q 200,120 450,70 T 1100,90" 
              fill="none" 
              stroke="#1d4ed8" 
              strokeWidth="2" 
              strokeLinecap="round"
              opacity="0.15" 
            />
            <text x="100" y="85" fill="#3b82f6" fontSize="9" fontWeight="bold" opacity="0.25" tracking-widest>BAY WATERWAY</text>

            {/* Green Parks */}
            <rect x="50" y="240" width="160" height="90" rx="8" fill="#064e3b" opacity="0.2" stroke="#047857" strokeWidth="1" strokeDasharray="4,2" />
            <text x="65" y="260" fill="#10b981" fontSize="9" fontWeight="bold" opacity="0.4">CENTRAL PARK</text>
            <text x="65" y="275" fill="#10b981" fontSize="8" opacity="0.3">Driver Rest Area Available</text>

            <rect x="720" y="150" width="200" height="120" rx="12" fill="#064e3b" opacity="0.15" stroke="#047857" strokeWidth="1" strokeDasharray="4,2" />
            <text x="740" y="175" fill="#10b981" fontSize="9" fontWeight="bold" opacity="0.4">EAST BAY NATURE RESERVE</text>

            {/* Simulated Buildings / Blocks */}
            <rect x="250" y="120" width="40" height="60" rx="4" fill="#1e293b" opacity="0.35" stroke="rgba(255,255,255,0.03)" />
            <rect x="360" y="120" width="80" height="60" rx="4" fill="#1e293b" opacity="0.35" stroke="rgba(255,255,255,0.03)" />
            <rect x="460" y="120" width="110" height="60" rx="4" fill="#1e293b" opacity="0.35" stroke="rgba(255,255,255,0.03)" />
            
            <rect x="250" y="220" width="40" height="160" rx="4" fill="#1e293b" opacity="0.35" stroke="rgba(255,255,255,0.03)" />
            <rect x="360" y="220" width="210" height="60" rx="4" fill="#1e293b" opacity="0.35" stroke="rgba(255,255,255,0.03)" />
            <rect x="360" y="300" width="210" height="80" rx="4" fill="#1e293b" opacity="0.35" stroke="rgba(255,255,255,0.03)" />

            {/* Simulated primary road network */}
            <path d="M 0,200 L 1200,200" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
            <path d="M 0,200 L 1200,200" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />
            <text x="20" y="194" fill="#94a3b8" fontSize="8" fontWeight="bold" opacity="0.3" tracking-widest>MAIN STREET</text>

            <path d="M 0,400 L 1200,400" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
            <path d="M 0,400 L 1200,400" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />
            <text x="20" y="394" fill="#94a3b8" fontSize="8" fontWeight="bold" opacity="0.3" tracking-widest>PARK AVENUE</text>

            <path d="M 300,0 L 300,1000" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
            <path d="M 300,0 L 300,1000" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />
            <text x="306" y="30" fill="#94a3b8" fontSize="8" fontWeight="bold" opacity="0.3" tracking-widest transform="rotate(90 306 30)">BROADWAY BLVD</text>

            <path d="M 600,0 L 600,1000" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
            <path d="M 600,0 L 600,1000" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />
            <text x="606" y="30" fill="#94a3b8" fontSize="8" fontWeight="bold" opacity="0.3" tracking-widest transform="rotate(90 606 30)">4TH AVENUE</text>
            
            {/* Active GPS delivery route visualization path (glowing) */}
            <path 
              d="M 300,200 L 600,200 L 600,400" 
              stroke="#ff6b00" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round"
              opacity="0.3"
            />
            <path 
              d="M 300,200 L 600,200 L 600,400" 
              stroke="#ff6b00" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              strokeDasharray="8,6"
              className="animate-pulse"
            />
          </svg>

          {/* User Location Driver Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-orange/20 flex items-center justify-center animate-ping absolute" />
            <div className="w-8 h-8 rounded-full bg-brand-orange border-2 border-white flex items-center justify-center shadow-lg relative transition-transform duration-300 hover:scale-110">
              <Navigation2 className="w-4 h-4 text-white rotate-45" />
            </div>
            <span className="text-[10px] bg-slate-900 border border-brand-orange/40 text-white font-extrabold px-2 py-0.5 rounded-full mt-1.5 whitespace-nowrap shadow-xl">
              Karthik (You)
            </span>
          </div>

          {/* Render simulation POIs */}
          {filteredPois.map((poi) => {
            const latDiff = poi.lat - defaultCenter.lat;
            const lngDiff = poi.lng - defaultCenter.lng;
            
            // Map offsets to viewport percentage
            const leftPct = 50 + (lngDiff * 8500); 
            const topPct = 50 - (latDiff * 8500); 

            let colorClass = "bg-white border-white text-slate-900";
            let textClass = "text-white border-white/10";
            let icon = "📍";
            
            if (poi.type === 'restroom') { 
              colorClass = "bg-blue-600 border-blue-400 text-white"; 
              textClass = "text-blue-400 border-blue-500/20 bg-blue-950/90";
              icon = "🚻";
            } else if (poi.type === 'fuel') { 
              colorClass = "bg-amber-500 border-amber-300 text-slate-950"; 
              textClass = "text-amber-400 border-amber-500/20 bg-amber-950/90";
              icon = "⛽";
            } else if (poi.type === 'parking') { 
              colorClass = "bg-brand-orange border-orange-400 text-white"; 
              textClass = "text-brand-orange border-orange-500/20 bg-orange-950/90";
              icon = "🅿️";
            } else if (poi.type === 'water') { 
              colorClass = "bg-cyan-500 border-cyan-300 text-slate-950"; 
              textClass = "text-cyan-400 border-cyan-500/20 bg-cyan-950/90";
              icon = "💧";
            }

            return (
              <button
                key={poi.id}
                onClick={() => onSelectPoi(poi)}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className={`w-8 h-8 rounded-full ${colorClass} border-2 flex items-center justify-center shadow-md cursor-pointer hover:scale-115 hover:rotate-12 transition-all`}>
                  <span className="text-sm font-semibold">{icon}</span>
                </div>
                <span className={`text-[9px] ${textClass} font-bold px-2 py-0.5 rounded-md border mt-1 whitespace-nowrap opacity-80 group-hover:opacity-100 shadow-lg transition-opacity`}>
                  {poi.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Floating Demo Badge */}
        <div className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-full text-[10px] font-bold tracking-wider uppercase animate-pulse">
          Smart Demo Map Active
        </div>

        {/* Help tooltip */}
        <div className="absolute bottom-4 left-4 right-4 md:right-auto z-30 text-[10px] text-white/70 bg-brand-dark/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 max-w-sm shadow-xl">
          {mapError ? `Map Connection Error: ${mapError}` : "Using offline vector map canvas. Add a Google Maps API Key in credentials settings to load the live map."}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative min-h-[400px]">
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};
