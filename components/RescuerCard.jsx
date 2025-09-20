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
import { useRealtime } from "../contexts/RealtimeProvider";

export default function RescuerCard() {
  const [rightHeight, setRightHeight] = useState(0);

  const {emerPData} = useRealtime()
  
  // const queryClient = useQueryClient();
  // // reads from supabase
  // const fetchContact = async () => {
  //   const { data, error } = await supabase.from("emergencyPersons").select();

  //   if (error) {
  //     console.error("Fetch error in supabase emerP: ", error);
  //   }
  //   console.log("Successful fetch", data);
  //   return data;
  // };
  // // use data here to map the values and read
  // const { data: emerPData, error: emerPError } = useQuery({
  //   queryKey: ["emergencyPersons"],
  //   queryFn: fetchContact,
  // });
  // if (emerPError) {
  //   console.error("Error in query of emergency persons table: ", emerPError);
  // }

  // // subscribe to realtime
  // useEffect(() => {
  //   const emerPChannnel = supabase
  //     .channel("emerP-changes")
  //     .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "emergencyPersons" },
  //       (payload) => {
  //         console.log("Realtime change received:", payload);

  //         // Ask react-query to refetch alerts when a row is inserted/updated/deleted
  //         queryClient.invalidateQueries(["emergencyPersons"]);
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(emerPChannnel);
  //   };
  // }, [queryClient]);

  const handleContactBtn = async (number) => {
    const url = `tel:${number}`;
    // const supported = await Linking.canOpenURL(url);

    await Linking.openURL(url);
    // if (supported) {
    //   await Linking.openURL(url);
    // } else {
    //   Alert.alert(
    //     "Error in Rescuer Card",
    //     "Dialer not supported on this device!"
    //   );
    // }
  };

  const handleMsgBtn = async (link) => {
    const splitLink = link.split("/");
    const username = splitLink.slice(3).join("/");
    console.log("Username:", username);

    // const supported = await Linking.canOpenURL(`https://m.me/${username}`);

    await Linking.openURL(`https://m.me/${username}`);
    // if (supported) {
    //   await Linking.openURL(`https://m.me/${username}`);
    // } else {
    //   Alert.alert("Error in Rescuer Card", "Device cannot open link");
    // }
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

                {/* Call Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleContactBtn(emerP.emerPNumber)}
                >
                  <LinearGradient
                    colors={["#0060FF", "#0040B5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.callButton}
                  >
                    <Phone color='#fff' size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.callText}>Call</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Message Button */}
                <TouchableOpacity
                  style={styles.messageButton}
                  activeOpacity={0.8}
                  onPress={() => handleMsgBtn(emerP.emerPMessLink)}
                >
                  <Image
                    source={require("../assets/messenger-icon.png")}
                    style={{ width: 16, height: 16, marginRight: 6 }}
                  />
                  <Text style={styles.messageText}>Message</Text>
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
    borderRadius: 14,
    padding: 1,
    marginVertical: 0,
    width: 300,
    marginRight: 16,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileImage: {
    width: 90,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  rightColumn: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  position: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 2,
  },
  barangay: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  callText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  messageText: {
    color: "#0060FF",
    fontWeight: "600",
    fontSize: 13,
  },
});
