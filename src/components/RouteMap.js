import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const senderIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const deliveryIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Auto-fit map bounds
function FitMapToRoute({ positions }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      if (positions.length === 2) {
        map.invalidateSize();
        map.fitBounds(positions, { padding: [50, 50] });
        console.log('Map fitted to:', positions);
      }
    }, 300);
  }, [positions, map]);

  return null;
}

export default function RouteMap({ senderAddress, deliveryAddress, onClose }) {
  const [positions, setPositions] = useState([]);
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoords = async (location) => {
    console.log('Fetching coordinates for:', location);
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: location,
          format: 'json',
          limit: 1,
        },
      });

      if (res.data.length > 0) {
        const lat = parseFloat(res.data[0].lat);
        const lon = parseFloat(res.data[0].lon);
        console.log('Coordinates for', location, '=>', [lat, lon]);
        return [lat, lon];
      } else {
        console.warn('No coordinates found for:', location);
        return null;
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      const from = await fetchCoords(senderAddress);
      const to = await fetchCoords(deliveryAddress);

      if (from && to) {
        setPositions([from, to]);

        try {
          const res = await axios.post(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            {
              coordinates: [[from[1], from[0]], [to[1], to[0]]],
            },
            {
              headers: {
                Authorization: '5b3ce3597851110001cf62482f02ab4e6b784a12a9e5d1ac9ae00cc2',
                'Content-Type': 'application/json',
              },
            }
          );

          const coords = res.data.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
          console.log('Route coordinates:', coords);
          setRoute(coords);
        } catch (err) {
          console.error('Error fetching route from OpenRouteService:', err);
          setRoute([]);
        }
      }
      setLoading(false);
    };

    fetchRoute();
  }, [senderAddress, deliveryAddress]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl shadow-xl w-[90%] max-w-4xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            <FiMapPin className="text-blue-400" /> Route from Sender's Address to Delivery Address
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-white">Loading map...</div>
        ) : positions.length === 2 ? (
          <MapContainer
            center={positions[0]}
            zoom={6}
            scrollWheelZoom={false}
            style={{ height: '500px', width: '100%' }}
            className="z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <FitMapToRoute positions={positions} />

            <Marker position={positions[0]} icon={senderIcon}>
              <Popup>Sender</Popup>
            </Marker>
            <Marker position={positions[1]} icon={deliveryIcon}>
              <Popup>Delivery</Popup>
            </Marker>

            {route.length > 0 && (
              <Polyline
                positions={route}
                pathOptions={{
                  color: 'blue',
                  weight: 20,
                  opacity: 0.9,
                  dashArray: '8',
                }}
              />
            )}
          </MapContainer>
        ) : (
          <div className="p-6 text-red-400 text-center">
            Could not resolve one or both addresses.
          </div>
        )}
      </div>
    </div>
  );
}
