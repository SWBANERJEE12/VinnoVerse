import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { PrimaryButton } from '../components/ui';
import { poiFilters } from '../data/vitPois';
import { fetchVitOsmPois } from '../lib/osm/overpass';
import { fetchWalkingRoute, formatWalk } from '../lib/osm/routing';
import type { OsmPoi } from '../lib/osm/types';
import { buildLeafletHtml } from '../maps/leafletHtml';
import { colors, radius, shadow, spacing } from '../theme';
import type { PoiFilter } from '../types';

const USER_BLUE = '#4285F4';

function matchesQuery(poi: OsmPoi, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    poi.name.toLowerCase().includes(q) ||
    poi.category.toLowerCase().includes(q) ||
    poi.categoryLabel.toLowerCase().includes(q)
  );
}

function poisForMap(pois: OsmPoi[]) {
  return pois.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    lat: p.latitude,
    lng: p.longitude,
    importance: p.importance,
    icon: p.icon,
  }));
}

export function MapsScreen() {
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const mapReadyRef = useRef(false);
  const poisRef = useRef<OsmPoi[]>([]);
  const mapHtml = useMemo(() => buildLeafletHtml(), []);

  const [filter, setFilter] = useState<PoiFilter | 'All'>('All');
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [pois, setPois] = useState<OsmPoi[]>([]);
  const [poisLoading, setPoisLoading] = useState(true);
  const [poisError, setPoisError] = useState<string | null>(null);
  const [selected, setSelected] = useState<OsmPoi | null>(null);
  const [routeInfo, setRouteInfo] = useState<string | null>(null);
  const [routing, setRouting] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'error'>('loading');
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const runMap = useCallback((js: string) => {
    if (!mapReadyRef.current) return;
    webRef.current?.injectJavaScript(`${js}; true;`);
  }, []);

  const pushPoisToMap = useCallback(
    (list: OsmPoi[]) => {
      runMap(`window.setPois(${JSON.stringify(poisForMap(list))})`);
    },
    [runMap],
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return pois.filter((poi) => matchesQuery(poi, query)).slice(0, 8);
  }, [pois, query]);

  const openPoi = useCallback(
    (poi: OsmPoi) => {
      setSelected(poi);
      setRouteInfo(null);
      setSearchFocused(false);
      setQuery(poi.name);
      runMap(`window.selectPoi(${JSON.stringify(poi.id)})`);
      runMap(`window.flyTo(${poi.latitude}, ${poi.longitude}, 17)`);
      runMap('window.clearRoute()');
    },
    [runMap],
  );

  const closePoi = useCallback(() => {
    setSelected(null);
    setRouteInfo(null);
    runMap('window.selectPoi(null)');
    runMap('window.clearRoute()');
  }, [runMap]);

  const focusUser = useCallback(() => {
    if (!userLocation) {
      setLocationNote('Turn on location permission to see your position.');
      return;
    }
    runMap(`window.centerUser(${userLocation.latitude}, ${userLocation.longitude})`);
  }, [runMap, userLocation]);

  const pushLocationToMap = useCallback(
    (coords: Location.LocationObjectCoords) => {
      const accuracy = coords.accuracy ?? 25;
      runMap(`window.updateUser(${coords.latitude}, ${coords.longitude}, ${accuracy})`);
    },
    [runMap],
  );

  const getDirections = useCallback(async () => {
    if (!selected || !userLocation) {
      setLocationNote('Allow location to get walking directions.');
      return;
    }
    setRouting(true);
    setRouteInfo(null);
    try {
      const route = await fetchWalkingRoute(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: selected.latitude, longitude: selected.longitude },
      );
      const coords = route.coordinates.map((c) => ({ lat: c.latitude, lng: c.longitude }));
      runMap(`window.drawRoute(${JSON.stringify(coords)})`);
      setRouteInfo(formatWalk(route.distanceM, route.durationS));
    } catch {
      setLocationNote('Could not find a walking route. Try again when closer to campus roads.');
    } finally {
      setRouting(false);
    }
  }, [runMap, selected, userLocation]);

  useEffect(() => {
    poisRef.current = pois;
    if (mapReadyRef.current) pushPoisToMap(pois);
  }, [pois, pushPoisToMap]);

  useEffect(() => {
    runMap(`window.setCategoryFilter(${JSON.stringify(filter)})`);
  }, [filter, runMap]);

  useEffect(() => {
    if (userLocation && mapReadyRef.current) pushLocationToMap(userLocation);
  }, [userLocation, pushLocationToMap]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationStatus('denied');
          setLocationNote('Location off — POIs still visible on the campus map.');
          return;
        }
        setLocationStatus('granted');
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation(current.coords);
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
          (update) => setUserLocation(update.coords),
        );
      } catch {
        setLocationStatus('error');
        setLocationNote('GPS unavailable — you can still browse campus POIs.');
      }
    })();

    return () => subscription?.remove();
  }, []);

  const loadPois = useCallback(async (force = false) => {
    try {
      setPoisLoading(true);
      setPoisError(null);
      const data = await fetchVitOsmPois(force);
      setPois(data);
      if (data.length === 0) setPoisError('No campus POIs found. Check your connection and tap Retry.');
    } catch {
      setPoisError('Could not load OpenStreetMap POIs. Check internet and tap Retry.');
    } finally {
      setPoisLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPois();
  }, [loadPois]);

  const onMapMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type: string; id?: string };
        if (data.type === 'ready') {
          mapReadyRef.current = true;
          setMapReady(true);
          pushPoisToMap(poisRef.current);
          runMap(`window.setCategoryFilter(${JSON.stringify(filter)})`);
          if (userLocation) pushLocationToMap(userLocation);
        }
        if (data.type === 'poi' && data.id) {
          const poi = poisRef.current.find((p) => p.id === data.id);
          if (poi) openPoi(poi);
        }
      } catch {
        // ignore
      }
    },
    [filter, openPoi, pushLocationToMap, pushPoisToMap, runMap, userLocation],
  );

  return (
    <View style={styles.root}>
      <WebView
        ref={webRef}
        source={{ html: mapHtml }}
        style={styles.map}
        onMessage={onMapMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback
        setSupportMultipleWindows={false}
      />

      {!mapReady || poisLoading ? (
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator color={USER_BLUE} size="large" />
          <Text style={styles.mapLoadingText}>
            {poisLoading ? 'Loading VIT POIs from OpenStreetMap…' : 'Loading campus map…'}
          </Text>
        </View>
      ) : null}

      {poisError ? (
        <View style={[styles.note, { top: insets.top + 100 }]}>
          <Text style={styles.noteText}>{poisError}</Text>
          <Pressable onPress={() => loadPois(true)} hitSlop={8} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <View style={styles.searchShell}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Search VIT"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        {searchFocused && searchResults.length > 0 ? (
          <View style={styles.results}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable style={styles.resultRow} onPress={() => openPoi(item)}>
                  <Text style={styles.resultIcon}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultMeta}>{item.categoryLabel}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {poiFilters.map((chip) => (
            <Pressable
              key={chip}
              onPress={() => setFilter(chip)}
              style={[styles.chip, filter === chip && styles.chipOn]}
            >
              <Text style={[styles.chipText, filter === chip && styles.chipTextOn]}>{chip}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Pressable
        style={[styles.myLocation, { bottom: selected ? 210 : insets.bottom + 90 }]}
        onPress={focusUser}
      >
        {locationStatus === 'loading' ? (
          <ActivityIndicator size="small" color={USER_BLUE} />
        ) : (
          <Ionicons name="locate" size={22} color={USER_BLUE} />
        )}
      </Pressable>

      {locationNote ? (
        <View style={[styles.note, { top: insets.top + 140 }]}>
          <Text style={styles.noteText}>{locationNote}</Text>
          <Pressable onPress={() => setLocationNote(null)} hitSlop={8}>
            <Ionicons name="close" size={14} color={colors.muted} />
          </Pressable>
        </View>
      ) : null}

      {locationStatus === 'granted' && userLocation && !locationNote && !selected ? (
        <View style={[styles.liveBadge, { top: insets.top + 140 }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live location on</Text>
        </View>
      ) : null}

      {selected ? (
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetIcon}>{selected.icon}</Text>
          <Text style={styles.sheetTitle}>{selected.name}</Text>
          <Text style={styles.sheetCat}>{selected.categoryLabel}</Text>
          <Text style={styles.sheetMeta}>VIT Vellore · OpenStreetMap</Text>
          {routeInfo ? <Text style={styles.routeInfo}>{routeInfo}</Text> : null}
          <PrimaryButton label={routing ? 'Finding route…' : 'Directions'} loading={routing} onPress={getDirections} />
          <Pressable onPress={closePoi} style={styles.dismiss}>
            <Text style={styles.dismissText}>Close</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  map: { flex: 1, backgroundColor: '#e8e4dc' },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 12,
  },
  mapLoadingText: { color: colors.muted, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    gap: 10,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink },
  results: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    maxHeight: 260,
    overflow: 'hidden',
    ...shadow.card,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  resultIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  resultName: { fontWeight: '700', color: colors.ink },
  resultMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  filters: { gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontWeight: '700', fontSize: 13, color: colors.ink },
  chipTextOn: { color: '#fff' },
  myLocation: {
    position: 'absolute',
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  liveBadge: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.paper,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: USER_BLUE },
  liveText: { fontSize: 12, fontWeight: '700', color: USER_BLUE },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 8,
  },
  sheetIcon: { fontSize: 22, marginBottom: 4 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  sheetCat: { marginTop: 4, color: colors.muted, fontWeight: '600' },
  sheetMeta: { marginTop: 2, color: colors.muted, fontSize: 12 },
  routeInfo: { marginTop: 12, fontWeight: '700', color: USER_BLUE, fontSize: 15 },
  dismiss: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  dismissText: { color: colors.muted, fontWeight: '700' },
  note: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paper,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    maxWidth: '92%',
  },
  noteText: { color: colors.muted, fontSize: 12, flex: 1 },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.ink,
  },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
