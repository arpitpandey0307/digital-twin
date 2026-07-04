import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { getMapWards, getMapInfrastructure } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LAYERS = [
  { id: 'wards', label: '📍 Wards', active: true },
  { id: 'hospitals', label: '🏥 Hospitals', active: true },
  { id: 'shelters', label: '🏠 Shelters', active: true },
  { id: 'pumps', label: '💧 Pump Stations', active: true },
  { id: 'flood', label: '🌊 Flood Risk', active: true },
];

const infraIcon = (type) => {
  const icons = { hospital: '🏥', school: '🏫', shelter: '🏠', pump_station: '💧', fire_station: '🚒', drainage: '🔧', police_station: '👮' };
  return L.divIcon({
    html: `<div style="font-size:20px;text-align:center">${icons[type] || '📌'}</div>`,
    className: '', iconSize: [30, 30], iconAnchor: [15, 15],
  });
};

export default function MapPage() {
  const [layers, setLayers] = useState(LAYERS);
  const [wards, setWards] = useState([]);
  const [infra, setInfra] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [w, i] = await Promise.all([getMapWards(), getMapInfrastructure()]);
        setWards(w.data);
        setInfra(i.data?.features?.map(f => ({ ...f.properties, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] })) || []);
      } catch {
        setWards([
          { name: 'Ward 1 - Colaba', center_lat: 18.9067, center_lng: 72.8147, population: 85000, drainage_capacity: 65 },
          { name: 'Ward 4 - Kurla', center_lat: 19.0726, center_lng: 72.8845, population: 180000, drainage_capacity: 45 },
          { name: 'Ward 5 - Andheri', center_lat: 19.1136, center_lng: 72.8697, population: 220000, drainage_capacity: 50 },
          { name: 'Ward 9 - Bandra', center_lat: 19.0596, center_lng: 72.8295, population: 130000, drainage_capacity: 55 },
          { name: 'Ward 12 - Kandivali', center_lat: 19.2047, center_lng: 72.8525, population: 185000, drainage_capacity: 38 },
        ]);
        setInfra([
          { name: 'KEM Hospital', type: 'hospital', lat: 18.9942, lng: 72.8411, capacity: 1800, status: 'operational' },
          { name: 'Shelter A', type: 'shelter', lat: 18.9167, lng: 72.8203, capacity: 500, status: 'operational' },
          { name: 'Pump Station Alpha', type: 'pump_station', lat: 19.018, lng: 72.848, capacity: 5000, status: 'operational' },
        ]);
      }
    };
    fetchData();
  }, []);

  const toggleLayer = (id) => {
    setLayers(layers.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  const isActive = (id) => layers.find(l => l.id === id)?.active;

  return (
    <>
      <TopBar title="City Map" />
      <div className="page-content" style={{ padding: 0, height: 'calc(100vh - var(--topbar-height))' }}>
        <div style={{ position: 'relative', height: '100%' }}>
          {/* Layer Controls */}
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 1000,
            background: 'var(--surface-card)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md)', minWidth: 180,
          }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Map Layers</h4>
            {layers.map(l => (
              <label key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={l.active} onChange={() => toggleLayer(l.id)} />
                {l.label}
              </label>
            ))}
          </div>

          <MapContainer center={[19.076, 72.877]} zoom={11} style={{ height: '100%', width: '100%', background: '#0a0a1a' }}
            zoomControl={true}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CartoDB'
            />

            {/* Ward markers */}
            {isActive('wards') && wards.map((w, i) => (
              <Circle key={i} center={[w.center_lat, w.center_lng]} radius={1500}
                pathOptions={{ color: w.drainage_capacity < 50 ? '#ef4444' : '#22c55e', fillOpacity: 0.15, weight: 1 }}>
                <Popup>
                  <div style={{ color: '#333', fontSize: '0.85rem' }}>
                    <strong>{w.name}</strong><br />
                    Population: {w.population?.toLocaleString()}<br />
                    Drainage: {w.drainage_capacity}%
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Flood risk zones */}
            {isActive('flood') && wards.filter(w => w.drainage_capacity < 50).map((w, i) => (
              <Circle key={`flood-${i}`} center={[w.center_lat, w.center_lng]} radius={2000}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1, dashArray: '5,5' }}>
              </Circle>
            ))}

            {/* Infrastructure markers */}
            {infra.filter(item => {
              if (item.type === 'hospital' && !isActive('hospitals')) return false;
              if (item.type === 'shelter' && !isActive('shelters')) return false;
              if (item.type === 'pump_station' && !isActive('pumps')) return false;
              return true;
            }).map((item, i) => (
              <Marker key={i} position={[item.lat, item.lng]} icon={infraIcon(item.type)}>
                <Popup>
                  <div style={{ color: '#333', fontSize: '0.85rem' }}>
                    <strong>{item.name}</strong><br />
                    Type: {item.type}<br />
                    Capacity: {item.capacity}<br />
                    Status: {item.status}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  );
}
