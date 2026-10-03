import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
// @ts-ignore
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Compass,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Zap,
  Globe2,
  Box,
  Eye
} from 'lucide-react';
import { TiltCard } from '../common/TiltCard.js';

// Setup MapLibre web worker for Vite
if (typeof window !== 'undefined') {
  try {
    setWorkerUrl(workerUrl);
  } catch (e) {
    console.warn('MapLibre workerUrl initialization fallback', e);
  }
}

export interface RealWorldLocation {
  id: string;
  name: string;
  code: string;
  type: 'Sea Port' | 'Inland Rail Hub' | 'Air Cargo DC' | 'Fab Plant' | 'Maritime Chokepoint';
  lat: number;
  lng: number;
  country: string;
  city: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  otif: number;
  avgLeadTime: string;
  safetyStock: string;
  throughput: string;
  description: string;
  realAddress: string;
}

const REAL_WORLD_FACILITIES: RealWorldLocation[] = [
  {
    id: 'rotterdam',
    name: 'Port of Rotterdam (Maasvlakte)',
    code: 'NLRTM',
    type: 'Sea Port',
    lat: 51.956,
    lng: 4.053,
    country: 'Netherlands',
    city: 'Rotterdam',
    status: 'HEALTHY',
    otif: 95.8,
    avgLeadTime: '12.4 Days',
    safetyStock: '38 Days',
    throughput: '14.5M TEU / year',
    realAddress: 'Europaweg 902, 3199 LC Maasvlakte Rotterdam',
    description: 'Largest deep-water seaport in Europe. Automated barge, rail and feeder connectivity into the Rhine-Ruhr industrial basin.'
  },
  {
    id: 'singapore',
    name: 'PSA Singapore (Pasir Panjang Terminal)',
    code: 'SGSIN',
    type: 'Sea Port',
    lat: 1.272,
    lng: 103.784,
    country: 'Singapore',
    city: 'Singapore',
    status: 'WARNING',
    otif: 88.2,
    avgLeadTime: '18.1 Days',
    safetyStock: '11 Days (Below 15d SLA)',
    throughput: '38.8M TEU / year',
    realAddress: '7B Keppel Rd, PSA Building, Singapore 089055',
    description: 'Primary Southeast Asian mega-transshipment hub. Experiencing yard congestion with 42-hour average vessel dwell time.'
  },
  {
    id: 'shenzhen',
    name: 'Foxconn Longhua Science & Tech Park',
    code: 'CNSZX-LH',
    type: 'Fab Plant',
    lat: 22.658,
    lng: 114.038,
    country: 'China',
    city: 'Shenzhen',
    status: 'HEALTHY',
    otif: 96.5,
    avgLeadTime: '8.5 Days',
    safetyStock: '24 Days',
    throughput: '850k units / week',
    realAddress: 'No. 2 Donghuan 2nd Rd, Longhua, Shenzhen, Guangdong',
    description: 'Tier-1 precision electronics, FPGA and sensor fabrication campus.'
  },
  {
    id: 'chicago',
    name: 'CenterPoint Intermodal (BNSF Logistics Park)',
    code: 'USCHI-JOL',
    type: 'Inland Rail Hub',
    lat: 41.455,
    lng: -88.162,
    country: 'United States',
    city: 'Joliet / Chicago, IL',
    status: 'HEALTHY',
    otif: 94.1,
    avgLeadTime: '6.2 Days',
    safetyStock: '42 Days',
    throughput: '3.5M intermodal lifts / yr',
    realAddress: '26664 SW Frontage Rd, Channahon, IL 60410',
    description: 'Premier inland container hub in North America connecting Pacific rail routes to Midwestern and Eastern factories.'
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt Airport CargoCity South',
    code: 'DEFRA-CC',
    type: 'Air Cargo DC',
    lat: 50.033,
    lng: 8.567,
    country: 'Germany',
    city: 'Frankfurt am Main',
    status: 'HEALTHY',
    otif: 97.0,
    avgLeadTime: '4.8 Days',
    safetyStock: '32 Days',
    throughput: '2.1M metric tons / yr',
    realAddress: 'Gebäude 537, CargoCity Süd, 60549 Frankfurt am Main',
    description: 'Premier air-freight logistics center in Central Europe handling high-value components and expedited aerospace spares.'
  },
  {
    id: 'longbeach',
    name: 'Port of Long Beach (Pier 400)',
    code: 'USLGB',
    type: 'Sea Port',
    lat: 33.742,
    lng: -118.256,
    country: 'United States',
    city: 'Long Beach, CA',
    status: 'HEALTHY',
    otif: 91.8,
    avgLeadTime: '14.2 Days',
    safetyStock: '30 Days',
    throughput: '9.1M TEU / year',
    realAddress: '415 Harbor Plaza, Long Beach, CA 90802',
    description: 'Trans-Pacific inbound gateway for North American assembly lines.'
  },
  {
    id: 'redsea',
    name: 'Bab-el-Mandeb Strait / Southern Red Sea',
    code: 'BEM-SUEZ',
    type: 'Maritime Chokepoint',
    lat: 12.583,
    lng: 43.333,
    country: 'International Waters',
    city: 'Mandeb Strait',
    status: 'CRITICAL',
    otif: 52.4,
    avgLeadTime: '31.0 Days (+12d Cape Reroute)',
    safetyStock: 'Deficit Risk',
    throughput: 'Rerouting 85% via Cape of Good Hope',
    realAddress: 'International Maritime Corridor, Red Sea / Gulf of Aden',
    description: 'Active geopolitical security disruption. Bulk of Asia-Europe container fleets diverting around Africa with heavy transit and bunker surcharges.'
  }
];

