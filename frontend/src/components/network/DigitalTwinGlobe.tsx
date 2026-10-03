import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Globe,
  AlertTriangle,
  RotateCw,
  Compass,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Maximize2
} from 'lucide-react';

export interface GlobalHub {
  id: string;
  name: string;
  type: 'Port' | 'Distribution' | 'Manufacturing' | 'Chokepoint';
  lat: number;
  lon: number;
  region: 'EMEA' | 'APAC' | 'AMER';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  otif: number;
  avgLeadTimeDays: number;
  volumeUnits: string;
  activeDisruption?: string;
  description: string;
}

const GLOBAL_HUBS: GlobalHub[] = [
  {
    id: 'hub_rotterdam',
    name: 'Rotterdam EuroHub Port',
    type: 'Port',
    lat: 51.92,
    lon: 4.48,
    region: 'EMEA',
    status: 'HEALTHY',
    otif: 95.8,
    avgLeadTimeDays: 12.4,
    volumeUnits: '24,500 TEU/wk',
    description: 'Primary continental container gateway. Intermodal barge & rail connectivity to Frankfurt.'
  },
  {
    id: 'hub_singapore',
    name: 'Singapore Maritime Hub',
    type: 'Port',
    lat: 1.35,
    lon: 103.82,
    region: 'APAC',
    status: 'WARNING',
    otif: 88.2,
    avgLeadTimeDays: 18.1,
    volumeUnits: '38,200 TEU/wk',
    activeDisruption: 'Berth waiting times elevated to 42 hrs due to container bunching.',
    description: 'Busiest transshipment nexus between East Asian manufacturers and Western routes.'
  },
  {
    id: 'hub_shenzhen',
    name: 'Shenzhen / Hsinchu Fab Hub',
    type: 'Manufacturing',
    lat: 22.54,
    lon: 114.06,
    region: 'APAC',
    status: 'HEALTHY',
    otif: 96.5,
    avgLeadTimeDays: 8.5,
    volumeUnits: '850k units/wk',
    description: 'Tier-1 semiconductor, sensor and micro-controller assembly for enterprise hardware.'
  },
  {
    id: 'hub_chicago',
    name: 'Chicago Gateway Central DC',
    type: 'Distribution',
    lat: 41.88,
    lon: -87.63,
    region: 'AMER',
    status: 'HEALTHY',
    otif: 94.1,
    avgLeadTimeDays: 6.2,
    volumeUnits: '18,400 orders/wk',
    description: 'Central Midwest distribution center feeding automotive and consumer lines.'
  },
  {
    id: 'hub_frankfurt',
    name: 'Frankfurt Air & Rail DC',
    type: 'Distribution',
    lat: 50.11,
    lon: 8.68,
    region: 'EMEA',
    status: 'HEALTHY',
    otif: 97.0,
    avgLeadTimeDays: 4.8,
    volumeUnits: '12,900 orders/wk',
    description: 'High-speed rail distribution center for Central and Eastern European fulfillment.'
  },
  {
    id: 'hub_longbeach',
    name: 'Long Beach Pacific Harbor',
    type: 'Port',
    lat: 33.77,
    lon: -118.19,
    region: 'AMER',
    status: 'HEALTHY',
    otif: 91.8,
    avgLeadTimeDays: 14.2,
    volumeUnits: '21,100 TEU/wk',
    description: 'Trans-Pacific inbound gateway for North American assembly lines.'
  },
  {
    id: 'hub_redsea',
    name: 'Bab-el-Mandeb / Red Sea Chokepoint',
    type: 'Chokepoint',
    lat: 12.58,
    lon: 43.33,
    region: 'EMEA',
    status: 'CRITICAL',
    otif: 52.4,
    avgLeadTimeDays: 31.0,
    volumeUnits: 'Rerouted 85%',
    activeDisruption: 'Severe security risk. 85% container vessels rerouting via Cape of Good Hope (+10-14 days).',
    description: 'Geopolitical corridor crisis causing widespread container transit delays and fuel surcharges.'
  }
];

const SHIPPING_LANES: Array<{ from: string; to: string; status: 'normal' | 'disrupted' | 'warning' }> = [
  { from: 'hub_shenzhen', to: 'hub_singapore', status: 'normal' },
  { from: 'hub_singapore', to: 'hub_redsea', status: 'disrupted' },
  { from: 'hub_redsea', to: 'hub_rotterdam', status: 'disrupted' },
  { from: 'hub_rotterdam', to: 'hub_frankfurt', status: 'normal' },
  { from: 'hub_shenzhen', to: 'hub_longbeach', status: 'normal' },
  { from: 'hub_longbeach', to: 'hub_chicago', status: 'normal' },
  { from: 'hub_rotterdam', to: 'hub_chicago', status: 'normal' }
];

