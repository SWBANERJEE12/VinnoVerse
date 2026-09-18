import type { PoiFilter } from '../../types';

export type OsmPoi = {
  id: string;
  name: string;
  category: PoiFilter;
  categoryLabel: string;
  latitude: number;
  longitude: number;
  importance: 1 | 2 | 3;
  icon: string;
  tags: Record<string, string>;
};

export type WalkingRoute = {
  coordinates: Array<{ latitude: number; longitude: number }>;
  distanceM: number;
  durationS: number;
};
