import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import supabase from "../contexts/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "../contexts/RealtimeProvider";
import { BellOff } from "lucide-react-native";
import { Megaphone, ExternalLink } from "lucide-react-native";
import { useSQLiteContext } from "expo-sqlite";

const AlertCard = ({ alertLevel = 1 }) => {
  const queryClient = useQueryClient();
  const [time, setTime] = useState(new Date()); //NOTE - not used
  const { alertsData } = useRealtime();
  const db = useSQLiteContext();
  const [local, setLocal] = useState([]);

  const loadUsers = async () => {
    try {
      const results = await db.getAllAsync(`select * from alerts`);
      setLocal(results);
    } catch (error) {
      console.error("Error in fetching from local offline storage:", error);
    }
  };
  // console.log("SQLite DB instance:", db);

  const deleteSqlite = async () => {
    await db.runAsync("delete from alerts");
  };

  useEffect(() => {
    if (!db || !alertsData) return;

    const insertData = async () => {
      try {
        await db.runAsync("delete from alerts");

        for (const item of alertsData) {
          const activeInt = item.isActive ? 1 : 0;
          await db.runAsync(
            `INSERT INTO alerts (alertTitle, created_at, alertDescription, isActive, alertLocation, alertType, riverLevel, alertLink) VALUES (?,?,?,?,?,?,?,?)`,
            [
              item.alertTitle,
              item.created_at,
              item.alertDescription,
              activeInt,
              item.alertLocation,
              item.alertType,
              item.riverLevel,
              item.alertLink,
            ]
          );
        }

        const results = await db.getAllAsync(`SELECT * FROM alerts`);
        console.log("Local DB rows:", results);
        setLocal(
          results.map((row) => ({
            ...row,
            isActive: row.isActive === 1,
          }))
        );
      } catch (error) {
        console.error("SQLite insert error:", error);
      }
    };

    insertData();
  }, [db, alertsData]);

  useEffect(() => {
    // deleteSqlite()
    loadUsers();
  }, []);

  const renderData = alertsData?.length ? alertsData : local;

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = (timestamp) => {
    const cleanDate = timestamp.substring(0, 19).replace(" ", "T");
    const date = new Date(timestamp);

    if (!timestamp || isNaN(date)) return "No time!";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      //timeZone: 'UTC'
    });
  };

  const formattedDate = (timestamp) => {
    const cleanDate = timestamp.substring(0, 19).replace(" ", "T");
    const date = new Date(timestamp);

    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  // added august 24
  const formatTitle = (title) => {
    if (!title) return "";

    // If the whole title is 19 chars or less → show on one line
    if (title.length <= 19) return title;

    // Otherwise split by spaces
    const words = title.split(" ");

    // If the first word itself exceeds 19 chars, force-break at 19
    if (words[0].length > 19) {
      return (
        words[0].slice(0, 12) +
        "\n" +
        words[0].slice(12) +
        " " +
        words.slice(1).join(" ")
      );
    }

    // Otherwise → first word on line 1, rest on line 2+
    return words[0] + "\n" + words.slice(1).join(" ");
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "flood":
        return require("../assets/floodIcon.png");
      case "fire":
        return require("../assets/fireIcon.png");
      case "earthquake":
        return require("../assets/EarthquakeIcon.png");
      case "announcement":
        return "icon";
    }
  };

  return (
    <>
      {renderData?.some((alert) => alert.isActive) ? (
        renderData
          ?.sort((a, b) => new Date(b.activatedat) - new Date(a.activatedat))
          .map(
            (alert) =>
              alert.isActive && (
                <LinearGradient
                  key={alert.id}
                  colors={["#0060FF", "rgba(0, 58, 153, 0)"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.borderWrapper}
                >
                  <View style={styles.innerCard}>
                    {renderData === local && <Text>Offline Data</Text>}
                    {/* Top right date + icon */}
                    <View style={styles.dateRow}>
                      <Text style={styles.dateText}>
                        {formattedDate(alert.activatedat)}
                      </Text>
                      <Ionicons
                        name='calendar-outline'
                        size={18}
                        color='#333'
                        style={{ marginLeft: 6 }}
                      />
                    </View>

                    {/* Image + Info Row */}
                    <View style={styles.topRow}>
                      {alert.alertType === "announcement" ? (
                        <View style={styles.iconContainer}>
                          <Megaphone
                            size={40}
                            color='#0060FF'
                            strokeWidth={1.5}
                          />
                        </View>
                      ) : (
                        <Image
                          source={getAlertIcon(alert.alertType)}
                          style={styles.image}
                        />
                      )}

                      <View style={styles.statusColumn}>
                        <Text style={styles.alertLevel}>
                          {formatTitle(alert.alertTitle)}
                        </Text>

                        {/*<Text style={styles.timeText}>{formattedTime}</Text>*/}
                        <Text style={styles.timeText}>
                          {formattedTime(alert.activatedat)}
                          {/* {formattedTime(alert.created_at)} */}
                        </Text>
                        {alert.alertType === "fire" && alert.alertLocation && (
                          <Text style={styles.meterText}>
                            Near {alert.alertLocation}
                          </Text>
                        )}

                        {alert.alertType === "flood" && alert.riverLevel && (
                          <Text style={styles.meterText}>
                            {alert.riverLevel} meters
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Message */}
                    <Text style={styles.message}>{alert.alertDescription}</Text>

                    {/* View Post Link */}
                    {alert.alertLink && (
                      <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => Linking.openURL(alert.alertLink)}
                      >
                        <Text style={styles.linkText}>View Post</Text>
                        <ExternalLink size={14} color='#0060FF' />
                      </TouchableOpacity>
                    )}
                  </View>
                </LinearGradient>
              )
          )
      ) : (
        <LinearGradient
          colors={["#0060ff", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.card}>
            {/* Row layout: icon left, text right */}
            <BellOff size={28} color='#0060ff' style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.noAlertTitle}>No Active Alerts</Text>
              <Text style={styles.noAlertSubtitle}>
                You're all caught up. Stay tuned for updates.
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}
    </>
  );
};

export default AlertCard;

const styles = StyleSheet.create({
  borderWrapper: {
    width: "95%",
    padding: 1, // para sa stroke
    borderRadius: 12,
    marginBottom: 10, // adds space between stacked alerts
    backgroundColor: "white",
  },
  innerCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    position: "relative",

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,

    // Shadow for Android
    elevation: 2,
  },

  dateRow: {
    position: "absolute",
    top: 10,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#333",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    paddingTop: -10,
  },
  image: {
    width: 66,
    height: 66,
    marginRight: 16,
    borderRadius: 10,
  },
  iconContainer: {
    width: 66,
    height: 66,
    marginRight: 16,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  linkText: {
    fontSize: 13,
    color: "#0060FF",
    fontWeight: "500",
  },
  statusColumn: {
    justifyContent: "space-between",
  },
  alertLevel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#161616",
  },
  timeText: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  meterText: {
    fontSize: 14,
    color: "#00796B",
    marginTop: 4,
  },
  message: {
    marginTop: 10,
    fontSize: 13,
    color: "#6b6b6b",
    lineHeight: 17,
  },
  gradientBorder: {
    width: "95%",
    borderRadius: 12,
    padding: 1.5, // gradient border thickness
  },
  card: {
    flexDirection: "row", // ✅ makes icon + text side by side
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    alignItems: "center", // vertically center icon with text

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, // lighter, professional look
    shadowRadius: 4,

    // Android shadow
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1, // take remaining width
  },
  noAlertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  noAlertSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
