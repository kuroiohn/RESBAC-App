import {
  ScrollView,
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
  Modal,
  View,
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
  const [callstep, setCallstep] = useState(0);
  const [showCallPicker, setShowCallPicker] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const contacts = [
    { name: "Marikina Local", number: "161" },
    { name: "Red Cross Marikina", number: "143" },
  ];

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
      if (data) {
        setCallRequested(data.pressedCallBtn ? true : false);
        setCallstep(data.pressedCallBtn ? 2 : 0);
      } else {
        console.warn("No row found in pressedcallbtn for user ", user.id);
      }

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
            setCallRequested(payload.new.pressedCallBtn ? true : false);
            console.log("Realtime pressedCall: ", callRequested);
            setCallstep(payload.new.pressedCallBtn ? 2 : 1);
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
    // setCallstep(1)
    // setCallRequested(false);
    fadeAnim.setValue(0); // reset fade each time
  };

  // pang animate
  const handleAnimationFinish = () => {
    setAnimating(false);
    // if (callstep === 1){
    //   setCallstep(2)
    //   setCallRequested(true);
    // }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectNumber = (contact) => {
    setSelectedContact(contact);
    setShowCallPicker(false);
    setCallstep(1); // now in "Calling for help..." state
    setCallRequested(false);
    // handleAnimationStart();
  };

  {
    /*const handleSelectNumber = async (contact) => {
    setSelectedContact(contact);
    setShowCallPicker(false);
    setCallstep(1); // entering "animating" state
    setCallRequested(false);

    // start button animation
    handleAnimationStart();

    // wait briefly for animation before proceeding
    setTimeout(async () => {
      handleAnimationFinish(); // complete animation
      setCallstep(2);
      setCallRequested(true);

      // now open dialer
      const url = `tel:${contact.number}`;
      try {
        await Linking.openURL(url);

        // update supabase
        const now = new Date();
        const { data, error } = await supabase
          .from("user")
          .update({
            pressedCallBtn: [
              new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, -1)
                .toString(),
              contact.number.toString(),
            ],
          })
          .eq("userID", user.id)
          .select();

        console.log("updated call btn:", data, error);
      } catch (err) {
        console.error("Error opening dialer: ", err);
      }
    }, 800); // adjust delay to match your animation duration
  }; */
  }

  const handleCallPress = async () => {
    if (callstep === 0) {
      // Step 0 → Open modal
      setShowCallPicker(true);
    } else if (callstep === 1 && selectedContact) {
      handleAnimationStart();
      // Step 1 → Actually dial + update db → then move to step 2
      try {
        const url = `tel:${selectedContact.number}`;
        await Linking.openURL(url);

        setCallstep(2);
        setCallRequested(true);
        handleAnimationFinish();

        const now = new Date();
        const { data, error } = await supabase
          .from("user")
          .update({
            pressedCallBtn: [
              new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, -1),
              selectedContact.number.toString(),
            ],
          })
          .eq("userID", user.id)
          .select();

        console.log("updated call btn:", data, error);
      } catch (err) {
        console.error("Error opening dialer: ", err);
      }
    }
  };

  {
    /* const handleCallPress = async () => {
    if (callstep === 0) {
      // setCallstep(1); // First press
      // setCallRequested(false);
      setShowCallPicker(true); // show picker popup
    } else if (callstep === 1 && selectedContact) {
      const phoneNumber = "09684319082";
      const url = `tel:${phoneNumber}`;
      try {
        await Linking.openURL(url);
        setCallstep(2);
        setCallRequested(true);

        const now = new Date();
        const { data, error } = await supabase
          .from("user")
          .update({
            pressedCallBtn: new Date(
              now.getTime() - now.getTimezoneOffset() * 60000
            )
              .toISOString()
              .slice(0, -1),
          })
          .eq("userID", user.id)
          .select();
        console.log("updated call btn:", data, error);
      } catch (err) {
        console.error("Error opening dialer: ", err);
      }
    }
  }; */
  }

  const handleCancel = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setAnimating(false);
      setCallRequested(false);
      setCallstep(0);
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
      .update({ pressedCallBtn: null })
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
        {callstep === 0 && !callRequested && (
          <>
            <ThemedText>Press the button below and help will</ThemedText>
            <ThemedText>reach you shortly.</ThemedText>

            <Spacer />
            <CallButton
              onAnimationStart={handleAnimationStart}
              onAnimationFinish={handleAnimationFinish}
              onPress={handleCallPress}
              disabled={callRequested}
            />
            <Spacer />

            <MarkSafeBtn />
          </>
        )}

        {/* Animating state */}
        {callstep === 1 && !callRequested && (
          <>
            <ThemedText style={{ marginTop: 20, fontWeight: "bold" }}>
              Calling for help...
            </ThemedText>
            <Spacer />
            <CallButton
              onAnimationStart={handleAnimationStart}
              onAnimationFinish={handleAnimationFinish}
              onPress={handleCallPress}
              disabled={callRequested}
            />
            <Spacer />
            <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            </TouchableOpacity>
          </>
        )}

        {/* After request */}
        {callRequested && callstep === 2 && (
          <Animated.View style={{ alignItems: "center" }}>
            <ThemedText style={{ marginVertical: 10, textAlign: "center" }}>
              Please stand by, or look for a safe {"\n"}
              place to stay until rescue has arrived.
            </ThemedText>
            <Spacer />
            <CallButton
              onAnimationStart={handleAnimationStart}
              onAnimationFinish={handleAnimationFinish}
              disabled={callstep === 2}
            />
            <Spacer />
            <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            </TouchableOpacity>
            <Spacer />
          </Animated.View>
        )}
        {callRequested && <MarkSafeBtn />}
        {/* Alerts + Guide only in initial state */}
        {callstep !== 1 && (
          <>
            <ThemedText style={styles.textLeft}>Alerts</ThemedText>
            <AlertCard />
          </>
        )}
      </ThemedView>

      <Modal
        visible={showCallPicker}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowCallPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Choose who to call
            </Text>

            {contacts.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={styles.contactBtn}
                onPress={() => handleSelectNumber(c)}
              >
                <Text style={{ fontSize: 16 }}>{c.name}</Text>
                <Text style={{ fontSize: 14, color: "#555" }}>{c.number}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowCallPicker(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    width: 200,
    height: 40,
  },
  cancelBtnText: {
    color: "white",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "stretch",
  },
  contactBtn: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
});
