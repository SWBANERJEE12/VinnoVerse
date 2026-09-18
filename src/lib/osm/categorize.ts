import type { PoiFilter } from '../../types';
import type { OsmPoi } from './types';

const SKIP = new Set([
  'bench',
  'waste_basket',
  'waste_disposal',
  'recycling',
  'street_lamp',
  'vending_machine',
  'drinking_water',
  'bicycle_parking',
  'motorcycle_parking',
  'parking_space',
  'grit_bin',
  'clock',
  'surveillance',
  'post_box',
]);

type RawElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function coord(el: RawElement) {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lon: el.lon };
  if (el.center) return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

function nameOf(tags: Record<string, string>) {
  return tags.name || tags.brand || tags.operator || tags['addr:housename'] || '';
}

function classify(tags: Record<string, string>): { category: PoiFilter; label: string; icon: string; importance: 1 | 2 | 3 } | null {
  const amenity = tags.amenity;
  const shop = tags.shop;
  const building = tags.building;
  const leisure = tags.leisure;
  const tourism = tags.tourism;
  const healthcare = tags.healthcare || tags['healthcare:speciality'];

  if (amenity && SKIP.has(amenity)) return null;

  if (['restaurant', 'cafe', 'fast_food', 'food_court', 'ice_cream', 'cafeteria', 'bar'].includes(amenity ?? '')) {
    return { category: 'Food', label: 'Food & Beverage', icon: '☕', importance: amenity === 'food_court' ? 1 : 2 };
  }
  if (shop) {
    return { category: 'Services', label: 'Shop', icon: '🛒', importance: shop === 'supermarket' ? 1 : 2 };
  }
  if (amenity === 'library' || building === 'library') {
    return { category: 'Academic', label: 'Library', icon: '📚', importance: 1 };
  }
  if (['university', 'college', 'school'].includes(building ?? '') || amenity === 'university' || tags.office === 'university') {
    return { category: 'Academic', label: 'Academic Building', icon: '🏫', importance: 1 };
  }
  if (['dormitory', 'hostel', 'residential'].includes(building ?? '') || amenity === 'dormitory') {
    return { category: 'Hostel', label: 'Hostel / Residence', icon: '🛏', importance: 2 };
  }
  if (['stadium', 'sports_centre', 'pitch', 'playground', 'track', 'swimming_pool'].includes(leisure ?? '')) {
    return { category: 'Sports', label: 'Sports Facility', icon: '⚽', importance: leisure === 'stadium' ? 1 : 2 };
  }
  if (amenity === 'hospital' || amenity === 'clinic' || healthcare) {
    return { category: 'Services', label: 'Health Centre', icon: '🏥', importance: 1 };
  }
  if (amenity === 'pharmacy') {
    return { category: 'Services', label: 'Pharmacy', icon: '💊', importance: 2 };
  }
  if (amenity === 'atm' || amenity === 'bank') {
    return { category: 'Services', label: amenity === 'atm' ? 'ATM' : 'Bank', icon: '🏦', importance: 2 };
  }
  if (amenity === 'parking' || amenity === 'bus_station' || amenity === 'taxi') {
    return { category: 'Services', label: 'Transport / Parking', icon: '🚌', importance: 2 };
  }
  if (amenity === 'toilets') {
    return { category: 'Services', label: 'Restroom', icon: '🚻', importance: 3 };
  }
  if (tourism === 'museum' || building === 'auditorium' || amenity === 'theatre') {
    return { category: 'Services', label: 'Auditorium / Hall', icon: '🎭', importance: 1 };
  }
  if (amenity === 'entrance' || building === 'gate') {
    return { category: 'Services', label: 'Entrance / Gate', icon: '🚪', importance: 1 };
  }
  if (building && !['yes', 'roof', 'construction', 'shed', 'garage', 'service'].includes(building)) {
    const n = nameOf(tags);
    if (n) return { category: 'Academic', label: 'Campus Building', icon: '🏢', importance: 2 };
  }

  return null;
}

function distM(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function elementsToPois(elements: RawElement[]): OsmPoi[] {
  const raw: OsmPoi[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const c = coord(el);
    const info = classify(tags);
    const name = nameOf(tags);
    if (!c || !info) continue;
    if (!name && info.importance > 2) continue;
    if (!name && !tags.amenity && !tags.shop && !tags.building) continue;

    raw.push({
      id: `${el.type}/${el.id}`,
      name: name || info.label,
      category: info.category,
      categoryLabel: info.label,
      latitude: c.lat,
      longitude: c.lon,
      importance: info.importance,
      icon: info.icon,
      tags,
    });
  }

  const deduped: OsmPoi[] = [];
  for (const poi of raw.sort((a, b) => a.importance - b.importance)) {
    const near = deduped.find(
      (d) =>
        d.name.toLowerCase() === poi.name.toLowerCase() &&
        distM({ lat: d.latitude, lon: d.longitude }, { lat: poi.latitude, lon: poi.longitude }) < 40,
    );
    if (!near) deduped.push(poi);
  }

  return deduped.slice(0, 220);
}
