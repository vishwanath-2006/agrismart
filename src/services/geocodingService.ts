/**
 * Geocoding Service for AgriSmart AI Marketplace
 * Provides safe, client-side reverse geocoding using OpenStreetMap Nominatim API.
 * No private API keys or secret credentials required.
 */

export interface ReverseGeocodeResult {
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  displayName?: string;
}

/**
 * Reverse geocode real GPS coordinates (latitude, longitude) into structured administrative address.
 * Treats external API output as untrusted and safely extracts available fields.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  // Bounded coordinates check
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=14&addressdetails=1`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Reverse geocoding HTTP status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!data || typeof data !== 'object') {
      return null;
    }

    const addr = data.address || {};

    // 1. Village / Town extraction
    const village =
      addr.village ||
      addr.town ||
      addr.suburb ||
      addr.hamlet ||
      addr.neighbourhood ||
      addr.city_district ||
      addr.city ||
      addr.municipality ||
      '';

    // 2. District extraction
    const district =
      addr.state_district ||
      addr.district ||
      addr.county ||
      addr.city ||
      '';

    // 3. State extraction
    const state = addr.state || '';

    // 4. Pincode / Postcode extraction
    const pincode = addr.postcode || '';

    return {
      village: village ? String(village).trim() : undefined,
      district: district ? String(district).replace(/district/i, '').trim() : undefined,
      state: state ? String(state).trim() : undefined,
      pincode: pincode ? String(pincode).trim() : undefined,
      displayName: data.display_name ? String(data.display_name).trim() : undefined
    };
  } catch (err: any) {
    console.warn('Reverse geocoding request notice:', err?.name === 'AbortError' ? 'Timeout' : err?.message);
    return null;
  }
}
