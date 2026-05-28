import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leafletのデフォルトアイコン設定
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      // 逆ジオコーディング（座標から住所を取得）
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&accept-language=ja`)
        .then(res => res.json())
        .then(data => {
          // 市町村名と所在地のみを抽出
          let address = '';
          if (data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || '';
            const ward = addr.city_district || addr.suburb || '';
            const quarter = addr.quarter || addr.neighbourhood || '';

            // 市町村名+地区名の形式で組み立て
            address = city + ward + quarter;
          }

          // 住所が取得できなかった場合はdisplay_nameを使用
          if (!address) {
            address = data.display_name || '';
          }

          onLocationSelect(address, e.latlng);
        })
        .catch(err => {
          console.error('住所取得エラー:', err);
          onLocationSelect('', e.latlng);
        });
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function MapSelector({ onAddressSelect }) {
  const [center] = useState([35.6812, 139.7671]); // 東京の緯度経度

  const handleLocationSelect = (address, latlng) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={handleLocationSelect} />
      </MapContainer>
    </div>
  );
}
