import { supabase } from '../lib/supabase';

export interface TransporterLocationRecord {
  id?: string;
  order_id: string;
  delivery_id?: string;
  transporter_id?: string | null;
  transporter_name?: string;
  vehicle_plate?: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null; // in km/h
  heading?: number | null;
  status?: string;
  battery_level?: number | null;
  is_active?: boolean;
  updated_at?: string;
  created_at?: string;
}

/**
 * Calculate great-circle distance between two points in kilometers (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Upsert the current driver location into Supabase
 */
export async function pushDriverLocation(
  location: TransporterLocationRecord
): Promise<{ data: TransporterLocationRecord | null; error: Error | null }> {
  try {
    const payload = {
      order_id: location.order_id,
      delivery_id: location.delivery_id || location.order_id,
      transporter_id: location.transporter_id || null,
      transporter_name: location.transporter_name || 'Driver',
      vehicle_plate: location.vehicle_plate || '',
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy ?? null,
      speed: location.speed !== undefined && location.speed !== null && !isNaN(location.speed) ? Number(location.speed) : null,
      heading: location.heading ?? null,
      status: location.status || 'IN_TRANSIT',
      is_active: location.is_active ?? true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('transporter_locations')
      .upsert(payload, { onConflict: 'order_id' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase pushDriverLocation notice:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as TransporterLocationRecord, error: null };
  } catch (err: any) {
    console.warn('pushDriverLocation exception:', err);
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch the latest location record for a specific order
 */
export async function fetchOrderLocation(
  orderId: string
): Promise<TransporterLocationRecord | null> {
  try {
    const { data, error } = await supabase
      .from('transporter_locations')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      // If not found yet, return null
      return null;
    }

    return data as TransporterLocationRecord;
  } catch {
    return null;
  }
}

/**
 * Mark a delivery location tracking as completed / inactive
 */
export async function stopOrderTracking(orderId: string): Promise<void> {
  try {
    await supabase
      .from('transporter_locations')
      .update({
        is_active: false,
        status: 'DELIVERED',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);
  } catch (err) {
    console.warn('stopOrderTracking notice:', err);
  }
}

/**
 * Subscribe to realtime location changes for an order
 */
export function subscribeToOrderLocation(
  orderId: string,
  onLocationUpdate: (loc: TransporterLocationRecord) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR') => void
) {
  const channelName = `location-order-${orderId}-${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transporter_locations',
        filter: `order_id=eq.${orderId}`
      },
      (payload) => {
        if (payload.new && (payload.new as any).latitude && (payload.new as any).longitude) {
          onLocationUpdate(payload.new as TransporterLocationRecord);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        onStatusChange?.('SUBSCRIBED');
      } else if (status === 'CLOSED') {
        onStatusChange?.('CLOSED');
      } else if (status === 'CHANNEL_ERROR') {
        onStatusChange?.('CHANNEL_ERROR');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
