import { View, Text, ImageBackground, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Phone, MessageCircle } from "lucide-react-native";

export default function RescuerCard({
  name = "Sungchan",
  position = "Rescuer",
  barangay = "Barangay Tumana",
  phoneNumber = "09123456789",
}) {
  return (
    <LinearGradient
      colors={["#0060FF", "rgba(0, 58, 153, 0)"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.borderWrapper}
    >
      <ImageBackground source={require("../assets/hbesbg.png")} style={styles.card} imageStyle={styles.backgroundImage}>
        <View style={styles.contentRow}>
          {/* Rescuer Profile */}
          <Image source={require("../assets/sungchanNoBg.png")} style={styles.profileImage} />

          {/* Rescuer Details */}
          <View style={styles.infoWrapper}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.position}>{position}</Text>
            <Text style={styles.barangay}>{barangay}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.callButton]} activeOpacity={0.7}>
            <Phone color="#0060ff" size={18} style={{ marginRight: 6 }} />
            <Text style={styles.callText}>Call {phoneNumber}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.messageButton]} activeOpacity={0.7}>
            <MessageCircle color="#0060FF" size={18} style={{ marginRight: 6 }} />
            <Text style={styles.messageText}>Click here to message</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  borderWrapper: {
    borderRadius: 16,
    padding: 2,
    margin: 8,
    width: "95%",
    marginBottom: 5,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
  },
  backgroundImage: {
    borderRadius: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },
  infoWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  position: {
    fontSize: 14,
    color: "white",
  },
  barangay: {
    fontSize: 14,
    color: "white",
  },
  buttonRow: {
    flexDirection: "column",
    gap: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 0,
  },
  callButton: {
    backgroundColor: "white",
  },
  callText: {
    color: "#0060ff",
    fontSize: 14,
    fontWeight: "600",
  },
  messageButton: {
    borderWidth: 1,
    borderColor: "#0060FF",
    backgroundColor: "#fff",
  },
  messageText: {
    color: "#0060FF",
    fontSize: 14,
    fontWeight: "600",
  },
});