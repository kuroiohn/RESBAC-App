import {
  ScrollView,
  StyleSheet,
  Image,
  View,
  Pressable,
  Linking,
  TouchableOpacity,
  Platform,
  Text,
} from "react-native";

import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import { useEffect, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";

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
import EvacuationCenterCard from "../EvacuationCenterCard";
import PickupLocationsCard from "../PickupLocationsCard";
import ThemedLoader from "../ThemedLoader";
import AlertCard from "../AlertCard";
import { useUser } from "../../hooks/useUser";
import supabase from "../../contexts/supabaseClient";
import HotlinesCard from "../HotlinesCard";

import RouteMapWebView from "../../components/shared/RouteMapWebView";

const EmergencyGuideContent = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const { user } = useUser();
  const { role } = useLocalSearchParams();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Initial session:", data.session);
      console.log("Initial user:", user);
      setSession(data.session);
    };
    getSession();

    const mountSignOut = async () => {
      await supabase.auth.signOut();
      console.log("Logged out");
    };

    if (role === "guest") mountSignOut();

    // also listen for login/logout changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <ThemedLoader />;
  }

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <ThemedView style={styles.container}>
        <RouteMapWebView
          src={[14.65, 121.1]} // default guest location
          dest={[14.66, 121.12]} // evac center location
          safePopupTitle='Evacuation Center'
        />

        {/* iPhone-style "Send Alert via SMS" card
        {!session && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const phoneNumber = "161";
              const message = "This is an emergency. Please send help!";
              const url = `sms:${phoneNumber}${
                Platform.OS === "ios" ? "&" : "?"
              }body=${encodeURIComponent(message)}`;
              Linking.openURL(url).catch((err) =>
                console.error("Failed to open SMS app:", err)
              );
            }}
            style={styles.iosAlertCard}
          >
            <View style={styles.iosAlertContent}>
              <View style={styles.iosAlertIconWrapper}>
                <View style={styles.iosAlertGradient}>
                  <Text style={styles.iosAlertIcon}>🚨</Text>
                </View>
              </View>
              <View style={styles.iosAlertTextWrapper}>
                <Text style={styles.iosAlertTitle}>Send Emergency Message</Text>
                <Text style={styles.iosAlertSubtitle}>
                  Tap to message emergency services via SMS.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )} */}

        {/* <Spacer height={20} /> */}

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
          <Link href='/guides/duringFloodGuide' asChild>
            <Pressable>
              <Image source={DuringFlood} style={styles.guideImage} />
            </Pressable>
          </Link>

          <Link href='/guides/duringFireGuide' asChild>
            <Pressable>
              <Image source={DuringFire} style={styles.guideImage} />
            </Pressable>
          </Link>

          <Link href='/guides/duringEarthquakeGuide' asChild>
            <Pressable>
              <Image source={Earthquake} style={styles.guideImage} />
            </Pressable>
          </Link>
        </View>

        {/* Alerts + Guide only in initial state */}
        {!session && (
          <>
            <ThemedText style={styles.textLeft}>Alerts</ThemedText>
            <AlertCard />
          </>
        )}

        <ThemedText style={[styles.textLeft]}>Hotlines</ThemedText>
        {/* Rescuer Card at the bottom */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 4 }}
        >
          <HotlinesCard />
        </ScrollView>

        <ThemedText style={[styles.textLeft]}>Rescuers</ThemedText>
        {/* Rescuer Card at the bottom */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 4 }}
        >
          <RescuerCard />
        </ScrollView>

        {/* Evacuation Centers horizontal scroll */}
        <ThemedText style={styles.textLeft}>Evacuation Centers</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
        >
          <EvacuationCenterCard />
        </ScrollView>

        <ThemedText style={styles.textLeft}>Pickup Locations</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
          onPress={() => {
            setActiveTab("pickupLocations");
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: 0,
                animated: true,
              });
            }
          }}
        >
          <PickupLocationsCard />
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
    marginLeft: 5,
    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
  },
  textBlue: {
    textAlign: "left",
    fontSize: 15,
    color: "gray",
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
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  guideImage: {
    width: 110,
    height: 150,
    resizeMode: "contain",
    paddingHorizontal: 5,
    marginBottom: -15,
  },
  iosAlertCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f2f2f2",
  },
  iosAlertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iosAlertIconWrapper: {
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iosAlertGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ff3b30", // solid Apple red
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff3b30",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  iosAlertIcon: {
    fontSize: 22,
  },
  iosAlertTextWrapper: {
    flex: 1,
  },
  iosAlertTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
  iosAlertSubtitle: {
    fontSize: 14,
    color: "#6b6b6b",
    marginTop: 2,
  },
});
