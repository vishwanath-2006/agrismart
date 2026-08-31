import { supabase } from '../lib/supabase';
import { OrderItem } from '../types';

export interface SupabaseOrderRecord {
  id: string;
  order_number: string;
  farmer_id: string | null;
  buyer_id: string;
  assigned_transporter_id: string | null;
  status: string;
  crop_name: string;
  quantity_kg: number;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
}

const isValidUuid = (val?: string | null): val is string =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

/**
 * Synchronize a client-side OrderItem to public.orders in Supabase
 */
export async function syncOrderToSupabase(
  order: OrderItem,
  currentUserId?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const activeUserId = authData?.user?.id || currentUserId;

    // If not authenticated yet, preserve client-state operation safely
    if (!activeUserId) {
      return { success: true };
    }

    const buyerId = isValidUuid(order.buyer?.id) ? order.buyer.id : activeUserId;
    const farmerId = isValidUuid(order.farmer?.id) ? order.farmer.id : null;
    const transporterId = isValidUuid(order.transporter?.id) ? order.transporter.id : null;

    const payload: SupabaseOrderRecord = {
      id: order.id,
      order_number: order.orderNumber,
      farmer_id: farmerId,
      buyer_id: buyerId,
      assigned_transporter_id: transporterId,
      status: order.status,
      crop_name: order.cropName,
      quantity_kg: order.quantityKg,
      total_amount: order.totalAmount
    };

    const { error } = await supabase
      .from('orders')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Notice syncing order to Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Exception in syncOrderToSupabase:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Atomically claim an open transport job via the controlled claim_transport_job RPC
 */
export async function claimTransportJobInSupabase(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('claim_transport_job', {
      p_order_id: orderId
    });

    if (error) {
      console.warn('Notice claiming transport job in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Exception in claimTransportJobInSupabase:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Update the order status in Supabase (e.g. IN_TRANSIT, DELIVERED, COMPLETED)
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.warn('Notice updating order status in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Exception in updateOrderStatusInSupabase:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
