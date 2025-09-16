import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const LocationPermissionInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState(value || null);

  const requestLocationPermission = async () => {
    if (disabled) return;

    setLoading(true);

    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "RESBAC needs location access to provide accurate emergency services. Please enable location permissions in your device settings.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = reverseGeocode[0];
      const locationInfo = {
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        address: {
          street: address?.street || "Unknown Street",
          city: address?.city || "Unknown City",
          region: address?.region || "Unknown Region",
          country: address?.country || "Philippines",
          postalCode: address?.postalCode || "",
          district: address?.district || "Unknown District",
        },
        formattedAddress: formatAddress(address),
        timestamp: new Date().toISOString(),
      };

      setLocationData(locationInfo);
      onChange(locationInfo);
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please check your GPS settings and try again.",
        [
          { text: "Cancel" },
          { text: "Retry", onPress: requestLocationPermission },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "Unknown Location";

    const parts = [
      address.street,
      address.district,
      address.city,
      address.region,
    ].filter(Boolean);

    return parts.join(", ") || "Unknown Location";
  };

  const clearLocation = () => {
    setLocationData(null);
    onChange(null);
  };

  return (
    <View style={styles.container}>
      {!locationData ? (
        <TouchableOpacity
          style={[
            styles.locationButton,
            disabled && styles.disabledButton,
            loading && styles.loadingButton,
          ]}
          onPress={requestLocationPermission}
          disabled={disabled || loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='small' color='#0060ff' />
              <Text style={styles.loadingText}>Getting location...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name='location-outline' size={20} color='#0060ff' />
              <Text style={styles.buttonText}>{placeholder}</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.locationResult}>
          <View style={styles.locationHeader}>
            <Ionicons name='location' size={16} color='#28a745' />
            <Text style={styles.locationTitle}>Location Confirmed</Text>
            <TouchableOpacity
              onPress={clearLocation}
              style={styles.clearButton}
            >
              <Ionicons name='close-circle' size={16} color='#dc3545' />
            </TouchableOpacity>
          </View>

          <Text style={styles.addressText}>
            {locationData.formattedAddress}
          </Text>

          {/* Hide coordinates from user - only for internal use */}
          {__DEV__ && (
            <Text style={styles.coordinatesText}>
              Lat: {locationData.coordinates.latitude.toFixed(6)}, Lng:{" "}
              {locationData.coordinates.longitude.toFixed(6)}
            </Text>
          )}
        </View>
      )}

      {!locationData && !loading && (
        <Text style={styles.helpText}>
          We'll use your location to provide accurate emergency services in your
          area.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "95%",
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: "#f8f9ff",
    borderWidth: 2,
    borderColor: "#0060ff",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 20,
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ccc",
    opacity: 0.6,
  },
  loadingButton: {
    borderStyle: "solid",
    borderColor: "#0060ff",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#0060ff",
    fontWeight: "500",
    textAlign: "center",
    flexShrink: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#0060ff",
  },
  locationResult: {
    backgroundColor: "#f8fff8",
    borderWidth: 1,
    borderColor: "#28a745",
    borderRadius: 8,
    padding: 15,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationTitle: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#28a745",
    flex: 1,
  },
  clearButton: {
    padding: 2,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 20,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16,
  },
});

export default LocationPermissionInput;
