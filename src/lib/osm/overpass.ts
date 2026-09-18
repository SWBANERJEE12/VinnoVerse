import AsyncStorage from '@react-native-async-storage/async-storage';
import { elementsToPois } from './categorize';
import type { OsmPoi } from './types';

const CACHE_KEY = 'vinnoverse.osm.pois.v2';
const CACHE_MS = 24 * 60 * 60 * 1000;

/** Overpass requires a real User-Agent; without it the API returns HTTP 406. */
const OVERPASS_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Accept: 'application/json',
  'User-Agent': 'VinnoVerse/1.0 (VIT campus map; contact: student-app)',
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

/** OSM relation for VIT Vellore campus boundary */
const VIT_RELATION_ID = 15931944;

const QUERY = `
[out:json][timeout:60];
relation(${VIT_RELATION_ID});
map_to_area->.campus;
(
  nwr["amenity"](area.campus);
  nwr["shop"](area.campus);
  nwr["tourism"](area.campus);
  nwr["leisure"](area.campus);
  nwr["healthcare"](area.campus);
  nwr["building"~"university|college|school|dormitory|hostel|library|auditorium|sports_hall|residential"](area.campus);
  nwr["office"="university"](area.campus);
);
out center tags;
`;

type CachePayload = { at: number; pois: OsmPoi[] };

async function queryOverpass(): Promise<OsmPoi[]> {
  const body = `data=${encodeURIComponent(QUERY)}`;
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: OVERPASS_HEADERS,
        body,
      });

      if (!res.ok) {
        lastError = new Error(`Overpass ${endpoint} returned ${res.status}`);
        continue;
      }

      const json = (await res.json()) as {
        elements?: Parameters<typeof elementsToPois>[0];
        remark?: string;
      };

      if (json.remark) {
        lastError = new Error(json.remark);
        continue;
      }

      const pois = elementsToPois(json.elements ?? []);
      if (pois.length === 0) {
        lastError = new Error('No POIs inside VIT campus boundary');
        continue;
      }

      return pois;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Overpass request failed');
    }
  }

  throw lastError ?? new Error('Overpass unavailable');
}

export async function fetchVitOsmPois(force = false): Promise<OsmPoi[]> {
  if (!force) {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as CachePayload;
        if (Date.now() - parsed.at < CACHE_MS && parsed.pois.length > 0) {
          return parsed.pois;
        }
      }
    } catch {
      // ignore cache read errors
    }
  }

  const pois = await queryOverpass();

  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), pois }));
  } catch {
    // cache write is optional
  }

  return pois;
}
