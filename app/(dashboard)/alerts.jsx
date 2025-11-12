import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "../../components/ThemedText";
import AlertCard from "../../components/AlertCard";
import { useRealtime } from "../../contexts/RealtimeProvider";

const AlertsScreen = () => {
  const { alertsData } = useRealtime(); // comes from your RealtimeProvider

  const hasAlerts =
    alertsData && alertsData.some((alert) => alert.isActive === true);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>🚨 No Active Alerts</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up. Stay alert for future announcements.
      </Text>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => console.log("Manually refresh alerts")}
      >
        <Ionicons name='refresh' size={18} color='#0060ff' />
        <Text style={styles.refreshText}>Check Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {!hasAlerts ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.sectionLabel}>Active Alerts</ThemedText>
          <AlertCard />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    paddingTop: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#d9534f",
  },
  subtitle: {
    marginTop: 6,
    color: "#555",
    fontSize: 14,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 10,
    textAlign: "left", //
    alignSelf: "flex-start", //
    marginLeft: 20, //
  },

  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 80,
  },

  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyImage: {
    width: 160,
    height: 160,
    marginBottom: 10,
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#d9534f",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#eaf2ff",
    borderRadius: 8,
  },
  refreshText: {
    color: "#0060ff",
    fontWeight: "500",
    marginLeft: 6,
  },
});

export default AlertsScreen;
