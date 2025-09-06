import { useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../contexts/supabaseClient";
import { MaterialIcons } from "@expo/vector-icons";

const PickupLocationsCard = ({ pickup, style, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push("/pickUpLocations");
  };

  const queryClient = useQueryClient();
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

  console.log("DAta: ", pickupData);

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

  return (
    <>
      {pickupData?.map((pickup) => (
        <TouchableOpacity
          key={pickup.id}
          onPress={() => router.push("/pickUpDetails")} // navigate to details
          activeOpacity={0.9}
          style={{ marginRight: 0 }} // spacing for horizontal scroll
        >
          <View style={[styles.cardWrapper, style]}>
            <View style={styles.innerCard}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: pickup.pickupImage }}
                  style={styles.image}
                  resizeMode='cover'
                />
              </View>

              <View style={styles.contentSection}>
                <View style={styles.topRow}>
                  <Text style={styles.statusTag}>Available</Text>
                </View>
                <Text style={styles.header}>{pickup.pickupName}</Text>

                <View style={styles.addressRow}>
                  <MaterialIcons
                    name='location-pin'
                    size={18}
                    color='#0060FF'
                    style={styles.locationIcon}
                  />
                  <Text style={styles.subtext} numberOfLines={3}>
                    {pickup.pickupAddress}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default PickupLocationsCard;

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 12,
    backgroundColor: "#fff",

    // shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,

    // shadow (Android)
    elevation: 3,
    marginBottom: 15,
  },
  innerCard: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",

    // subtle bottom shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 3,
  },
  imageWrapper: {
    padding: 8,
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 8,
  },
  contentSection: {
    padding: 12,
    alignItems: "flex-start",
  },
  topRow: {
    marginBottom: 6,
  },
  statusTag: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0060FF",
    backgroundColor: "rgba(0, 96, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  header: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationIcon: {
    marginTop: 2,
    width: 18, // keeps text aligned when wrapping
  },
  subtext: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
});
