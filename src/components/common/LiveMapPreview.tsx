import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GpsTrackingStatus } from '../../hooks/useLiveTracking';

export interface LiveMapPreviewProps {
  origin?: string;
  destination?: string;
  driverLat?: number | null;
  driverLng?: number | null;
  originLat?: number | null;
  originLng?: number | null;
  destLat?: number | null;
  destLng?: number | null;
  progressPercent?: number;
  speedKmh?: number | null;
  accuracy?: number | null;
  lastUpdated?: string | null;
  currentLocationDesc?: string;
  isOptimizedRoute?: boolean;
  gpsStatus?: GpsTrackingStatus;
  distanceRemainingKm?: number | null;
  heightClass?: string;
}

export const LiveMapPreview: React.FC<LiveMapPreviewProps> = ({
  origin = 'Mysore Farm, Gate 2',
  destination = 'KR Market Warehouse 4B, Bangalore',
  driverLat,
  driverLng,
  originLat = 12.2958,
  originLng = 76.6394,
  destLat = 12.9654,
  destLng = 77.5786,
  progressPercent,
  speedKmh,
  accuracy,
  lastUpdated,
  currentLocationDesc,
  isOptimizedRoute = true,
  gpsStatus = 'LIVE',
  distanceRemainingKm,
  heightClass = 'h-[260px] sm:h-[300px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Fallback driver coordinates if GPS hasn't connected yet (default midpoint on Mysore-Bangalore corridor)
  const effectiveDriverLat = driverLat ?? 12.5218;
  const effectiveDriverLng = driverLng ?? 76.8951;
  const isRealGpsActive = driverLat !== null && driverLat !== undefined && driverLng !== null && driverLng !== undefined;

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [effectiveDriverLat, effectiveDriverLng],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      // Standard OpenStreetMap TileLayer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Add custom small zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Update Markers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Driver Marker Icon (🚚 in green circular badge with pulse ring)
    const driverIconHtml = `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        ${
          gpsStatus === 'LIVE'
            ? `<div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(15, 82, 56, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: #0f5238; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 2.5px solid #ffffff; font-size: 15px;">
          🚚
        </div>
      </div>
    `;

    const driverIcon = L.divIcon({
      html: driverIconHtml,
      className: 'custom-driver-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -19]
    });

    // Origin Marker Icon (🌾 Farm)
    const originIconHtml = `
      <div style="width: 26px; height: 26px; border-radius: 9999px; background-color: #7d562d; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.25); border: 2px solid #ffffff; font-size: 13px;">
        🌾
      </div>
    `;
    const originIcon = L.divIcon({
      html: originIconHtml,
      className: 'custom-origin-icon',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    });

    // Destination Marker Icon (🏢 Warehouse)
    const destIconHtml = `
      <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #0d5237; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.25); border: 2px solid #ffffff; font-size: 14px;">
        🏢
      </div>
    `;
    const destIcon = L.divIcon({
      html: destIconHtml,
      className: 'custom-dest-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });

    // 1. Origin Marker
    if (originLat && originLng) {
      if (originMarkerRef.current) {
        originMarkerRef.current.setLatLng([originLat, originLng]);
      } else {
        originMarkerRef.current = L.marker([originLat, originLng], { icon: originIcon })
          .bindPopup(`<b>Origin Farm</b><br/>${origin}`)
          .addTo(map);
      }
    }

    // 2. Destination Marker
    if (destLat && destLng) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destLat, destLng]);
      } else {
        destMarkerRef.current = L.marker([destLat, destLng], { icon: destIcon })
          .bindPopup(`<b>Destination Warehouse</b><br/>${destination}`)
          .addTo(map);
      }
    }

    // 3. Driver Marker
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([effectiveDriverLat, effectiveDriverLng]);
      driverMarkerRef.current.setIcon(driverIcon);
    } else {
      driverMarkerRef.current = L.marker([effectiveDriverLat, effectiveDriverLng], { icon: driverIcon })
        .bindPopup(
          `<b>Transporter Live GPS</b><br/>Status: ${gpsStatus}<br/>${
            speedKmh !== null && speedKmh !== undefined ? `Speed: ${speedKmh} km/h` : 'Speed unavailable'
          }`
        )
        .addTo(map);
    }

    // 4. Polyline Route
    const routePoints: [number, number][] = [];
    if (originLat && originLng) routePoints.push([originLat, originLng]);
    routePoints.push([effectiveDriverLat, effectiveDriverLng]);
    if (destLat && destLng) routePoints.push([destLat, destLng]);

    if (routePoints.length >= 2) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(routePoints);
      } else {
        polylineRef.current = L.polyline(routePoints, {
          color: '#0f5238',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 8',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
      }
    }

    // Auto-fit bounds when real coordinates exist
    if (isRealGpsActive && originLat && destLat) {
      const bounds = L.latLngBounds([
        [originLat, originLng ?? 0],
        [effectiveDriverLat, effectiveDriverLng],
        [destLat, destLng ?? 0]
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.panTo([effectiveDriverLat, effectiveDriverLng]);
    }
  }, [effectiveDriverLat, effectiveDriverLng, originLat, originLng, destLat, destLng, gpsStatus, speedKmh, origin, destination, isRealGpsActive]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([effectiveDriverLat, effectiveDriverLng], 14, { animate: true });
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-card border border-outline-variant/30 bg-[#e8ede9]`}>
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Speed & Telemetry Status Pill */}
      <div className="absolute top-3 left-3 z-10 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-outline-variant/30 flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            gpsStatus === 'LIVE'
              ? 'bg-primary animate-pulse'
              : gpsStatus === 'CONNECTING' || gpsStatus === 'WAITING_GPS'
              ? 'bg-secondary animate-bounce'
              : 'bg-outline'
          }`}
        />
        <span className="text-label-sm font-semibold text-primary">
          {speedKmh !== null && speedKmh !== undefined ? `${speedKmh} km/h` : 'Speed unavailable'}
        </span>
        <span className="text-[11px] text-on-surface-variant font-medium">
          {gpsStatus === 'LIVE'
            ? '• GPS Active'
            : gpsStatus === 'CONNECTING'
            ? '• Connecting...'
            : gpsStatus === 'WAITING_GPS'
            ? '• Waiting GPS'
            : gpsStatus === 'PERMISSION_DENIED'
            ? '• Location Blocked'
            : '• Offline'}
        </span>
      </div>

      {/* Top Right: AI Optimal Path & Recenter Trigger */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {isOptimizedRoute && (
          <div className="bg-primary text-on-primary px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-md">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            AI Optimal Path
          </div>
        )}
        <button
          type="button"
          onClick={handleRecenter}
          className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-md border border-outline-variant/30 hover:bg-surface-container transition-colors"
          title="Center on Driver"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
        </button>
      </div>

      {/* Bottom Location & Telemetry Overlay Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-surface-container-lowest/95 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-outline-variant/30 flex items-center justify-between text-on-surface">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0">near_me</span>
          <div className="flex flex-col min-w-0">
            <span className="text-label-sm font-medium truncate">
              {currentLocationDesc ||
                (isRealGpsActive
                  ? `Lat: ${driverLat?.toFixed(4)}, Lng: ${driverLng?.toFixed(4)}`
                  : 'Acquiring driver GPS satellite lock...')}
            </span>
            {lastUpdated && (
              <span className="text-[10px] text-on-surface-variant">Last updated: {lastUpdated}</span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0 ml-2">
          {distanceRemainingKm !== null && distanceRemainingKm !== undefined ? (
            <span className="text-[12px] font-bold text-primary block">~{distanceRemainingKm} km remaining</span>
          ) : progressPercent !== undefined ? (
            <span className="text-[12px] font-bold text-primary block">{progressPercent}% Completed</span>
          ) : null}
          {accuracy !== null && accuracy !== undefined && (
            <span className="text-[10px] text-on-surface-variant block">±{accuracy}m accuracy</span>
          )}
        </div>
      </div>
    </div>
  );
};
