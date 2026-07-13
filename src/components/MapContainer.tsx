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
      <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center min-h-[400px]">
        {/* Visual Map Canvas Grid */}
        <div className="absolute inset-0 bg-slate-900/60 overflow-hidden select-none">
          <svg width="100%" height="100%" className="w-full h-full opacity-90">
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />

            {/* Simulated streets relative to center */}
            <path d="M 0,200 L 1000,200" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
            <path d="M 300,0 L 300,1000" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
            <path d="M 600,0 L 600,1000" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
            <path d="M 0,400 L 1000,400" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
            
            {/* Optimized dashed route path */}
            <path 
              d="M 300,200 L 600,200 L 600,400" 
              stroke="#ff6b00" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
              strokeDasharray="6,4"
              className="animate-pulse"
            />
          </svg>

          {/* User Location marker (centered) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center animate-ping absolute" />
            <div className="w-6 h-6 rounded-full bg-brand-orange border-2 border-white flex items-center justify-center shadow-lg relative">
              <Navigation2 className="w-3.5 h-3.5 text-white rotate-45" />
            </div>
            <span className="text-[9px] bg-slate-900/90 text-white font-bold px-1.5 py-0.5 rounded-full border border-white/10 mt-1 whitespace-nowrap shadow-md">
              Karthik (You)
            </span>
          </div>

          {/* Render simulation POIs */}
          {filteredPois.map((poi) => {
            const latDiff = poi.lat - defaultCenter.lat;
            const lngDiff = poi.lng - defaultCenter.lng;
            
            // Map offsets to viewport percentage
            const leftPct = 50 + (lngDiff * 8000); 
            const topPct = 50 - (latDiff * 8000); 

            let colorClass = "bg-white border-white";
            let textClass = "text-white";
            if (poi.type === 'restroom') { colorClass = "bg-blue-500 border-blue-200"; textClass = "text-blue-400"; }
            else if (poi.type === 'fuel') { colorClass = "bg-amber-500 border-amber-200"; textClass = "text-amber-400"; }
            else if (poi.type === 'parking') { colorClass = "bg-brand-orange border-orange-200"; textClass = "text-brand-orange"; }
            else if (poi.type === 'water') { colorClass = "bg-cyan-500 border-cyan-200"; textClass = "text-cyan-400"; }

            return (
              <button
                key={poi.id}
                onClick={() => onSelectPoi(poi)}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className={`w-4 h-4 rounded-full ${colorClass} border flex items-center justify-center shadow-md cursor-pointer hover:scale-125 transition-transform`} />
                <span className={`text-[8px] bg-slate-950/90 ${textClass} font-semibold px-1 rounded border border-white/5 mt-0.5 whitespace-nowrap opacity-75 group-hover:opacity-100 transition-opacity`}>
                  {poi.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Floating Demo Badge */}
        <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-bold tracking-wider uppercase animate-pulse">
          Demo Map Mode
        </div>

        {/* Help tooltip */}
        <div className="absolute bottom-4 left-4 z-30 text-[10px] text-white/50 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 max-w-[250px]">
          {mapError ? `Error: ${mapError}` : "Using simulated GPS map canvas. Plug in a Google Maps API Key in credentials settings to enable the live vector map."}
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
