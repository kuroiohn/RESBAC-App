import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import supabase from "../contexts/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlerts } from "../contexts/RealtimeProvider";

const AlertCard = ({ alertLevel = 1 }) => {
  const queryClient = useQueryClient();
  const [time, setTime] = useState(new Date()); //NOTE - not used

  const alertData = useAlerts()

  // // reads from supabase
  // const fetchData = async () => {
  //   const { data, error } = await supabase.from("alerts").select();

  //   if (error) {
  //     console.error("Fetch error in supabase alert card: ", error);
  //   }
  //   console.log("Successful fetch", data);
  //   return data;
  // };
  // const {
  //   data: alertData,
  //   isPending,
  //   isError,
  //   error,
  //   refetch,
  // } = useQuery({
  //   queryKey: ["alerts"],
  //   queryFn: fetchData,
  // });

  // // Subscribe to realtime changes
  // useEffect(() => {
  //   const channel = supabase
  //     .channel("alerts-changes")
  //     .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "alerts" },
  //       (payload) => {
  //         console.log("Realtime change received:", payload);

  //         // Ask react-query to refetch alerts when a row is inserted/updated/deleted
  //         // queryClient.invalidateQueries(["alerts"]);
  //         queryClient.setQueryData(["alerts"], (oldData) => {
  //           if (!oldData) return [payload.new]; // initial
  //           const index = oldData.findIndex((a) => a.id === payload.new.id);
  //           if (index > -1) oldData[index] = payload.new;
  //           else oldData.push(payload.new);
  //           return [...oldData];
  //         });
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [queryClient]);

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
      second: "2-digit",
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
      year: "numeric",
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

  const getWaterLevel = () => {
    switch (alertLevel) {
      case 1:
        return 15;
      case 2:
        return 17;
      case 3:
        return 18;
      default:
        return "--";
    }
  };

  const waterLevel = getWaterLevel();

  const getAlertIcon = (type) => {
    switch (type) {
      case "Flood":
        return require("../assets/floodIcon.png");
      case "Fire":
        return require("../assets/fireIcon.png");
      case "Earthquake":
        return require("../assets/EarthquakeIcon.png");
      default:
        return require("../assets/storm-cloud.png"); // fallback
    }
  };

  return (
    <>
      {alertData?.map(
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
                {/* Top right date + icon */}
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>
                    {formattedDate(alert.created_at)}
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
                  <Image
                    source={getAlertIcon(alert.alertType)}
                    style={styles.image}
                  />

                  <View style={styles.statusColumn}>
                    <Text style={styles.alertLevel}>
                      {formatTitle(alert.alertTitle)}
                    </Text>

                    {/*<Text style={styles.timeText}>{formattedTime}</Text>*/}
                    <Text style={styles.timeText}>
                      Date: {formattedTime(alert.created_at)}
                    </Text>
                    {alert.alertType == "Fire" && (
                      <Text style={styles.meterText}>
                        Location: {alert.alertLocation}
                      </Text>
                    )}

                    {/* if flooding only */}
                    {alert.alertType === "Flood" && (
                      <Text style={styles.meterText}>
                        Alert {alertLevel} • {waterLevel} meters
                      </Text>
                    )}
                  </View>
                </View>

                {/* Message */}
                <Text style={styles.message}>{alert.alertDescription}</Text>
              </View>
            </LinearGradient>
          )
      )}
    </>
  );
};

export default AlertCard;

const styles = StyleSheet.create({
  borderWrapper: {
    width: "95%",
    padding: 2, // para sa stroke
    borderRadius: 12,
    marginBottom: 10, // adds space between stacked alerts
  },
  innerCard: {
    backgroundColor: "#FAFAFA",
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
    width: 76,
    height: 67,
    marginRight: 16,
    borderRadius: 10,
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
});
