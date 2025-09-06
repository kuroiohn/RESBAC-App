import { ScrollView, StyleSheet, Image, View } from "react-native";

import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";

// asset imports
import DuringFlood from "../../assets/DuringFlood.png";
import DuringFire from "../../assets/DuringFire.png";
import Earthquake from "../../assets/Earthquake.png";

import Water from "../../assets/Water.png";
import Flashlight from "../../assets/Flashlight.png";
import Medications from "../../assets/Medications.png";
import Identification from "../../assets/Identification.png";
import Food from "../../assets/Food.png";
import Clothing from "../../assets/Clothing.png";
import Money from "../../assets/Money.png";
import Batteries from "../../assets/Batteries.png";

import RescuerCard from "../../components/RescuerCard";

const EmergencyGuideContent = () => {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <ThemedView style={styles.container}>
        {/* What to Pack */}
        <ThemedText style={styles.textBlue}>
          What to pack in a Go-Bag?
        </ThemedText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          <Image source={Water} style={styles.itemImage} />
          <Image source={Flashlight} style={styles.itemImage} />
          <Image source={Medications} style={styles.itemImage} />
          <Image source={Identification} style={styles.itemImage} />
          <Image source={Food} style={styles.itemImage} />
          <Image source={Clothing} style={styles.itemImage} />
          <Image source={Money} style={styles.itemImage} />
          <Image source={Batteries} style={styles.itemImage} />
        </ScrollView>

        {/* Emergency Guides */}
        <ThemedText style={[styles.textLeft]}>Emergency Guides</ThemedText>

        <View style={styles.row}>
          <Image source={DuringFlood} style={styles.guideImage} />
          <Image source={DuringFire} style={styles.guideImage} />
          <Image source={Earthquake} style={styles.guideImage} />
        </View>

        <ThemedText style={[styles.textLeft]}>Rescuers</ThemedText>
        {/* Rescuer Card at the bottom */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 4 }}
        >
          <RescuerCard />
        </ScrollView>
      </ThemedView>
    </ScrollView>
  );
};

export default EmergencyGuideContent;

const styles = StyleSheet.create({
  pageContainer: {
    paddingVertical: 20,
    paddingHorizontal: 19, // 👈 consistent global padding
    backgroundColor: "#fafafa",
  },
  container: {
    flex: 1,
    alignItems: "flex-start", // 👈 align children to left
  },
  textLeft: {
    textAlign: "left",
    alignSelf: "stretch",
    marginLeft: 10,
    fontSize: 19,
    marginTop: 10,
    marginBottom: 5,
  },
  textBlue: {
    textAlign: "left",
    fontSize: 15,
    color: "#0060ff",
    fontWeight: "600",
    marginLeft: 10,
  },
  horizontalList: {
    paddingVertical: 8,
    marginLeft: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    marginRight: 12,
    resizeMode: "contain",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  guideImage: {
    flex: 1,
    height: 150,
    resizeMode: "contain",
    marginBottom: -15,
  },
});
