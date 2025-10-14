// app/guestMap.jsx
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import RouteMapWebView from "../components/shared/RouteMapWebView";
import { useRealtime } from "../contexts/RealtimeProvider";

export default function GuestMap() {
  const router = useRouter();
  const { evacId, pickupId } = useLocalSearchParams();
  const { evacData, pickupData } = useRealtime(); // 👈 we'll use both
  const [src, setSrc] = useState(null);
  const [dest, setDest] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupMap = async () => {
      try {
        // 1️⃣ Ask for location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Required",
            "We need your location to show the route."
          );
          setSrc([14.65, 121.1]); // fallback default location
        } else {
          const location = await Location.getCurrentPositionAsync({});
          setSrc([location.coords.latitude, location.coords.longitude]);
        }

        // 2️⃣ Find the selected evacuation center OR pickup location
        if (evacId && evacData?.length) {
          const selectedEvac = evacData.find(
            (e) => String(e.id) === String(evacId)
          );
          if (selectedEvac?.evacGeolocation) {
            const [lat, lng] = selectedEvac.evacGeolocation
              .split(",")
              .map((n) => Number(n.trim()));
            setDest([lat, lng]);
            setTitle(selectedEvac.evacName);
          }
        } else if (pickupId && pickupData?.length) {
          const selectedPickup = pickupData.find(
            (p) => String(p.id) === String(pickupId)
          );
          if (selectedPickup?.pickupGeolocation) {
            const [lat, lng] = selectedPickup.pickupGeolocation
              .split(",")
              .map((n) => Number(n.trim()));
            setDest([lat, lng]);
            setTitle(selectedPickup.pickupName);
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

  if (loading || !src || !dest) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size='large' color='#0060FF' />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name='close' size={24} />
      </Pressable>
      <RouteMapWebView src={src} dest={dest} safePopupTitle={title} />
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
