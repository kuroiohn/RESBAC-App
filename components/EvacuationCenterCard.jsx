import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const EvacuationCenterCard = ({ style }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push("/pickUpLocations");
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={style}>
      {/* Card with gradient border */}
      <LinearGradient
        colors={["#0060FF", "rgba(0, 58, 153, 0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.borderWrapper}
      >
        <View style={styles.innerCard}>
          <Image
            source={require("../assets/evac-center-card.png")}
            style={styles.image}
            resizeMode='cover'
          />
        </View>
      </LinearGradient>

      {/* Text outside the card */}
      <View style={styles.textSection}>
        <Text style={styles.header}>Evacuation Centers</Text>
        <Text style={styles.subtext}>
          Available evacuation centers around your barangay.
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default EvacuationCenterCard;

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
