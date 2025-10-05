import {
  ScrollView,
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { useRealtime } from "../../contexts/RealtimeProvider";

import { useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("window");

const PickUpLocation = () => {
  const { selectedId, showMap, tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("evacuationCenter");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mapVisible, setMapVisible] = useState(false);
  const flatListRef = useRef(null);
  const { evacData, pickupData } = useRealtime();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const data = activeTab === "evacuationCenter" ? evacData : pickupData;

  //  Switch to pickup tab automatically if tab param is set
  useEffect(() => {
    if (tab === "pickupLocations") {
      setActiveTab("pickupLocations");
    } else if (tab === "evacuationCenter") {
      setActiveTab("evacuationCenter");
    }
  }, [tab]);

  useEffect(() => {
    setActiveIndex(0);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 0, animated: false });
    }
  }, [activeTab, data]);

  if (!data || data.length === 0) return null;

  const currentLocation = data[activeIndex] || {};
  if (!currentLocation) return null;

  const phoneNumber =
    (activeTab === "evacuationCenter"
      ? currentLocation.evacContact
      : currentLocation.pickupContact) || "";

  // 📌 Static Tumana, Marikina coords
  const coords = [14.6537, 121.1022];

  const handleCall = () => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleMap = () => {
    if (coords && coords.length === 2) {
      setMapVisible(true);
    } else {
      console.warn("No coordinates available for this location.");
    }
  };

  const renderLocation = ({ item: location }) => (
    <View style={styles.frame}>
      <View style={styles.evacImageContainer}>
        <Image
          source={{
            uri:
              activeTab === "evacuationCenter"
                ? location.evacImage
                : location.pickupImage,
          }}
          style={styles.evacImage}
        />
        <LinearGradient
          colors={["#0060FF", "transparent"]}
          style={styles.gradientOverlay}
        />
      </View>
    </View>
  );

  useEffect(() => {
    if (selectedId && data?.length) {
      const index = data.findIndex(
        (loc) => loc.id.toString() === selectedId.toString()
      );
      if (index !== -1) {
        setActiveIndex(index);
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index, animated: false });
        }
      }
    }
  }, [selectedId, data]);

  const showMapParam = Number(showMap);

  useEffect(() => {
    if (showMapParam) {
      setMapVisible(true);
    }
  }, [showMapParam]);

  // 📝 Choose popup title based on current tab
  const popupTitle =
    activeTab === "evacuationCenter"
      ? currentLocation.evacName || "Evacuation Center"
      : currentLocation.pickupName || "Pickup Location";

  // Escape quotes for safe JS injection
  const safePopupTitle = popupTitle.replace(/'/g, "\\'");

  const leafletHtml = coords
    ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

        <!-- Leaflet Routing Machine -->
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css"
        />
        <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>

        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          .leaflet-routing-container {
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${coords[0]}, ${coords[1]}], 16); //  zoomed in

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          var marker = L.marker([${coords[0]}, ${coords[1]}]).addTo(map)
            .bindPopup('${safePopupTitle}').openPopup();



          // 🧭 Try to get user location
          map.locate({ setView: false, maxZoom: 18 });

          map.on('locationfound', function(e) {
            var userLatLng = e.latlng;
            L.marker(userLatLng).addTo(map).bindPopup('You are here').openPopup();

            // Draw route from user to evacuation center
            L.Routing.control({
              waypoints: [
                L.latLng(userLatLng.lat, userLatLng.lng),
                L.latLng(${coords[0]}, ${coords[1]})
              ],
              lineOptions: {
                styles: [{ color: '#0060FF', weight: 4 }]
              },
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: true,
              showAlternatives: false
            }).addTo(map);
          });

          map.on('locationerror', function() {
            console.log('Could not get user location');
          });
        </script>
      </body>
    </html>
  `
    : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Image Slider */}
      <FlatList
        data={data}
        renderItem={renderLocation}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        ref={flatListRef}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />

      {/* Ellipsis indicator */}
      <View style={styles.ellipsis}>
        {data.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.activeDot]}
          />
        ))}
      </View>

      {/* Status Row */}
      <View style={styles.statusRow}>
        <Text style={styles.statusTag}>Open</Text>
        <View style={styles.capacityRow}>
          {/* <Ionicons name='people' size={16} color='#0060FF' />
          <Text style={styles.capacityText}>
            {currentLocation.capacity ?? "N/A"} Capacity
          </Text> */}
        </View>
      </View>

      {/* Title + Address */}
      <Text style={styles.header}>
        {activeTab === "evacuationCenter"
          ? currentLocation.evacName ?? "No name"
          : currentLocation.pickupName ?? "No name"}
      </Text>

      <Text style={styles.address}>
        {activeTab === "evacuationCenter"
          ? currentLocation.evacAddress
          : currentLocation.pickupAddress}
      </Text>

      {/* 📞 Call Row */}
      <View style={styles.phoneRow}>
        <TouchableOpacity
          onPress={handleCall}
          disabled={!phoneNumber}
          style={styles.iconCircle}
        >
          <Ionicons
            name='call'
            size={18}
            color={phoneNumber ? "#0060FF" : "#999"}
          />
        </TouchableOpacity>

        <Text style={styles.phoneText}>{phoneNumber || "No Number"}</Text>
      </View>

      {/* 🧭 Navigate Row */}
      <View style={styles.navigateRow}>
        <TouchableOpacity onPress={handleMap} style={styles.iconCircle}>
          <Ionicons name='navigate' size={20} color='#0060FF' />
        </TouchableOpacity>

        <Text style={styles.navigateText}>How far am I from here?</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("evacuationCenter")}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "evacuationCenter" && styles.activeTabText,
            ]}
          >
            Evacuation Centers
          </Text>
          {activeTab === "evacuationCenter" && (
            <View style={styles.activeLine} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("pickupLocations")}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pickupLocations" && styles.activeTabText,
            ]}
          >
            Pickup Locations
          </Text>
          {activeTab === "pickupLocations" && (
            <View style={styles.activeLine} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {currentLocation.gallery?.length > 0 && (
        <View style={styles.gallery}>
          {currentLocation.gallery.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
          ))}
        </View>
      )}

      {/* Map Modal */}
      <Modal visible={mapVisible} animationType='slide'>
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={() => setMapVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons name='close' size={24} color='#000' />
          </Pressable>
          <WebView originWhitelist={["*"]} source={{ html: leafletHtml }} />
        </View>
      </Modal>
    </View>
  );
};

export default PickUpLocation;

const styles = StyleSheet.create({
  frame: {
    width,
    backgroundColor: "#fff",
    height: height * 0.5,
    marginBottom: -100,
  },
  evacImageContainer: {
    position: "relative",
  },
  evacImage: {
    width,
    height: height * 0.7,
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
  },
  ellipsis: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#ccc",
  },
  activeDot: {
    backgroundColor: "#0060FF",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  statusTag: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0060FF",
    backgroundColor: "#F6F5FA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    paddingHorizontal: 16,
  },
  address: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 14,
    color: "#000",
  },
  tabsRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#0060FF",
    fontWeight: "600",
  },
  activeLine: {
    marginTop: 4,
    height: 2,
    backgroundColor: "#0060FF",
    width: "100%",
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },
  galleryImage: {
    width: (width - 48) / 2,
    height: 120,
    borderRadius: 8,
  },
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

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },

  navigateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },

  iconCircle: {
    backgroundColor: "#F0F0F0",
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },

  phoneText: {
    fontSize: 14,
    color: "#000",
  },

  navigateText: {
    fontSize: 14,
  },
});