const MAP_STYLES = [
  { id: 'liberty', label: 'OpenFreeMap Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { id: 'positron', label: 'OpenFreeMap Positron (Dark)', url: 'https://tiles.openfreemap.org/styles/positron' },
  { id: 'bright', label: 'OpenFreeMap Bright', url: 'https://tiles.openfreemap.org/styles/bright' }
];

export const RealWorldMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const [activeStyle, setActiveStyle] = useState('https://tiles.openfreemap.org/styles/liberty');
  const [selectedFacility, setSelectedFacility] = useState<RealWorldLocation>(REAL_WORLD_FACILITIES[0]);
  const [is3DMode, setIs3DMode] = useState(true);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: activeStyle,
      center: [30.0, 32.0],
      zoom: 2.8,
      pitch: is3DMode ? 42 : 0,
      bearing: -10
    });

    mapRef.current = map;

    // Navigation Controls
    map.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right');

    const setupShippingRoutes = () => {
      if (!map || map.getSource('shipping-routes')) return;

      map.addSource('shipping-routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            // Asia to Red Sea to Europe (Disrupted Corridor)
            {
              type: 'Feature',
              properties: { status: 'disrupted', name: 'Asia - Europe (Red Sea)' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [114.038, 22.658], // Shenzhen
                  [103.784, 1.272],  // Singapore
                  [80.0, 6.0],       // Indian Ocean
                  [43.333, 12.583],  // Bab-el-Mandeb
                  [32.5, 29.9],      // Suez Canal
                  [18.0, 35.0],      // Mediterranean
                  [4.053, 51.956]    // Rotterdam
                ]
              }
            },
            // Trans-Pacific Route
            {
              type: 'Feature',
              properties: { status: 'normal', name: 'Trans-Pacific Lane' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [114.038, 22.658],  // Shenzhen
                  [135.0, 30.0],
                  [-160.0, 35.0],
                  [-118.256, 33.742]  // Long Beach
                ]
              }
            },
            // US Inland Rail Spine
            {
              type: 'Feature',
              properties: { status: 'normal', name: 'US Inland Rail' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-118.256, 33.742], // Long Beach
                  [-100.0, 38.0],
                  [-88.162, 41.455]   // Chicago
                ]
              }
            },
            // Europe Rail Feeder
            {
              type: 'Feature',
              properties: { status: 'normal', name: 'Rhine-Ruhr Rail Feeder' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [4.053, 51.956],   // Rotterdam
                  [8.567, 50.033]    // Frankfurt
                ]
              }
            }
          ]
        }
      });

      map.addLayer({
        id: 'shipping-routes-disrupted',
        type: 'line',
        source: 'shipping-routes',
        filter: ['==', 'status', 'disrupted'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ef4444',
          'line-width': 3.5,
          'line-dasharray': [3, 2]
        }
      });

      map.addLayer({
        id: 'shipping-routes-normal',
        type: 'line',
        source: 'shipping-routes',
        filter: ['==', 'status', 'normal'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 2.5,
          'line-opacity': 0.75
        }
      });
    };

    map.on('load', setupShippingRoutes);
    map.on('styledata', setupShippingRoutes);

    // Add Custom 3D Marker Elements
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    REAL_WORLD_FACILITIES.forEach((fac) => {
      const el = document.createElement('div');
      el.className = 'custom-maplibre-marker cursor-pointer group';

      const isCritical = fac.status === 'CRITICAL';
      const isWarning = fac.status === 'WARNING';
      const colorBg = isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

      el.innerHTML = `
        <div class="relative flex items-center justify-center p-1">
          ${isCritical ? '<span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-75"></span>' : ''}
          <div class="h-4 w-4 rounded-full ${colorBg} border-2 border-white shadow-xl flex items-center justify-center transform transition-transform group-hover:scale-125">
            <div class="h-1.5 w-1.5 rounded-full bg-slate-900"></div>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedFacility(fac);
        map.flyTo({
          center: [fac.lng, fac.lat],
          zoom: 7.5,
          pitch: is3DMode ? 55 : 0,
          bearing: -15,
          duration: 1800
        });
      });

      const marker = new Marker({ element: el })
        .setLngLat([fac.lng, fac.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Style Switching
  const handleStyleChange = (styleUrl: string) => {
    setActiveStyle(styleUrl);
    if (mapRef.current) {
      mapRef.current.setStyle(styleUrl);
    }
  };

  // Toggle 3D Camera Tilt
  const toggle3D = () => {
    const next3D = !is3DMode;
    setIs3DMode(next3D);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: next3D ? 48 : 0,
        duration: 800
      });
    }
  };

  const flyToFacility = (fac: RealWorldLocation) => {
    setSelectedFacility(fac);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [fac.lng, fac.lat],
        zoom: 7.5,
        pitch: is3DMode ? 55 : 0,
        bearing: -15,
        duration: 1800
      });
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Map Header Toolbar with OpenFreeMap Badge */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 shadow-lg pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-provenance-600/20 text-provenance-400 border border-provenance-500/30">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide flex items-center space-x-2">
              <span>Real-World OpenFreeMap (Liberty Vector Tiles)</span>
              <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400 border border-emerald-800/40">
                MAPLIBRE GL 60 FPS
              </span>
            </h4>
            <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">
              Vector tile service powered by openfreemap.org with 3D terrain pitch
            </span>
          </div>
        </div>

        {/* Style Switches & 3D Tilt Toggle */}
        <div className="flex items-center space-x-2">
          {/* Style Selector */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
            {MAP_STYLES.map((st) => (
              <button
                key={st.id}
                onClick={() => handleStyleChange(st.url)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  activeStyle === st.url
                    ? 'bg-provenance-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* 3D Perspective Toggle Button */}
          <button
            onClick={toggle3D}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
              is3DMode
                ? 'bg-provenance-600/30 border-provenance-500 text-provenance-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span>{is3DMode ? '3D Tilt ON' : '2D Flat'}</span>
          </button>
        </div>
      </div>

      {/* MapLibre Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[540px] z-0"
        style={{ minHeight: '540px', background: '#0b0f19' }}
      />

      {/* Selected Facility HUD Card on Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 max-w-sm w-full bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl space-y-3 pointer-events-auto">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white tracking-wide">{selectedFacility.name}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              UN/LOCODE: <strong className="text-provenance-400">{selectedFacility.code}</strong> • {selectedFacility.city}, {selectedFacility.country}
            </span>
          </div>

          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
              selectedFacility.status === 'CRITICAL'
                ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                : selectedFacility.status === 'WARNING'
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
            }`}
          >
            {selectedFacility.status}
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">{selectedFacility.description}</p>

        {/* Real Address Card */}
        <div className="rounded-lg bg-slate-950/80 p-2 border border-slate-800 text-[10px] text-slate-400 font-mono flex items-start space-x-1.5">
          <MapPin className="h-3.5 w-3.5 text-provenance-400 shrink-0 mt-0.5" />
          <span className="truncate">{selectedFacility.realAddress}</span>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center text-xs">
          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block font-semibold">OTIF Adherence</span>
            <span
              className={`font-bold text-xs ${
                selectedFacility.otif >= 90 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {selectedFacility.otif}%
            </span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block font-semibold">Lead Time</span>
            <span className="font-bold text-xs text-white">{selectedFacility.avgLeadTime}</span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block font-semibold">Safety Stock</span>
            <span
              className={`font-bold text-xs truncate block ${
                selectedFacility.status === 'WARNING' ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {selectedFacility.safetyStock}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Facility Pivot Pills on Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex flex-col space-y-1.5 pointer-events-auto">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 self-end">
          Direct Facility Pivots:
        </span>
        <div className="flex flex-wrap justify-end gap-1 max-w-xs">
          {REAL_WORLD_FACILITIES.map((fac) => (
            <button
              key={fac.id}
              onClick={() => flyToFacility(fac)}
              className={`rounded-lg px-2 py-1 text-[10px] font-medium transition ${
                selectedFacility.id === fac.id
                  ? 'bg-provenance-600 text-white shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {fac.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
