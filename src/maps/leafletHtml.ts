/** Leaflet OSM map — live user location + dynamic OSM POI icons + walking routes */
export function buildLeafletHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #e8e4dc; }
    .user-dot {
      width: 14px; height: 14px; border-radius: 7px;
      background: #4285F4; border: 3px solid #fff;
      box-shadow: 0 0 0 7px rgba(66,133,244,0.22);
    }
    .poi-icon {
      width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
      font-size: 11px; line-height: 1; background: rgba(255,255,255,0.92);
      border-radius: 9px; border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 1px 3px rgba(0,0,0,0.18);
    }
    .poi-icon.sel { border: 2px solid #4285F4; transform: scale(1.15); }
    .leaflet-control-zoom a { font-size: 18px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([12.97049, 79.16083], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    let userMarker = null;
    let userCircle = null;
    let routeLine = null;
    let allPois = [];
    let categoryFilter = 'All';
    let selectedId = null;
    const markers = {};

    function post(msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    function maxImportanceForZoom(z) {
      if (z < 15) return 1;
      if (z < 16.5) return 2;
      return 3;
    }

    function poiIcon(poi, selected) {
      return L.divIcon({
        className: '',
        html: '<div class="poi-icon' + (selected ? ' sel' : '') + '">' + poi.icon + '</div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
    }

    function refreshMarkers() {
      const z = map.getZoom();
      const maxImp = maxImportanceForZoom(z);
      Object.keys(markers).forEach(function(id) {
        map.removeLayer(markers[id]);
        delete markers[id];
      });
      allPois.forEach(function(p) {
        if (categoryFilter !== 'All' && p.category !== categoryFilter) return;
        if (p.importance > maxImp) return;
        const m = L.marker([p.lat, p.lng], {
          icon: poiIcon(p, p.id === selectedId),
          zIndexOffset: p.id === selectedId ? 500 : 100,
        }).addTo(map);
        m.on('click', function() { post({ type: 'poi', id: p.id }); });
        markers[p.id] = m;
      });
    }

    window.setPois = function(pois) {
      allPois = pois || [];
      refreshMarkers();
    };

    window.setCategoryFilter = function(cat) {
      categoryFilter = cat || 'All';
      refreshMarkers();
    };

    window.selectPoi = function(id) {
      selectedId = id;
      refreshMarkers();
    };

    window.flyTo = function(lat, lng, zoom) {
      map.flyTo([lat, lng], zoom || 17, { duration: 0.6 });
    };

    window.centerUser = function(lat, lng) {
      map.flyTo([lat, lng], 17, { duration: 0.6 });
    };

    window.updateUser = function(lat, lng, accuracy) {
      if (!userMarker) {
        userMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: '',
            html: '<div class="user-dot"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
          zIndexOffset: 2000,
        }).addTo(map);
        userCircle = L.circle([lat, lng], {
          radius: accuracy || 25,
          color: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 0.12,
          weight: 1,
        }).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
        userCircle.setLatLng([lat, lng]);
        if (accuracy) userCircle.setRadius(accuracy);
      }
    };

    window.drawRoute = function(coords) {
      if (routeLine) map.removeLayer(routeLine);
      const latlngs = coords.map(function(c) { return [c.lat, c.lng]; });
      routeLine = L.polyline(latlngs, { color: '#4285F4', weight: 5, opacity: 0.85 }).addTo(map);
      map.fitBounds(routeLine.getBounds(), { padding: [90, 90] });
    };

    window.clearRoute = function() {
      if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    };

    map.on('zoomend', refreshMarkers);
    map.whenReady(function() { post({ type: 'ready' }); });
  </script>
</body>
</html>`;
}
