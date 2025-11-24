import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Property {
  id: string;
  title: string;
  price_usd?: number;
  price_text: string;
  location: string;
  category: string;
  images?: string[];
}

interface PropertyMapProps {
  properties: Property[];
}

// Costa Rica provinces with approximate center coordinates
const PROVINCE_COORDS: Record<string, [number, number]> = {
  'San José': [9.9281, -84.0907],
  'Alajuela': [10.0162, -84.2119],
  'Cartago': [9.8626, -83.9196],
  'Heredia': [9.9989, -84.1175],
  'Guanacaste': [10.6315, -85.4436],
  'Puntarenas': [9.9667, -84.8333],
  'Limón': [10.0, -83.0333],
  'Pura Vida': [9.7489, -83.7534], // Central CR fallback
};

// Function to get approximate coordinates based on location text
const getApproximateCoordinates = (location: string): [number, number] | null => {
  if (!location) return null;
  
  const locationLower = location.toLowerCase();
  
  // Check for known provinces
  for (const [province, coords] of Object.entries(PROVINCE_COORDS)) {
    if (locationLower.includes(province.toLowerCase())) {
      // Add small random offset (±0.1 degrees) to avoid exact location
      const lat = coords[0] + (Math.random() - 0.5) * 0.2;
      const lng = coords[1] + (Math.random() - 0.5) * 0.2;
      return [lat, lng];
    }
  }
  
  // Check for major cities/towns
  const cityCoords: Record<string, [number, number]> = {
    'tamarindo': [10.3, -85.8],
    'jaco': [9.6, -84.6],
    'jacó': [9.6, -84.6],
    'uvita': [9.15, -83.7],
    'dominical': [9.25, -83.85],
    'nosara': [9.98, -85.65],
    'samara': [10.3, -85.5],
    'flamingo': [10.43, -85.78],
    'playas del coco': [10.55, -85.7],
    'coco': [10.55, -85.7],
    'escazu': [9.92, -84.14],
    'escazú': [9.92, -84.14],
    'santa ana': [9.93, -84.18],
    'manuel antonio': [9.39, -84.15],
  };
  
  for (const [city, coords] of Object.entries(cityCoords)) {
    if (locationLower.includes(city)) {
      const lat = coords[0] + (Math.random() - 0.5) * 0.1;
      const lng = coords[1] + (Math.random() - 0.5) * 0.1;
      return [lat, lng];
    }
  }
  
  // Default to center of Costa Rica with random offset
  const lat = 9.7489 + (Math.random() - 0.5) * 1.0;
  const lng = -83.7534 + (Math.random() - 0.5) * 1.0;
  return [lat, lng];
};

const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  // Generate map markers with approximate coordinates
  const markers = useMemo(() => {
    return properties
      .map(property => {
        const coords = getApproximateCoordinates(property.location);
        if (!coords) return null;
        
        return {
          id: property.id,
          position: coords,
          title: property.title,
          price: property.price_usd,
          location: property.location,
          category: property.category,
        };
      })
      .filter((marker): marker is NonNullable<typeof marker> => marker !== null);
  }, [properties]);

  // Center of Costa Rica
  const center: [number, number] = [9.7489, -83.7534];

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {marker.title.length > 60 ? marker.title.substring(0, 60) + '...' : marker.title}
                </h3>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                  ${marker.price ? marker.price.toLocaleString() : 'Price on request'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  📍 {marker.location.split(',')[0]}
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '12px' }}>
                  ℹ️ Approximate location for privacy
                </div>
                <Link
                  to={`/property/${marker.id}`}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
