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
          <style>
            html, body, #map {
              height: 100%;
              margin: 0;
              padding: 0;
            }
            .gm-style .gm-style-iw-c {
              padding: 8px !important;
            }
              .gm-style .gm-style-iw-c {
  background: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}
.gm-style .gm-style-iw-t::after {
  display: none !important;
}

          </style>
          <!-- Load Google Maps JavaScript API -->
          <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
        </head>
        <body>
          <div id="map"></div>
          <script>
  function initMap() {
    const source = { lat: ${src[0]}, lng: ${src[1]} };
    const destination = { lat: ${dest[0]}, lng: ${dest[1]} };

    const map = new google.maps.Map(document.getElementById('map'), {
      center: destination,
      zoom: 14,
      mapTypeId: 'roadmap'
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#FF3B30",
        strokeWeight: 5
      }
    });

    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin: source,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );

    // Custom styled info box
    const infoStyle = "background:#fff;padding:6px 10px;border-radius:8px;font-size:13px;font-weight:600;color:#111;box-shadow:0 1px 6px rgba(0,0,0,0.25);";

    // Home marker
    const homeMarker = new google.maps.Marker({
      position: source,
      map: map,
      icon: { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" },
    });
    const homeInfo = new google.maps.InfoWindow({
      content: '<div style="' + infoStyle + '">🏠 Home</div>'
    });
    homeInfo.open(map, homeMarker);

    // Destination marker
    const destMarker = new google.maps.Marker({
      position: destination,
      map: map,
      icon: { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" },
    });
    const destInfo = new google.maps.InfoWindow({
      content: '<div style="' + infoStyle + '">📍 ${
        safePopupTitle || "Evacuation Center"
      }</div>'
    });
    destInfo.open(map, destMarker);
  }

  window.onload = initMap;
</script>

        </body>
      </html>
    `;
  }, [src, dest, safePopupTitle]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
