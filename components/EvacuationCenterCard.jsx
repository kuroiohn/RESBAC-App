import { useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../contexts/supabaseClient";
import { useRealtime } from "../contexts/RealtimeProvider";

const EvacuationCenterCard = ({ evac, style, onPress }) => {
  const router = useRouter();
  const {evacData} = useRealtime()

  const handlePress = () => {
    router.push("/pickUpLocations");
  };

  return (
    <>
      {evacData?.map((evac) => (
        <TouchableOpacity
          key={evac.id}
          onPress={() => router.push("/pickUpLocations")}
          activeOpacity={0.9}
          style={{ marginRight: 16 }}
        >
          <LinearGradient
            colors={["#0060FF", "rgba(0,96,255,0)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.borderWrapper}
          >
            <View style={styles.card}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: evac.evacImage }}
                  style={styles.image}
                  resizeMode='cover'
                />

                {/* Status overlay */}
                <View style={styles.statusOverlay}>
                  <Text style={styles.statusTag}>Open</Text>
                </View>
              </View>

              <View style={styles.contentSection}>
                <Text style={styles.header}>{evac.evacName}</Text>

                <View style={styles.addressRow}>
                  {/*<MaterialIcons
                    name='location-pin'
                    size={18}
                    color='#0060FF'
                    style={styles.locationIcon}
                  /> */}
                  <Text style={styles.subtext}>{evac.evacAddress}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default EvacuationCenterCard;

const styles = StyleSheet.create({
  borderWrapper: {
    borderRadius: 12,
    padding: 1,
    marginVertical: 0,
    width: 300, // match your card width
    marginRight: 0,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingBottom: 10,

    // shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.25,
    shadowRadius: 0.5,
    elevation: 3,
  },
  imageWrapper: {
    padding: 8,
    position: "relative",
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
    backgroundColor: "#F6F5FA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  header: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 0,
    paddingHorizontal: 5,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 5,
  },
  locationIcon: {
    marginTop: 2,
    width: 18,
  },
  subtext: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
});
