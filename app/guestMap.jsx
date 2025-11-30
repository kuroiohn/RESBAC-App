// app/guestMap.jsx
import { useEffect, useState, useRef } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import polyline from "@mapbox/polyline";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRealtime } from "../contexts/RealtimeProvider";

export default function GuestMap() {
  const apiKey = Constants.expoConfig.extra.googleMapsApiKey;
  const router = useRouter();
  const { evacId, pickupId } = useLocalSearchParams();
  const { evacData, pickupData } = useRealtime();

  const [src, setSrc] = useState(null);
  const [dest, setDest] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);

  const mapRef = useRef(null);

  const fetchDirections = async (origin, destination) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes?.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);
      }
    } catch (err) {
      console.error("Directions error:", err);
    }
  };

  // Get user location & destination
  useEffect(() => {
    const setupMap = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Required",
            "We need your location to show the route."
          );
          setSrc({ latitude: 14.65, longitude: 121.1 }); // fallback
        } else {
          const location = await Location.getCurrentPositionAsync({});
          setSrc({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }

        // Get destination
        if (evacId && evacData?.length) {
          const item = evacData.find((e) => String(e.id) === String(evacId));
          if (item?.evacGeolocation) {
            const [lat, lng] = item.evacGeolocation.split(",").map(Number);
            setDest({ latitude: lat, longitude: lng });
            setTitle(item.evacName);
          }
        } else if (pickupId && pickupData?.length) {
          const item = pickupData.find(
            (p) => String(p.id) === String(pickupId)
          );
          if (item?.pickupGeolocation) {
            const [lat, lng] = item.pickupGeolocation.split(",").map(Number);
            setDest({ latitude: lat, longitude: lng });
            setTitle(item.pickupName);
          }
        }
      } catch (err) {
        console.error("GuestMap setup error:", err);
      } finally {
        setLoading(false);
      }
    };

    setupMap();
  }, [evacId, pickupId, evacData, pickupData]);

  // Auto-fit markers
  useEffect(() => {
    if (src && dest && mapRef.current) {
      // Auto-fit markers
      mapRef.current.fitToCoordinates([src, dest], {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });

      // Fetch route from Google Directions API
      fetchDirections(src, dest);
    }
  }, [src, dest]);

  if (loading || !src || !dest) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size='large' color='#0060FF' />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Close button */}
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name='close' size={24} />
      </Pressable>

      {/* MapView */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: src.latitude,
          longitude: src.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User marker */}
        <Marker coordinate={src} title='You are here' pinColor='#0060FF' />

        {/* Destination marker */}
        <Marker coordinate={dest} title={title} description='Destination' />

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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
