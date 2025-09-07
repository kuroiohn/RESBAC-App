import {
  ScrollView,
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import supabase from "../../contexts/supabaseClient";

const { width, height } = Dimensions.get("window");

const PickUpLocation = () => {
  const [activeTab, setActiveTab] = useState("evacuationCenter");
  const [activeIndex, setActiveIndex] = useState(0);
  const queryClient = useQueryClient();
  const flatListRef = useRef(null);

  // added to remove header in profile tab
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // reads from supabase
  const fetchEvacData = async () => {
    const { data, error } = await supabase.from("evacuationCenter").select();

    if (error) {
      console.error("Fetch error in supabase pickup: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };

  // use data here to map the values and read
  const { data: evacData, error: evacError } = useQuery({
    queryKey: ["evacuationCenter"],
    queryFn: fetchEvacData,
  });

  // reads from supabase
  const fetchPickupData = async () => {
    const { data, error } = await supabase.from("pickupLocations").select();

    if (error) {
      console.error("Fetch error in supabase pickup: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };
  // use data here to map the values and read
  const { data: pickupData, error: pickupError } = useQuery({
    queryKey: ["pickupLocations"],
    queryFn: fetchPickupData,
  });

  // subscribe to realtime
  useEffect(() => {
    const evacChannel = supabase
      .channel("evac-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "evacuationCenter" },
        (payload) => {
          console.log("Realtime change received:", payload);

          // Ask react-query to refetch alerts when a row is inserted/updated/deleted
          queryClient.invalidateQueries(["evacuationCenter"]);
        }
      )
      .subscribe();

    const pickupChannel = supabase
      .channel("pickup-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pickupLocations" },
        (payload) => {
          console.log("Realtime change received:", payload);

          // Ask react-query to refetch alerts when a row is inserted/updated/deleted
          queryClient.invalidateQueries(["pickupLocations"]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(evacChannel);
      supabase.removeChannel(pickupChannel);
    };
  }, [queryClient]);

  useEffect(() => {
    setActiveIndex(0);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 0, animated: false });
    }
  }, [activeTab]);

  const data = activeTab === "evacuationCenter" ? evacData : pickupData;

  if (!data || data.length === 0) return null;

  const currentLocation = data[activeIndex];

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

        {/* Ellipsis inside the picture at the bottom */}
        <View style={styles.ellipsis}>
          {data.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.activeDot]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: "#fff" }}>
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
          <Ionicons name='people' size={16} color='#0060FF' />
          <Text style={styles.capacityText}>
            {currentLocation.capacity || "N/A"} Capacity
          </Text>
        </View>
      </View>

      {/* Title + Address + Phone */}
      <Text style={styles.header}>
        {activeTab === "evacuationCenter"
          ? currentLocation.evacName
          : currentLocation.pickupName}
      </Text>

      <Text style={styles.address}>
        {activeTab === "evacuationCenter"
          ? currentLocation.evacAddress
          : currentLocation.pickupAddress}
      </Text>

      <View style={styles.phoneRow}>
        <Ionicons name='call' size={16} color='#0060FF' />
        <Text style={styles.phoneText}>
          {currentLocation.phone || "No number"}
        </Text>
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
      {activeTab === "about" ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {activeTab === "evacuationCenter"
              ? "Evacuation Center"
              : "Pickup Location"}
          </Text>

          <Text style={styles.sectionText}>
            {currentLocation.description || "No description provided."}
          </Text>
        </View>
      ) : (
        <View style={styles.gallery}>
          {currentLocation.gallery?.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
          ))}
        </View>
      )}
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
    height: height * 0.5,
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
    width: 8,
    height: 8,
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
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 6,
    gap: 6,
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
  section: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
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
});
