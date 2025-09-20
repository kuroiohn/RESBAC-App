import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SgDuringFire from "../../assets/sg-during-fire.png";

export default function DuringFireGuide() {
  const steps = [
    {
      icon: "alarm-light",
      title: "Sound the Alarm",
      text: 'Alert everyone in the building immediately. Yell "Fire!" loudly and continuously. If available, activate the building\'s fire alarm system.',
    },
    {
      icon: "exit-run",
      title: "Evacuate Immediately",
      text: "Do not try to gather belongings. Get out of the building quickly and safely. Follow your escape plan. Crawl low under smoke to avoid inhaling toxic fumes.",
    },
    {
      icon: "fire",
      title: '"Stop, Drop, and Roll"',
      text: "If your clothes catch fire, do not run. Stop immediately, drop to the ground, and cover your face with your hands. Roll until the flames are extinguished.",
    },
    {
      icon: "door",
      title: "Test Doors Before Opening",
      text: "Feel the door with the back of your hand. If it's hot or smoke is visible, do not open it. Find another route. If cool, open slowly while bracing yourself.",
    },
    {
      icon: "map-marker-check",
      title: "Go to Your Designated Meeting Point",
      text: "Once outside, proceed to your pre-determined safe meeting place away from the building. This ensures everyone is accounted for.",
    },
    {
      icon: "phone",
      title: "Call Emergency Services",
      text: "From a safe location, call 911 (or your local number). Provide your exact address and describe the situation clearly. Do not re-enter the building.",
    },
    {
      icon: "account-group",
      title: "Stay with Your Group",
      text: "Remain with your family or group at the meeting point until responders arrive. Do not go back inside for pets or belongings.",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Expo-router header */}
      <Stack.Screen
        options={{ title: "Guides During Fire", headerBackTitle: "Back" }}
      />

      {/* Top Banner */}
      <Image source={SgDuringFire} style={styles.fireImage} />

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
  fireImage: {
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
