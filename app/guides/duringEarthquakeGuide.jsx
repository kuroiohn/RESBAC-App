import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SgDuringEarthquake from "../../assets/sg-during-earthquake.png";

export default function DuringEarthquakeGuide() {
  const steps = [
    {
      icon: "account-arrow-down",
      title: '"Drop, Cover, and Hold On"',
      text: "Immediately drop to the ground. Take cover under a sturdy desk or table, or against an interior wall. Hold on until the shaking stops. If no shelter is nearby, cover your head and neck with your arms.",
    },
    {
      icon: "home-lock",
      title: "Stay Indoors Until Shaking Stops",
      text: "Do not run outside during the shaking. Most injuries occur when people try to move or exit buildings. Stay put until the earthquake is over.",
    },
    {
      icon: "window-closed",
      title: "Move Away from Windows and Heavy Furniture",
      text: "Avoid areas near windows, mirrors, hanging objects, and tall, unsecured furniture that could fall and injure you.",
    },
    {
      icon: "map-marker-alert",
      title: "If Outdoors, Find a Clear Spot",
      text: "Move away from buildings, streetlights, utility wires, and anything that could fall. Drop to the ground and cover your head and neck.",
    },
    {
      icon: "car-brake-alert",
      title: "If in a Vehicle, Pull Over Safely",
      text: "If driving, pull over to a clear location away from buildings, trees, overpasses, and utility poles. Stay inside with your seatbelt fastened until the shaking stops.",
    },
    {
      icon: "medical-bag",
      title: "After the Shaking, Check for Injuries and Damage",
      text: "Once the shaking stops, check yourself and others for injuries. Look for structural damage, gas leaks, or fallen power lines. Be prepared for aftershocks.",
    },
    {
      icon: "broadcast",
      title: "Follow Official Instructions",
      text: "Monitor official LGU channels (radio, social media) for updates. Do not re-enter damaged buildings unless deemed safe by authorities.",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Expo-router header */}
      <Stack.Screen
        options={{ title: "Guides During Earthquake", headerBackTitle: "Back" }}
      />

      {/* Top Banner */}
      <Image source={SgDuringEarthquake} style={styles.eqImage} />

      {/* Content */}
      <View style={styles.content}>
        {steps.map((step, index) => (
          <View key={index} style={styles.card}>
            <MaterialCommunityIcons
              name={step.icon}
              size={28}
              color='#0060ff'
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>
                {index + 1}. {step.title}
              </Text>
              <Text style={styles.itemText}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  eqImage: {
    width: "100%",
    height: 300,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "flex-start",

    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },

    // Android shadow
    elevation: 2,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0060ff",
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
