import type { WalkingRoute } from './types';

const OSRM = 'https://router.project-osrm.org/route/v1/foot';

export async function fetchWalkingRoute(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): Promise<WalkingRoute> {
  const url = `${OSRM}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VinnoVerse/1.0 (VIT campus map)' },
  });
  if (!res.ok) throw new Error(`Routing failed (${res.status})`);

  const data = (await res.json()) as {
    code: string;
    routes?: Array<{ distance: number; duration: number; geometry: { coordinates: [number, number][] } }>;
  };

  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error('No walking route found');
  }

  const route = data.routes[0];
  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
    distanceM: route.distance,
    durationS: route.duration,
  };
}

export function formatWalk(distanceM: number, durationS: number) {
  const m = Math.round(distanceM);
  const mins = Math.max(1, Math.round(durationS / 60));
  const dist = m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
  return `${dist} • ~${mins} min walk`;
}