function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function createRealisticEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Ocean Base
  ctx.fillStyle = '#060d1f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Subtle Ocean Graticule Lines
  ctx.strokeStyle = 'rgba(31, 83, 240, 0.08)';
  ctx.lineWidth = 1;
  for (let lat = 0; lat <= canvas.height; lat += canvas.height / 12) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(canvas.width, lat);
    ctx.stroke();
  }
  for (let lon = 0; lon <= canvas.width; lon += canvas.width / 24) {
    ctx.beginPath();
    ctx.moveTo(lon, 0);
    ctx.lineTo(lon, canvas.height);
    ctx.stroke();
  }

  // 3. Draw Continental Bodies & Glowing Coastlines
  ctx.fillStyle = '#111d38'; // Dark slate continental landmass
  ctx.strokeStyle = '#3873fb'; // Glowing blue coastline
  ctx.lineWidth = 2.5;

  const w = canvas.width;
  const h = canvas.height;

  const mapCoord = (lon: number, lat: number) => {
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    return { x, y };
  };

  const drawPolygon = (coords: Array<[number, number]>) => {
    if (coords.length === 0) return;
    ctx.beginPath();
    const first = mapCoord(coords[0][0], coords[0][1]);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < coords.length; i++) {
      const pt = mapCoord(coords[i][0], coords[i][1]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // North America
  drawPolygon([
    [-168, 70], [-130, 70], [-95, 75], [-60, 80], [-55, 50],
    [-75, 35], [-80, 25], [-97, 20], [-80, 8], [-90, 14],
    [-105, 20], [-120, 35], [-125, 50], [-168, 65]
  ]);

  // South America
  drawPolygon([
    [-80, 8], [-60, 10], [-35, -5], [-40, -22], [-55, -35],
    [-65, -55], [-75, -50], [-72, -35], [-80, -5], [-80, 8]
  ]);

  // Europe
  drawPolygon([
    [-10, 36], [0, 42], [5, 48], [-5, 58], [25, 71],
    [40, 68], [55, 65], [45, 45], [30, 40], [25, 35],
    [15, 38], [-5, 36]
  ]);

  // Africa
  drawPolygon([
    [-15, 30], [10, 37], [32, 31], [43, 12], [51, 10],
    [40, -10], [32, -30], [20, -35], [15, -25], [10, -5],
    [0, 5], [-17, 15], [-15, 30]
  ]);

  // Asia / Eurasia
  drawPolygon([
    [45, 45], [55, 65], [100, 75], [170, 70], [140, 50],
    [130, 40], [120, 30], [110, 20], [105, 10], [100, -5],
    [80, 15], [70, 25], [55, 25], [45, 30]
  ]);

  // India
  drawPolygon([
    [70, 25], [88, 25], [82, 10], [77, 8], [70, 22]
  ]);

  // Australia
  drawPolygon([
    [115, -22], [135, -12], [148, -18], [152, -30],
    [145, -38], [130, -32], [115, -34], [113, -24]
  ]);

  // 4. Night City Lights / Major Global Logistics Clusters
  ctx.fillStyle = '#fde047';
  const cities: Array<[number, number]> = [
    [4.48, 51.92],   // Rotterdam
    [8.68, 50.11],   // Frankfurt
    [103.82, 1.35],  // Singapore
    [114.06, 22.54], // Shenzhen
    [-87.63, 41.88], // Chicago
    [-118.19, 33.77],// Long Beach
    [0.12, 51.5],    // London
    [-74.0, 40.7],   // New York
    [139.69, 35.68], // Tokyo
    [121.47, 31.23]  // Shanghai
  ];

  cities.forEach(([lon, lat]) => {
    const pt = mapCoord(lon, lat);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

interface DigitalTwinGlobeProps {
  onSelectHub?: (hub: GlobalHub) => void;
}

export const DigitalTwinGlobe: React.FC<DigitalTwinGlobeProps> = ({ onSelectHub }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHub, setSelectedHub] = useState<GlobalHub>(GLOBAL_HUBS[6]); // default to Red Sea disruption
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [hoveredHub, setHoveredHub] = useState<GlobalHub | null>(null);

  // References for animation and interaction
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.3, y: -0.5 });
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);
  const flowParticlesRef = useRef<Array<{ mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number; speed: number }>>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera Target for smooth focus panning
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Focus on a specific hub with smooth rotation
  const focusOnHub = useCallback((hub: GlobalHub) => {
    setSelectedHub(hub);
    if (onSelectHub) onSelectHub(hub);

    // Calculate rotation angles to bring this lat/lon to front
    const phi = (hub.lat * Math.PI) / 180;
    const theta = (hub.lon * Math.PI) / 180;

    targetRotationRef.current = {
      x: phi * 0.7,
      y: -theta - Math.PI / 2
    };
  }, [onSelectHub]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 14);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x3873fb, 2.5);
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.8);
    rimLight.position.set(-15, -10, -10);
    scene.add(rimLight);

    // Master Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 5;

    // 1. Globe Base Core Sphere with Realistic Continents
    const earthTexture = createRealisticEarthTexture();
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      metalness: 0.35,
      roughness: 0.6,
      wireframe: false
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 2. Futuristic Geodesic Grid Wireframe
    const wireframeGeo = new THREE.SphereGeometry(globeRadius + 0.02, 32, 16);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x1f53f0,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeMesh);

    // 3. Glowing Atmosphere Halo
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x3873fb,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 4. Subtle Latitude / Longitude Dotted Grid Points
    const dotsCount = 1200;
    const dotPositions = new Float32Array(dotsCount * 3);
    for (let i = 0; i < dotsCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotsCount);
      const theta = Math.sqrt(dotsCount * Math.PI) * phi;
      const x = (globeRadius + 0.03) * Math.cos(theta) * Math.sin(phi);
      const y = (globeRadius + 0.03) * Math.sin(theta) * Math.sin(phi);
      const z = (globeRadius + 0.03) * Math.cos(phi);
      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;
    }
    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotsMat = new THREE.PointsMaterial({
      color: 0x475569,
      size: 0.04,
      transparent: true,
      opacity: 0.4
    });
    const dotsPoints = new THREE.Points(dotsGeo, dotsMat);
    globeGroup.add(dotsPoints);

    // 5. Place Hub Markers and Pulsing Radar Rings
    const hubObjects: THREE.Mesh[] = [];
    pulseRingsRef.current = [];

    GLOBAL_HUBS.forEach((hub) => {
      const pos = latLongToVector3(hub.lat, hub.lon, globeRadius);

      const colorHex =
        hub.status === 'CRITICAL' ? 0xef4444 : hub.status === 'WARNING' ? 0xf59e0b : 0x10b981;

      // Pin Mesh
      const pinGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.8,
        metalness: 0.2,
        roughness: 0.2
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { hub };
      globeGroup.add(pinMesh);
      hubObjects.push(pinMesh);

      // Pulse Ring (expands over time)
      const ringGeo = new THREE.RingGeometry(0.12, 0.25, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.002));
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(ringMesh);
      pulseRingsRef.current.push(ringMesh);
    });

    // 6. 3D Quadratic Bezier Transit Lanes & Pulse Flow Particles
    const flowParticles: Array<{
      mesh: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      progress: number;
      speed: number;
    }> = [];

    const hubLookup = new Map<string, GlobalHub>();
    GLOBAL_HUBS.forEach(h => hubLookup.set(h.id, h));

    SHIPPING_LANES.forEach((lane) => {
      const fromHub = hubLookup.get(lane.from);
      const toHub = hubLookup.get(lane.to);
      if (!fromHub || !toHub) return;

      const p1 = latLongToVector3(fromHub.lat, fromHub.lon, globeRadius);
      const p2 = latLongToVector3(toHub.lat, toHub.lon, globeRadius);

      // Calculate midpoint raised along surface normal
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      const elevation = globeRadius + distance * 0.32;
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcColor =
        lane.status === 'disrupted' ? 0xef4444 : lane.status === 'warning' ? 0xf59e0b : 0x3873fb;

      const curveMat = new THREE.LineBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: lane.status === 'disrupted' ? 0.85 : 0.45,
        linewidth: 2
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      globeGroup.add(arcLine);

      // Flow Energy Packet / Particle
      const particleGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: lane.status === 'disrupted' ? 0xff4d4d : 0x60a5fa
      });
      const particleMesh = new THREE.Mesh(particleGeo, particleMat);
      globeGroup.add(particleMesh);

      flowParticles.push({
        mesh: particleMesh,
        curve,
        progress: Math.random(),
        speed: lane.status === 'disrupted' ? 0.003 : 0.007
      });
    });

    flowParticlesRef.current = flowParticles;

    // Initial camera position focus on Red Sea
    const initialHub = GLOBAL_HUBS[6];
    const initialPhi = (initialHub.lat * Math.PI) / 180;
    const initialTheta = (initialHub.lon * Math.PI) / 180;
    globeGroup.rotation.x = initialPhi * 0.7;
    globeGroup.rotation.y = -initialTheta - Math.PI / 2;
    targetRotationRef.current = { x: globeGroup.rotation.x, y: globeGroup.rotation.y };

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Interaction Handlers for Orbital Rotation
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(mouseX, mouseY);

      // Raycast for hover
      if (cameraRef.current) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(hubObjects);
        if (intersects.length > 0) {
          const hovered = intersects[0].object.userData.hub as GlobalHub;
          setHoveredHub(hovered);
          container.style.cursor = 'pointer';
        } else {
          setHoveredHub(null);
          container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
        }
      }

      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;
      // Clamp vertical tilt to avoid flipping
      targetRotationRef.current.x = Math.max(-1.2, Math.min(1.2, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      if (!cameraRef.current) return;
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(mouseX, mouseY);

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(hubObjects);
      if (intersects.length > 0) {
        const clickedHub = intersects[0].object.userData.hub as GlobalHub;
        focusOnHub(clickedHub);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.01;
      cameraRef.current.position.z = Math.max(8.5, Math.min(22, cameraRef.current.position.z));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('click', handleClick);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth Lerp Rotation
      if (isAutoRotating && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.0018;
      }

      globeGroup.rotation.y += (targetRotationRef.current.y - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotationRef.current.x - globeGroup.rotation.x) * 0.08;

      // Animate Pulsing Beacon Rings
      pulseRingsRef.current.forEach((ring, idx) => {
        const cycle = (elapsedTime * 1.5 + idx * 0.3) % 1;
        const scale = 1 + cycle * 2.2;
        ring.scale.set(scale, scale, scale);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.85 * (1 - cycle));
      });

      // Animate Transit Lane Particles
      flowParticlesRef.current.forEach((item) => {
        item.progress += item.speed;
        if (item.progress > 1) item.progress = 0;
        const pos = item.curve.getPoint(item.progress);
        item.mesh.position.copy(pos);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('wheel', handleWheel);

      // Clean Three.js resources
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [focusOnHub, isAutoRotating]);

  return (
    <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Top Telemetry Header & Status Strip */}
      <div className="absolute top-0 inset-x-0 z-10 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none">
        <div className="flex items-center space-x-2.5 pointer-events-auto">
          <div className="relative flex h-3 w-3">
            <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-provenance-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-provenance-500"></span>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
              <span>3D Global Digital Twin</span>
              <span className="rounded bg-provenance-950 px-1.5 py-0.2 text-[9px] font-semibold text-provenance-300 border border-provenance-800/40">
                WEBGL 60 FPS
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive orbital view of maritime lanes, choke points & manufacturing hubs.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition ${
              isAutoRotating
                ? 'bg-provenance-600/30 border-provenance-500 text-provenance-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
            <span>{isAutoRotating ? 'Auto Orbit ON' : 'Orbit Paused'}</span>
          </button>
        </div>
      </div>

      {/* Quick Camera Navigation Hub Buttons */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">
          Pivots:
        </span>
        {GLOBAL_HUBS.map((hub) => (
          <button
            key={hub.id}
            onClick={() => focusOnHub(hub)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
              selectedHub.id === hub.id
                ? 'bg-provenance-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {hub.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Floating HUD: Selected Hub Telemetry Card */}
      <div className="absolute bottom-4 right-4 z-10 max-w-sm w-full bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">{selectedHub.name}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedHub.lat.toFixed(2)}°N, {selectedHub.lon.toFixed(2)}°E • {selectedHub.region}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
              selectedHub.status === 'CRITICAL'
                ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                : selectedHub.status === 'WARNING'
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
            }`}
          >
            {selectedHub.status}
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">{selectedHub.description}</p>

        {selectedHub.activeDisruption && (
          <div className="flex items-start space-x-2 rounded-lg bg-red-950/60 p-2.5 border border-red-800/80 text-[11px] text-red-200">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span>{selectedHub.activeDisruption}</span>
          </div>
        )}

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">OTIF Rate</span>
            <span
              className={`text-xs font-bold ${
                selectedHub.otif >= 90 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {selectedHub.otif}%
            </span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Avg Lead Time</span>
            <span className="text-xs font-bold text-white">{selectedHub.avgLeadTimeDays}d</span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Volume / Wk</span>
            <span className="text-xs font-bold text-slate-200 truncate block">
              {selectedHub.volumeUnits}
            </span>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[520px] cursor-grab active:cursor-grabbing"
        style={{ minHeight: '520px' }}
      />

      {/* Instruction Tip */}
      <div className="absolute top-16 left-4 z-10 pointer-events-none hidden md:block">
        <span className="text-[10px] text-slate-500 bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
          💡 Drag to rotate • Scroll to zoom • Click node to inspect
        </span>
      </div>
    </div>
  );
};
