import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Phone } from "lucide-react-native";
import { useRealtime } from "../contexts/RealtimeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

export default function RescuerCard() {
  const { emerPData } = useRealtime();
  const db = useSQLiteContext()
  const [local,setLocal] = useState([])

  const loadUsers = async () => {
    try {
      const results = await db.getAllAsync(`select * from rescuers`);
      setLocal(results)
    } catch (error){
      console.error("Error in fetching from local offline storage rescuers:", error);
    }
  }
  console.log("SQLite DB instance:", db);

  const deleteSqlite = async () =>{
    await db.runAsync('delete from rescuers')
  }

  useEffect(() => {
    if (!db || !emerPData) return;

    const insertData = async () => {
      try {
        await db.runAsync('delete from rescuers')

        for (const item of emerPData) {
          // Check if the row exists
          const existing = await db.getAllAsync(
            `SELECT id FROM rescuers WHERE emerPName = ?`,
            [item.emerPName]
          );

          if (existing.length > 0) {
            // Update existing row
            await db.runAsync(
              `UPDATE rescuers SET created_at = ?, emerPNumber = ?, emerPRole = ?, emerPBrgy = ?, emerPMessLink = ?, emerPImage = ?  WHERE emerPName = ?`,
              [item.emerPName, item.created_at, item.emerPNumber, item.emerPRole,item.emerPBrgy, item.emerPMessLink, item.emerPImage]
            );
          } else {
            // Insert new row
            await db.runAsync(
              `INSERT INTO rescuers (emerPName, created_at, emerPNumber, emerPRole, emerPBrgy, emerPMessLink, emerPImage) VALUES (?,?,?,?,?,?,?)`,
              [item.emerPName, item.created_at, item.emerPNumber, item.emerPRole,item.emerPBrgy, item.emerPMessLink, item.emerPImage]
            );
          }
        }

        const results = await db.getAllAsync(`SELECT * FROM rescuers`);
        console.log("Local DB rows:", results);
        setLocal(results);
      } catch (error) {
        console.error("SQLite insert error:", error);
      }
    };

    insertData();
  }, [db, emerPData]);

  useEffect(()=> {
    // deleteSqlite()
    loadUsers()
  },[])

  const handleContactBtn = async (number) => {
    if (number) {
      await Linking.openURL(`tel:${number}`);
    }
  };

  const handleMsgBtn = async (link) => {
    if (link) {
      const splitLink = link.split("/");
      const username = splitLink.slice(3).join("/");
      await Linking.openURL(`https://m.me/${username}`);
    }
  };

  const renderData = emerPData?.length ? emerPData : local;

  return (
    <>
      {renderData?.map((emerP) => (
        <View key={emerP.id} style={styles.borderWrapper}>
          <LinearGradient
            colors={["#0060FF", "rgba(0, 96, 255, 0)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.card}>
              {renderData === local &&
                <Text>Local</Text>}
              {/* Top Row: Image + Info */}
              <View style={styles.topRow}>
                <Image
                  source={
                    emerP.emerPImage
                      ? { uri: emerP.emerPImage }
                      : require("../assets/icon.png") // 👈 placeholder
                  }
                  style={styles.profileImage}
                  resizeMode='cover'
                />

                <View style={styles.infoSection}>
                  <Text
                    style={styles.name}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {emerP.emerPName}
                  </Text>
                  <Text style={styles.position}>
                    {emerP.emerPRole || "No role specified"}
                  </Text>
                  <Text style={styles.barangay}>
                    {emerP.emerPBrgy || "No barangay info"}
                  </Text>
                </View>
              </View>

              {/* Bottom: Buttons (Same Row) */}
              <View style={styles.buttonsRow}>
                {/* 📞 Call Button with number */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleContactBtn(emerP.emerPNumber)}
                  style={[styles.callButton, { flex: 1 }]}
                >
                  <Ionicons
                    name='call'
                    size={16}
                    color='#fff'
                    style={{ marginRight: 6 }}
                  />

                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>

                {/* 💬 Message Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleMsgBtn(emerP.emerPMessLink)}
                  style={[styles.messageButton, { flex: 1 }]}
                >
                  <Image
                    source={require("../assets/messenger-icon.png")}
                    style={{ width: 16, height: 16, marginRight: 6 }}
                  />
                  <Text style={styles.messageText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  borderWrapper: {
    borderRadius: 14,
    padding: 1,
    width: 300,
    marginRight: 16,
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 14,
    padding: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // 👈 circle
    backgroundColor: "#e5e7eb",
    marginRight: 12,
  },
  infoSection: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
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
  },

  buttonsColumn: {
    flexDirection: "column",
    gap: 8,
    padding: 12,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0060FF",
    borderRadius: 8,
    paddingVertical: 10,
  },
  callText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  messageText: {
    color: "#0060FF",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
