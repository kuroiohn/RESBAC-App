import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function RouteMapWebView({ src, dest, safePopupTitle }) {
  const html = useMemo(() => {
    if (!src || !dest) return "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
          <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
          <style>
            html, body, #map { height: 100%; margin: 0; padding: 0; }
            .leaflet-routing-container { display: none }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const source = [${src[0]}, ${src[1]}];
            const destination = [${dest[0]}, ${dest[1]}];

            const map = L.map('map').setView(destination, 17);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap'
            }).addTo(map);

            L.marker(destination).addTo(map)
              .bindTooltip('${safePopupTitle || "Destination"}', {
                permanent: true,
                direction: 'top',
                offset: [-15, 0],
              })
              .openTooltip();

            L.marker(source).addTo(map)
              .bindTooltip('Home', {
                permanent: true,
                direction: 'top',
                offset: [-15, 0],
              })
              .openTooltip();

            L.Routing.control({
              waypoints: [L.latLng(source[0], source[1]), L.latLng(destination[0], destination[1])],
              lineOptions: { styles: [{ color: 'red', weight: 4 }] },
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: true,
              showAlternatives: true
            }).addTo(map);
          </script>
        </body>
      </html>
    `;
  }, [src, dest, safePopupTitle]);

  return (
    <View style={styles.container}>
      <WebView source={{ html }} originWhitelist={["*"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
