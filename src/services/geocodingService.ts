/**
 * Geocoding Service for AgriSmart AI Marketplace
 * Provides safe, client-side reverse geocoding using OpenStreetMap Nominatim API.
 * Explicitly requests English output (`accept-language=en`) to ensure language independence.
 * No private API keys or secret credentials required.
 */

export interface ReverseGeocodeResult {
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  farmLocation?: string;
  displayName?: string;
}

/**
 * Reverse geocode real GPS coordinates (latitude, longitude) into structured administrative address.
 * Prioritizes specific localities (village/town/suburb) and district-level administrative regions in English.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  // Bounded coordinates validation
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    // Explicitly enforce English language in query parameters and Accept-Language header
    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=14&addressdetails=1&accept-language=en`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en'
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

    // 1. Village / Town extraction (prioritize the most specific locality)
    const rawVillage =
      addr.village ||
      addr.town ||
      addr.hamlet ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.locality ||
      addr.city ||
      addr.city_district ||
      addr.municipality ||
      data.name ||
      '';

    const village = rawVillage ? String(rawVillage).trim() : undefined;

    // 2. District extraction (prefer state_district, district, or county; avoid plain town/suburb)
    const rawDistrict =
      addr.state_district ||
      addr.district ||
      addr.county ||
      (addr.city && addr.city.toLowerCase().includes('urban') ? addr.city : '') ||
      '';

    const district = rawDistrict
      ? String(rawDistrict)
          .replace(/\s+District$/i, '')
          .replace(/\s+(taluk|subdistrict|tahsil|tehsil)$/i, '')
          .trim()
      : undefined;

    // 3. State extraction
    const state = addr.state ? String(addr.state).trim() : undefined;

    // 4. Pincode / Postcode extraction
    const pincode = addr.postcode ? String(addr.postcode).trim() : undefined;

    // 5. Construct clean, human-readable farm location string from real fields
    const farmLocationParts = [village, district, state].filter(Boolean);
    const farmLocation = farmLocationParts.length > 0 ? farmLocationParts.join(', ') : undefined;

    return {
      village,
      district,
      state,
      pincode,
      farmLocation,
      displayName: data.display_name ? String(data.display_name).trim() : undefined
    };
  } catch (err: any) {
    console.warn('Reverse geocoding request notice:', err?.name === 'AbortError' ? 'Timeout' : err?.message);
    return null;
  }
}
