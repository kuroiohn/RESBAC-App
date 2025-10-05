import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRealtime } from "../contexts/RealtimeProvider";

const PickupLocationsCard = () => {
  const router = useRouter();
  const { pickupData } = useRealtime();

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  return (
    <>
      {pickupData?.map((pickup) => (
        <TouchableOpacity
          key={pickup.id}
          // 👇 navigate to PickUpLocation and scroll to the selected pickup
          onPress={() =>
            router.push({
              pathname: "/pickUpLocations",
              params: {
                selectedId: pickup.id,
                // optional: activeTab if you want it to open on pickup tab
                tab: "pickupLocations",
              },
            })
          }
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
              {/* Image + status overlay */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: pickup.pickupImage }}
                  style={styles.image}
                  resizeMode='cover'
                />
                <View style={styles.statusOverlay}>
                  <Text style={styles.statusTag}>Available</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.contentSection}>
                <Text
                  style={styles.header}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >
                  {pickup.pickupName}
                </Text>

                <View style={styles.addressAndButtonsRow}>
                  {/* Address */}
                  <View style={styles.addressContainer}>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode='tail'
                      style={styles.subtext}
                    >
                      {pickup.pickupAddress}
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View style={styles.buttonsRow}>
                    {/* 📞 Call */}
                    <TouchableOpacity
                      onPress={() => handleCall(pickup.pickupContact)}
                      style={styles.iconCircle}
                    >
                      <Ionicons
                        name='call'
                        size={16}
                        color={pickup.pickupContact ? "#0060FF" : "#999"}
                      />
                    </TouchableOpacity>

                    {/* 🧭 Navigate */}
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/pickUpLocations",
                          params: {
                            selectedId: pickup.id,
                            tab: "pickupLocations",
                            showMap: Date.now(), // 👈 unique value each time!
                          },
                        })
                      }
                      style={styles.iconCircle}
                    >
                      <Ionicons name='navigate' size={18} color='#0060FF' />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default PickupLocationsCard;

const styles = StyleSheet.create({
  borderWrapper: {
    borderRadius: 12,
    padding: 1,
    marginVertical: 0,
    width: 300,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingBottom: 10,
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
  },
  contentSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    alignItems: "flex-start",
  },
  header: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
    paddingHorizontal: 5,
  },
  addressAndButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 5,
    gap: 8,
  },
  addressContainer: {
    flex: 1,
  },
  subtext: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    backgroundColor: "#F0F0F0",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
});
