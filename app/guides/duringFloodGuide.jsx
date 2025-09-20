import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // nice icon set
import SgDuringFlood from "../../assets/sg-during-flood.png";

export default function DuringFloodGuide() {
  const steps = [
    {
      icon: "radio",
      title: "Stay Informed",
      text: "Monitor barangay alerts and warnings via RESBAC, radio, or official LGU channels.\nBe aware of the current alert level.",
    },
    {
      icon: "exit-run",
      title: "Evacuate When Told",
      text: "If advised to evacuate, leave immediately and proceed to your assigned evacuation center.\nFollow pickup routes if you can’t evacuate on your own.",
    },
    {
      icon: "waves",
      title: "Avoid Floodwaters",
      text: "Do not walk, swim, or drive through moving water. Just 6 inches can knock a person down, and 1 foot can sweep away a car.",
    },
    {
      icon: "power-plug-off",
      title: "Turn Off Utilities",
      text: "If safe, turn off electricity and gas to prevent fires or electrocution.",
    },
    {
      icon: "bag-personal",
      title: "Keep Emergency Supplies Nearby",
      text: "Have a go-bag ready with water, food, flashlight, batteries, medicine, and identification.",
    },
    {
      icon: "account-group",
      title: "Check on Vulnerable Family Members",
      text: "Prioritize helping children, the elderly, pregnant women, and PWDs to evacuate.",
    },
    {
      icon: "flash-alert",
      title: "Avoid Using Appliances or Electronics",
      text: "Do not use wet electrical devices.\nIf your house is flooded, stay away from plugged-in equipment.",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Expo-router header */}
      <Stack.Screen
        options={{ title: "Guides During Flood", headerBackTitle: "Back" }}
      />

      {/* Top Banner */}
      <Image source={SgDuringFlood} style={styles.floodImage} />

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
  floodImage: {
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android shadow
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
