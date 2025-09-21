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
import { WebView } from 'react-native-webview';
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

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
            barangay: address?.subLocality || address?.village || "Unknown Barangay",
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
          formattedAddress: `Lat: ${selectedCoords.latitude.toFixed(6)}, Lng: ${selectedCoords.longitude.toFixed(6)}`,
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

  // Generate HTML for the map
  const generateMapHTML = (lat, lng) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .center-pin {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -100%);
                z-index: 1000;
                font-size: 30px;
                color: #ff0000;
                pointer-events: none;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            .confirm-btn {
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: #0060ff;
                color: white;
                border: none;
                padding: 15px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                z-index: 1000;
                cursor: pointer;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .confirm-btn:hover {
                background: #0052e0;
            }
            .coords-display {
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                padding: 12px;
                border-radius: 8px;
                text-align: center;
                font-size: 14px;
                z-index: 1000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .instruction {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }
            .coordinates {
                font-family: 'Courier New', monospace;
                color: #666;
                font-size: 12px;
            }
            .recenter-btn {
                position: absolute;
                top: 80px;
                right: 20px;
                background: #0060ff;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 4px;
                white-space: nowrap;
            }
            .recenter-btn:hover {
                background: #0052e0;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div class="center-pin">📍</div>
        <div class="coords-display">
            <div class="instruction">Move the map to adjust your location</div>
            <div class="coordinates" id="coordinates">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
        </div>
        <button class="recenter-btn" onclick="recenterMap()" title="Return to your actual GPS location">
            Back to Current Location
        </button>
        <button class="confirm-btn" onclick="confirmLocation()">Choose This Location</button>
        
        <script>
            let userLocation = [${lat}, ${lng}];
            
            // Initialize map
            const map = L.map('map', {
                center: userLocation,
                zoom: 16,
                zoomControl: true
            });

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            // Add user location marker (small blue dot)
            const userMarker = L.circleMarker(userLocation, {
                color: '#0060ff',
                fillColor: '#0060ff',
                fillOpacity: 0.8,
                radius: 8,
                weight: 2
            }).addTo(map).bindPopup('Your current location');

            // Update coordinates display when map moves
            map.on('moveend', function() {
                const center = map.getCenter();
                document.getElementById('coordinates').textContent = 
                    center.lat.toFixed(6) + ', ' + center.lng.toFixed(6);
            });

            function confirmLocation() {
                const center = map.getCenter();
                const message = JSON.stringify({
                    type: 'locationSelected',
                    latitude: center.lat,
                    longitude: center.lng
                });
                window.ReactNativeWebView.postMessage(message);
            }

            function recenterMap() {
                map.setView(userLocation, 16);
            }

            // Add loading indicator when tiles are loading
            map.on('loading', function() {
                console.log('Map loading...');
            });

            map.on('load', function() {
                console.log('Map loaded');
            });
        </script>
    </body>
    </html>
    `;
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
            {locationData.coordinates.latitude.toFixed(6)}, {locationData.coordinates.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {!locationData && !loading && (
        <Text style={styles.helpText}>
          We'll use your location to provide accurate emergency services in your area.
        </Text>
      )}

      {/* Map Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
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
            <WebView
              source={{ 
                html: generateMapHTML(currentLocation.latitude, currentLocation.longitude) 
              }}
              style={styles.webView}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'locationSelected') {
                    handleLocationConfirmed({
                      latitude: data.latitude,
                      longitude: data.longitude
                    });
                  }
                } catch (error) {
                  console.error('Error parsing message:', error);
                }
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="#0060ff" />
                  <Text style={styles.loadingText}>Loading map...</Text>
                </View>
              )}
            />
          )}

          {isGettingAddress && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#0060ff" />
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0060ff',
    fontWeight: '500',
  },
});

export default LocationPermissionInput;
