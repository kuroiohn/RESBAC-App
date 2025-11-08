import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const LocationPermissionInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState(value || null);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGettingAddress, setIsGettingAddress] = useState(false);

  const requestLocationPermission = async () => {
    if (disabled) return;

    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "RESBAC needs location access to provide accurate emergency services.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coords);
      setShowMap(true);
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

  const handleLocationConfirmed = async (selectedCoords) => {
    try {
      setIsGettingAddress(true);

      // Try to get address
      let locationInfo;
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: selectedCoords.latitude,
          longitude: selectedCoords.longitude,
        });

        const address = reverseGeocode[0];
        locationInfo = {
          coordinates: selectedCoords,
          address: {
            street: address?.street || "Unknown Street",
            city: address?.city || "Unknown City",
            region: address?.region || "Unknown Region",
            country: address?.country || "Philippines",
            postalCode: address?.postalCode || "",
            district: address?.district || "Unknown District",
            barangay:
              address?.subLocality || address?.village || "Unknown Barangay",
          },
          formattedAddress: formatAddress(address),
          timestamp: new Date().toISOString(),
        };
      } catch (geocodeError) {
        console.log("Reverse geocoding failed, using coordinates only");
        locationInfo = {
          coordinates: selectedCoords,
          address: {
            street: "Selected Location",
            city: "Unknown City",
            region: "Unknown Region",
            country: "Philippines",
            postalCode: "",
            district: "Unknown District",
            barangay: "Unknown Barangay",
          },
          formattedAddress: `Lat: ${selectedCoords.latitude.toFixed(
            6
          )}, Lng: ${selectedCoords.longitude.toFixed(6)}`,
          timestamp: new Date().toISOString(),
        };
      }

      setLocationData(locationInfo);
      onChange(locationInfo);
      setShowMap(false);
    } catch (error) {
      console.error("Error confirming location:", error);
    } finally {
      setIsGettingAddress(false);
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

          <TouchableOpacity
            style={styles.editLocationButton}
            onPress={() => {
              setCurrentLocation(locationData.coordinates);
              setShowMap(true);
            }}
          >
            <Ionicons name='pencil' size={14} color='#0060ff' />
            <Text style={styles.editLocationText}>Edit Location</Text>
          </TouchableOpacity>

          <Text style={styles.coordinatesText}>
            {locationData.coordinates.latitude.toFixed(6)},{" "}
            {locationData.coordinates.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {!locationData && !loading && (
        <Text style={styles.helpText}>
          We'll use your location to provide accurate emergency services in your
          area.
        </Text>
      )}

      <Modal
        visible={showMap}
        animationType='slide'
        onRequestClose={() => setShowMap(false)}
      >
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              onPress={() => setShowMap(false)}
              style={styles.backButton}
            >
              <Ionicons name='arrow-back' size={24} color='#0060ff' />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Select Your Location</Text>
            <View style={{ width: 40 }} />
          </View>

          {currentLocation && (
            <View style={{ flex: 1 }}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onRegionChangeComplete={(region) => {
                  setCurrentLocation({
                    latitude: region.latitude,
                    longitude: region.longitude,
                  });
                }}
                provider={MapView.PROVIDER_GOOGLE}
                showsUserLocation={true}
              />

              {/* Center Pin Overlay */}
              <View pointerEvents='none' style={styles.pinContainer}>
                <Ionicons name='location-sharp' size={40} color='#FF0000' />
              </View>
            </View>
          )}

          <View style={styles.mapControls}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => handleLocationConfirmed(currentLocation)}
            >
              <Text style={styles.confirmText}>Choose This Location</Text>
            </TouchableOpacity>
          </View>

          {isGettingAddress && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size='large' color='#0060ff' />
              <Text style={styles.processingText}>Getting address...</Text>
            </View>
          )}
        </View>
      </Modal>
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
    marginBottom: 8,
    lineHeight: 20,
  },
  editLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  editLocationText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#0060ff",
    fontWeight: "500",
  },
  coordinatesText: {
    fontSize: 11,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  backButton: {
    padding: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9ff",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#0060ff",
    fontWeight: "500",
  },

  mapControls: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  confirmBtn: {
    backgroundColor: "#0060ff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  pinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40, // lift the pin so the point touches the map center
    zIndex: 10,
    transform: [{ translateY: -10 }],
  },
});

export default LocationPermissionInput;
