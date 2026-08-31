import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TransporterLocationRecord,
  pushDriverLocation,
  fetchOrderLocation,
  subscribeToOrderLocation,
  calculateDistanceKm
} from '../services/liveTrackingService';
import { useApp } from '../context/AppContext';

export type GpsTrackingStatus =
  | 'CONNECTING'
  | 'LIVE'
  | 'WAITING_GPS'
  | 'PERMISSION_DENIED'
  | 'UNAVAILABLE'
  | 'OFFLINE'
  | 'COMPLETED';

interface UseLiveTrackingProps {
  orderId: string;
  isDriver?: boolean;
  destinationCoords?: { lat: number; lng: number };
  originCoords?: { lat: number; lng: number };
}

export function useLiveTracking({
  orderId,
  isDriver = false,
  destinationCoords,
  originCoords
}: UseLiveTrackingProps) {
  const { supabaseUser, transporterProfile, activeOrder } = useApp();

  const [location, setLocation] = useState<TransporterLocationRecord | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsTrackingStatus>('CONNECTING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState<number | null>(null);
  const [isWatching, setIsWatching] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);
  const lastPushTimestampRef = useRef<number>(0);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Calculate distance remaining whenever location or destination changes
  useEffect(() => {
    if (location?.latitude && location?.longitude && destinationCoords?.lat && destinationCoords?.lng) {
      const dist = calculateDistanceKm(
        location.latitude,
        location.longitude,
        destinationCoords.lat,
        destinationCoords.lng
      );
      setDistanceRemainingKm(dist);
    } else {
      setDistanceRemainingKm(null);
    }
  }, [location?.latitude, location?.longitude, destinationCoords?.lat, destinationCoords?.lng]);

  // ==========================================
  // DRIVER MODE: Real Device GPS Tracking
  // ==========================================
  const startDriverTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('UNAVAILABLE');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('CONNECTING');
    setErrorMessage(null);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const onPositionSuccess = async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed, heading } = pos.coords;

      // Speed conversion: m/s to km/h (if available)
      let speedKmh: number | null = null;
      if (speed !== null && !isNaN(speed) && speed >= 0) {
        speedKmh = Math.round(speed * 3.6);
      } else if (lastCoordsRef.current && lastPushTimestampRef.current > 0) {
        const timeDiffSec = (Date.now() - lastPushTimestampRef.current) / 1000;
        if (timeDiffSec >= 2 && timeDiffSec <= 60) {
          const distKm = calculateDistanceKm(
            lastCoordsRef.current.lat,
            lastCoordsRef.current.lng,
            latitude,
            longitude
          );
          const calcSpeed = Math.round((distKm / (timeDiffSec / 3600)));
          if (calcSpeed >= 0 && calcSpeed <= 140) {
            speedKmh = calcSpeed;
          }
        }
      }

      const nowFormatted = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const updatedRecord: TransporterLocationRecord = {
        order_id: orderId,
        delivery_id: activeOrder?.orderNumber || orderId,
        transporter_id: supabaseUser?.id || null,
        transporter_name: transporterProfile?.fullName || activeOrder?.transporter?.name || 'Driver',
        vehicle_plate: transporterProfile?.vehicleRegistrationNumber || activeOrder?.transporter?.vehiclePlate || 'KA-09-E-4421',
        latitude,
        longitude,
        accuracy: accuracy ? Math.round(accuracy) : null,
        speed: speedKmh,
        heading: heading || null,
        status: activeOrder?.status || 'IN_TRANSIT',
        is_active: true,
        updated_at: new Date().toISOString()
      };

      setLocation(updatedRecord);
      setGpsStatus('LIVE');
      setLastUpdated(nowFormatted);
      lastCoordsRef.current = { lat: latitude, lng: longitude };

      // Throttle DB updates to avoid flooding Supabase (min 3 seconds interval)
      const now = Date.now();
      if (now - lastPushTimestampRef.current >= 3000) {
        lastPushTimestampRef.current = now;
        await pushDriverLocation(updatedRecord);
      }
    };

    const onPositionError = (err: GeolocationPositionError) => {
      console.warn('Geolocation watchPosition error:', err.message);
      if (err.code === err.PERMISSION_DENIED) {
        setGpsStatus('PERMISSION_DENIED');
        setErrorMessage('Location permission was denied. Please allow location access in your browser.');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setGpsStatus('WAITING_GPS');
        setErrorMessage('Waiting for GPS signal from device...');
      } else if (err.code === err.TIMEOUT) {
        setGpsStatus('WAITING_GPS');
        setErrorMessage('GPS signal timeout. Acquiring new satellite lock...');
      }
    };

    const watchId = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 20000
    });

    watchIdRef.current = watchId;
    setIsWatching(true);
  }, [orderId, activeOrder, supabaseUser, transporterProfile]);

  const stopDriverTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  // ==========================================
  // RECIPIENT MODE: Supabase Realtime Listener
  // ==========================================
  useEffect(() => {
    if (isDriver) {
      // Driver triggers watchPosition
      startDriverTracking();
      return () => {
        stopDriverTracking();
      };
    } else {
      // Farmer or Buyer: Fetch initial and listen for realtime updates
      let isMounted = true;
      setGpsStatus('CONNECTING');

      // 1. Initial location fetch
      fetchOrderLocation(orderId).then((initialLoc) => {
        if (!isMounted) return;
        if (initialLoc && initialLoc.latitude && initialLoc.longitude) {
          setLocation(initialLoc);
          setGpsStatus(initialLoc.is_active ? 'LIVE' : 'COMPLETED');
          if (initialLoc.updated_at) {
            const date = new Date(initialLoc.updated_at);
            setLastUpdated(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        } else {
          setGpsStatus('WAITING_GPS');
        }
      });

      // 2. Realtime subscription
      const unsubscribe = subscribeToOrderLocation(
        orderId,
        (updatedLoc) => {
          if (!isMounted) return;
          setLocation(updatedLoc);
          setGpsStatus(updatedLoc.is_active ? 'LIVE' : 'COMPLETED');
          setErrorMessage(null);
          const nowFormatted = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          setLastUpdated(nowFormatted);
        },
        (status) => {
          if (!isMounted) return;
          if (status === 'SUBSCRIBED') {
            // Channel active
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('Realtime channel error for order:', orderId);
          }
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [isDriver, orderId, startDriverTracking, stopDriverTracking]);

  return {
    location,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    accuracy: location?.accuracy ?? null,
    speedKmh: location?.speed ?? null,
    heading: location?.heading ?? null,
    gpsStatus,
    errorMessage,
    lastUpdated,
    distanceRemainingKm,
    isWatching,
    startDriverTracking,
    stopDriverTracking
  };
}
