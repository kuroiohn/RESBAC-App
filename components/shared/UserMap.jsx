// components/shared/RouteMapView.jsx
import { View, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import polyline from "@mapbox/polyline";

export default function UserMap({ src, dest, title, onClose }) {
  const apiKey = Constants.expoConfig.extra.googleMapsApiKey;

  const mapRef = useRef(null);

  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch route
  const fetchDirections = async () => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${src[0]},${src[1]}&destination=${dest[0]},${dest[1]}&mode=driving&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes?.length > 0) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);
      }
    } catch (error) {
      console.log("Route error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirections();
  }, []);

  // Fit map to markers once loaded
  useEffect(() => {
    if (routeCoords.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: src[0], longitude: src[1] },
          { latitude: dest[0], longitude: dest[1] },
        ],
        {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        }
      );
    }
  }, [routeCoords]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size='large' color='#0060FF' />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Close button */}
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Ionicons name='close' size={24} color='#000' />
      </Pressable>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: src[0],
          longitude: src[1],
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* USER ADDRESS */}
        <Marker
          coordinate={{ latitude: src[0], longitude: src[1] }}
          title='Your Home'
          pinColor='#0060FF'
        />

        {/* DESTINATION */}
        <Marker
          coordinate={{ latitude: dest[0], longitude: dest[1] }}
          title={title}
          description='Destination'
        />

        {/* ROUTE */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor='#0060FF'
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
