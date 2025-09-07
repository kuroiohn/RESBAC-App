import {
  ScrollView,
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useState, useRef, useEffect, use } from "react";

import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import CallButton from "../../components/CallBtn";
import MarkSafeBtn from "../../components/MarkSafeBtn";
import AlertCard from "../../components/AlertCard";
import EvacuationCenterCard from "../../components/EvacuationCenterCard";
import { useUser } from "../../hooks/useUser";
import supabase from "../../contexts/supabaseClient";
import PickupLocationsCard from "../../components/PickupLocationsCard";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const { user } = useUser();
  const [animating, setAnimating] = useState(false);
  const [callRequested, setCallRequested] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // click handler for evac center
  const handleEvacClick = (evacId) => {
    navigation.navigate("PickUpLocation", {
      tab: "evacuationCenter",
      id: evacId,
    });
  };

  const handlePickupClick = (pickupId) => {
    navigation.navigate("PickUpLocation", {
      tab: "pickupLocations",
      id: pickupId,
    });
  };

  useEffect(() => {
    const userid = user.id;
    // reads from supabase
    const fetchData = async () => {
      // Get the current logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error fetching auth user:", userError);
        throw new Error("No active session / user");
      }

      const { data, error } = await supabase
        .from("user")
        .select("pressedCallBtn")
        .eq("userID", user.id)
        .maybeSingle();

      if (error) {
        console.error("Fetch error in supabase pressedCallBtn: ", error);
      }
      console.log("Successful fetch", data.pressedCallBtn);
      setCallRequested(data.pressedCallBtn);
      return data;
    };

    fetchData();

    const callBtnChannel = supabase
      .channel("pressedCallBtn-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user",
          filter: `userID=eq.${userid}`,
        },
        (payload) => {
          console.log("Change received!", payload);

          if (payload.new?.pressedCallBtn !== undefined) {
            setCallRequested(payload.new.pressedCallBtn);
            console.log("Realtime pressedCall: ", callRequested);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callBtnChannel);
    };
  }, []);

  // pang animate
  const handleAnimationStart = () => {
    setAnimating(true);
    setCallRequested(false);
    fadeAnim.setValue(0); // reset fade each time
  };

  // pang animate
  const handleAnimationFinish = () => {
    setAnimating(false);
    setCallRequested(true);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleCancel = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setAnimating(false);
      setCallRequested(false);
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching auth user: ", userError);
    }

    const { data, error } = await supabase
      .from("user")
      .update({ pressedCallBtn: false })
      .eq("userID", user.id)
      .select();

    console.log("updated call btn:", data, error);

    if (error) {
      console.error("Error in updating call btn", error);
    }
  };

  console.log("Callrequested: ", callRequested);
  console.log("animating: ", animating);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText title={true} style={styles.heading}>
          {callRequested ? "Help is on the way" : "Request Rescue?"}
        </ThemedText>

        {/* Initial state */}
        {!animating && !callRequested && (
          <>
            <ThemedText>Press the button below and help will</ThemedText>
            <ThemedText>reach you shortly.</ThemedText>

            <Spacer />
            <CallButton
              onAnimationStart={handleAnimationStart}
              onAnimationFinish={handleAnimationFinish}
              disabled={callRequested}
            />
            <Spacer />

            <MarkSafeBtn />

            {/* Alerts + Guide only in initial state */}
            <ThemedText style={styles.textLeft}>Alerts</ThemedText>
            <AlertCard />
          </>
        )}

        {/* Animating state */}
        {animating && !callRequested && (
          <>
            <ThemedText style={{ marginTop: 20, fontWeight: "bold" }}>
              Calling for help...
            </ThemedText>
            <Spacer />
            <CallButton
              onAnimationStart={handleAnimationStart}
              onAnimationFinish={handleAnimationFinish}
              disabled={callRequested}
            />
          </>
        )}

        {/* After request */}
        {callRequested && !animating && (
          <Animated.View style={{ alignItems: "center" }}>
            <ThemedText style={{ marginVertical: 10, textAlign: "center" }}>
              Please stand by, or look for a safe {"\n"}
              place to stay until rescue has arrived.
            </ThemedText>
            <Spacer />
            <CallButton
              onAnimationStart={handleAnimationStart}
              onAnimationFinish={handleAnimationFinish}
              disabled={callRequested}
            />
            <Spacer />
            <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            </TouchableOpacity>
            <Spacer />
          </Animated.View>
        )}
        {!animating && callRequested && <MarkSafeBtn />}
      </ThemedView>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 33,
    textAlign: "center",
  },
  textLeft: {
    textAlign: "left",
    alignSelf: "stretch",
    marginLeft: 19,
    fontSize: 19,
    marginTop: 10,
    marginBottom: 5,
  },
  cancelBtn: {
    backgroundColor: "#0060ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: 200,
    height: 40,
  },
  cancelBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});
