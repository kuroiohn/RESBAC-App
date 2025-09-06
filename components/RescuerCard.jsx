import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Phone, MessageCircle } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import supabase from "../contexts/supabaseClient";

export default function RescuerCard() {
  const queryClient = useQueryClient();
  const [rightHeight, setRightHeight] = useState(0);

  // reads from supabase
  const fetchContact = async () => {
    const { data, error } = await supabase.from("emergencyPersons").select();

    if (error) {
      console.error("Fetch error in supabase emerP: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };
  // use data here to map the values and read
  const { data: emerPData, error: emerPError } = useQuery({
    queryKey: ["emergencyPersons"],
    queryFn: fetchContact,
  });
  if (emerPError) {
    console.error("Error in query of emergency persons table: ", emerPError);
  }

  // subscribe to realtime
  useEffect(() => {
    const emerPChannnel = supabase
      .channel("emerP-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergencyPersons" },
        (payload) => {
          console.log("Realtime change received:", payload);

          // Ask react-query to refetch alerts when a row is inserted/updated/deleted
          queryClient.invalidateQueries(["emergencyPersons"]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(emerPChannnel);
    };
  }, [queryClient]);

  const handleContactBtn = async (number) => {
    const url = `tel:${number}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        "Error in Rescuer Card",
        "Dialer not supported on this device!"
      );
    }
  };

  const handleMsgBtn = async (link) => {
    const splitLink = link.split("/");
    const username = splitLink.slice(3).join("/");
    console.log("Username:", username);

    const supported = await Linking.canOpenURL(`https://m.me/${username}`);

    if (supported) {
      await Linking.openURL(`https://m.me/${username}`);
    } else {
      Alert.alert("Error in Rescuer Card", "Device cannot open link");
    }
  };

  return (
    <>
      {emerPData?.map((emerP) => (
        <LinearGradient
          key={emerP.id}
          colors={["#0060FF", "rgba(0, 96, 255, 0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.borderWrapper}
        >
          <View style={styles.card}>
            <View style={styles.row}>
              {/* Left image */}
              <Image
                source={{ uri: emerP.emerPImage }}
                style={[styles.profileImage, { height: rightHeight }]}
                resizeMode='cover'
              />

              {/* Right column */}
              <View
                style={styles.rightColumn}
                onLayout={(event) =>
                  setRightHeight(event.nativeEvent.layout.height)
                }
              >
                <Text style={styles.name}>{emerP.emerPName}</Text>
                <Text style={styles.position}>{emerP.emerPRole}</Text>
                <Text style={styles.barangay}>{emerP.emerPBrgy}</Text>

                <LinearGradient
                  colors={["#0060FF", "#003A99"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.callButton}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleContactBtn(emerP.emerPNumber)}
                    style={styles.callBtnContent}
                  >
                    <Phone color='#fff' size={16} style={{ marginRight: 4 }} />
                    <Text style={styles.callText}>
                      Call {emerP.emerPNumber}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>

                <TouchableOpacity
                  style={styles.messageButton}
                  activeOpacity={0.7}
                  onPress={() => handleMsgBtn(emerP.emerPMessLink)}
                >
                  <Image
                    source={require("../assets/messenger-icon.png")}
                    style={{ width: 16, height: 16, marginRight: 4 }}
                  />
                  <Text style={styles.messageText}>Click here to message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  borderWrapper: {
    borderRadius: 12,
    padding: 1,
    marginVertical: 6,
    width: 320, // smaller width for horizontal scroll
    marginRight: 12,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.25,
    shadowRadius: 0.5,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  profileImage: {
    width: 120, //
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  rightColumn: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0060FF",
    marginBottom: 2,
  },
  position: {
    fontSize: 12,
    color: "#1f2937",
    marginBottom: 2,
  },
  barangay: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  callButton: {
    borderRadius: 6,
    marginBottom: 6,
  },
  callBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 6,
  },
  callText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 0,
    borderColor: "#0060FF",
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.25,
    shadowRadius: 0.5,
    elevation: 2,
  },
  messageText: {
    color: "#0060FF",
    fontWeight: "600",
    fontSize: 12,
  },
});
