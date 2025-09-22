import { ScrollView, StyleSheet, Image, View, Pressable } from "react-native";

import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import { useEffect, useState } from "react";
import { Link } from "expo-router";

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

const EmergencyGuideContent = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const {user} = useUser()
  
  useEffect(() => {
    const getSession = async () => {
      const {data} = await supabase.auth.getSession()
          console.log("Initial session:", data.session); 
          console.log("Initial user:", user); 
      setSession(data.session)
    }
    getSession()

    const mountSignOut = async () => {
      await supabase.auth.signOut()
      console.log("Logged out");
    }

    if (!user) mountSignOut()

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
      clearTimeout(timer)
      authListener.subscription.unsubscribe();
    }
  }, []);

  if (loading) {
    return <ThemedLoader />;
  }

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
        {
          (!session) && 
          (
            <>
              <ThemedText style={styles.textLeft}>Alerts</ThemedText>
              <AlertCard />
            </>
        )}
          
        

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
    width: 125,
    height: 150,
    resizeMode: "contain",
    paddingHorizontal: 5,
    marginBottom: -15,
  },
});
