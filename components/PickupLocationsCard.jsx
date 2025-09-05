import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../contexts/supabaseClient";


const PickupLocationsCard = ({ style }) => {
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
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={style}>
      {/* Card with gradient border */}
        {
          pickupData?.map(pickup => (
            <View key={pickup.id}>
              <LinearGradient
                colors={["#0060FF", "rgba(0, 58, 153, 0)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.borderWrapper}
              >
                <View style={styles.innerCard}>
                  <Image
                    source={{uri: pickup.pickupImage}}
                    style={styles.image}
                    resizeMode='cover'
                  />
                </View>
              </LinearGradient>

              {/* Text outside the card */}
              <View style={styles.textSection}>
                <Text style={styles.header}>{pickup.pickupName}</Text>
                <Text style={styles.subtext}>
                  {pickup.pickupAddress}
                </Text>
              </View>
            </View>
          ))
        }
      
    </TouchableOpacity>
  );
};

export default PickupLocationsCard;

const styles = StyleSheet.create({
  borderWrapper: {
    width: 260,
    padding: 1, // thin gradient stroke
    borderRadius: 12,
    marginBottom: 8,
  },
  innerCard: {
    backgroundColor: "#fff",
    borderRadius: 11,
    overflow: "hidden",

    // subtle shadow (iOS + Android)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 11,
  },
  textSection: {
    marginTop: 8,
    paddingHorizontal: 4,
    width: 260, // ensures text aligns with card/image
  },
  header: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  subtext: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
});
