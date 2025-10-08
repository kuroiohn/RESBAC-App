import {
  ScrollView,
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
  Modal,
  View,
  TextInput,
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
import { useRealtime } from "../../contexts/RealtimeProvider";

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
  const [reqStatus, setReqStatus] = useState(null);
  const [showInput, setShowInput] = useState(false);

  const { reqData } = useRealtime();

  const [userMessage, setUserMessage] = useState("");
  const [message, setMessage] = useState("");

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setUserMessage(message.trim());
    const { data: sendData, error: sendError } = await supabase
      .from("requestStatus")
      .update({
        message: message,
        sent_at: new Date(),
        readStatus: false,
      })
      .eq("userID", user.id);
    if (sendError) {
      console.error("Error in sending message to db: ", sendError);
    }

    setMessage("");
  };

  const handleEditMessage = () => {
    if (!message.trim()) return;
    setUserMessage(message.trim());
  };

  useEffect(() => {
    if (userMessage) setMessage(userMessage);
  }, [userMessage]);

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
        .select(
          `pressedCallBtn,
          requestStatus (
            status,
            message,
            updated_at,
            readStatus,
            sent_at
          )`
        )
        .eq("userID", user.id)
        .maybeSingle();

      if (error) {
        console.error("Fetch error in supabase usertable: ", error);
      }
      // console.log("Successful fetch", data.pressedCallBtn);
      if (data) {
        setCallRequested(data.pressedCallBtn ? true : false);
        setCallstep(data.pressedCallBtn ? 2 : 0);
        setReqStatus({
          status: data.requestStatus.status,
          message: data.requestStatus.message,
          updated_at: data.requestStatus.updated_at,
          readStatus: data.requestStatus.readStatus,
        });
      } else {
        console.warn("No row found in user ", user.id);
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

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectNumber = async (contact) => {
    // setSelectedContact(contact);
    // setShowCallPicker(false);
    // setCallstep(1); // now in "Calling for help..." state
    // setCallRequested(true);
    try {
      setShowCallPicker(false); // close modal
      setSelectedContact(contact);

      // open dialer
      const phoneUrl = `tel:${contact.number}`;
      await Linking.openURL(phoneUrl);

      // update state and DB after dialer opens
      setCallRequested(true);
      setCallstep(2);

      const now = new Date();
      const { data, error } = await supabase
        .from("user")
        .update({
          pressedCallBtn: [
            new Date(now.getTime() - now.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, -1),
            contact.number.toString(),
          ],
        })
        .eq("userID", user.id)
        .select();

      const { error: reqCallError } = await supabase
        .from("requestStatus")
        .update({
          updated_at: new Date(),
          message: null,
          status: 0,
          sent_at: null,
          readStatus: false,
        })
        .eq("userID", user.id);

      if (reqCallError) {
        console.error("Error updating call button: ", reqCallError);
      }
      if (error) {
        console.error("Error updating call button: ", error);
      } else {
        console.log("Updated call button:", data);
      }
    } catch (err) {
      console.error("Error during call:", err);
    }
  };

  const handleCallPress = async () => {
    setShowCallPicker(true);
    // if (callstep === 0) {
    //   // Step 0 → Open modal
    //   setShowCallPicker(true);
    // } else if (callstep === 1 && selectedContact) {
    //   handleAnimationStart();
    //   // Step 1 → Actually dial + update db → then move to step 2
    //   try {
    //     const url = `tel:${selectedContact.number}`;
    //     await Linking.openURL(url);

    //     setCallstep(2);
    //     setCallRequested(true);
    //     handleAnimationFinish();

    //     const now = new Date();
    //     const { data, error } = await supabase
    //       .from("user")
    //       .update({
    //         pressedCallBtn: [
    //           new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    //             .toISOString()
    //             .slice(0, -1),
    //           selectedContact.number.toString(),
    //         ],
    //       })
    //       .eq("userID", user.id)
    //       .select();

    //     console.log("updated call btn:", data, error);
    //   } catch (err) {
    //     console.error("Error opening dialer: ", err);
    //   }
    // }
    // setShowCallPicker(false)
  };

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

    const { error: reqCancelError } = await supabase
      .from("requestStatus")
      .update({
        message: null,
        status: 0,
        sent_at: null,
        readStatus: false,
      })
      .eq("userID", user.id);

    if (reqCancelError) {
      console.error("Error updating call button: ", reqCancelError);
    }
  };

  // console.log("Callrequested: ", callRequested);
  // console.log("animating: ", animating);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText title={true} style={styles.heading}>
          {callRequested ? "Help is on the way" : "Request Rescue?"}
        </ThemedText>

        {/* Initial state */}
        {callstep === 0 && (
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
        {/* {callstep === 1 && !callRequested && (
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
        )} */}

        {/* After request */}
        {callRequested && (
          <View style={styles.chatContainer}>
            {/* Top banner */}
            <ThemedText style={styles.standbyText}>
              Please stand by, or look for a safe {"\n"}
              place to stay until rescue has arrived.
            </ThemedText>

            {/* Chat area */}
            {reqData?.map((r) => (
              <ScrollView
                key={r.id}
                style={styles.chatScroll}
                contentContainerStyle={{ paddingBottom: 100 }}
              >
                <View style={styles.statusCard}>
                  <Text style={styles.statusLabel}>Current Status</Text>
                  <View style={styles.statusLine} />
                  <Text style={styles.statusMessage}>
                    {r.status === 3 ? (
                      "🚨 Rescuers are ON THEIR WAY. Please stay at a safe place and look out for incoming rescuers."
                    ) : r.status === 2 ? (
                      "Rescue request shared with rescuers. Please wait while they prepare to get to you."
                    ) : r.status === 1 ? (
                      "Admin received your rescue request. Please wait while they share your information with the rescuers."
                    ) : (
                      <Text>
                        Rescue request sent to admin.{"\n"}Waiting for admin to
                        see your request.
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.timestamp}>
                    Last updated:{" "}
                    {new Date(r.updated_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </Text>
                </View>

                <View style={styles.messageCard}>
                  <Text style={styles.messageLabel}>Your Message</Text>
                  <View style={styles.statusLine} />
                  <Text style={styles.userMessageText}>
                    {r.message || "No message sent yet..."}
                  </Text>
                  {r.sent_at && (
                    <Text style={styles.timestamp}>
                      Sent at{" "}
                      {new Date(r.sent_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </Text>
                  )}
                </View>
              </ScrollView>
            ))}
            {/* Top Row - Cancel + Send Message */}
            <View style={styles.topRow}>
              {!showInput && (
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.cancelRescueBtn}
                >
                  <Text style={styles.cancelRescueBtnText}>
                    Cancel Rescue Request
                  </Text>
                </TouchableOpacity>
              )}
              {!showInput && (
                <TouchableOpacity
                  onPress={() => setShowInput(true)}
                  style={styles.initialSendBtn}
                >
                  <Text style={styles.initialSendBtnText}>Send Message</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Message Input Section - Shown when Send Message is clicked */}
            {showInput && (
              <View style={styles.messageSection}>
                <Text style={styles.editGuide}>
                  📝 You can update your message anytime.{"\n"}Only one message
                  is allowed.
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder='Type your message...'
                  placeholderTextColor='#999'
                  multiline
                  value={message} // 👈 only this
                  onChangeText={setMessage}
                  scrollEnabled
                />

                {/* Row with Send and Cancel side by side */}
                <View style={styles.inputButtonsRow}>
                  <TouchableOpacity onPress={() => setShowInput(false)}>
                    <Text style={styles.cancelInputText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSendMessage}
                    style={styles.sendBtn}
                  >
                    <Text style={styles.sendBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.blueLine} />

                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.cancelRescueBtn}
                >
                  <Text style={styles.cancelRescueBtnText}>
                    Cancel Rescue Request
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <Spacer height={20} />

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
                onPress={() => {
                  handleSelectNumber(c);
                }}
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

  // new add october 07

  adminFeedbackContainer: {
    backgroundColor: "#0060ff",
    borderWidth: 1,
    borderColor: "#0060ff",
    borderRadius: 12,
    padding: 12,
    width: "95%",
    marginTop: 10,
  },
  adminFeedbackTitle: {
    fontWeight: "bold",
    color: "#0060ff",
    marginBottom: 4,
  },
  adminFeedbackText: {
    color: "#333",
  },

  messageInput: {
    flex: 1,
    color: "#000",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  sendButton: {
    backgroundColor: "red",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  chatContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fafafa",
    paddingTop: 10,
    paddingHorizontal: 15,
  },

  standbyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 15,
  },

  chatScroll: {
    flex: 1,
    width: "100%",
  },

  chatBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: "80%",
  },

  adminBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#0060ff",
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#e0e0e0",
  },

  chatText: {
    color: "#fff",
    fontSize: 14,
  },
  userBubbleText: {
    color: "#000",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderRadius: 8,
    borderColor: "#0060ff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.25,
    shadowRadius: 0.5,

    // Shadow for Android
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  initialSendBtn: {
    backgroundColor: "#0060ff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  initialSendBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  cancelLinkText: {
    color: "red",
    fontWeight: "600",
  },

  messageSection: {
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
  },

  editGuide: {
    textAlign: "center",
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
  },

  input: {
    width: "100%",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 35,
    maxHeight: 35,
    textAlignVertical: "top",
    marginBottom: 10,
  },

  sendBtn: {
    backgroundColor: "#0060ff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: "flex-end",
    marginBottom: 10,
  },

  sendBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  cancelBelowBtn: {
    marginTop: 5,
  },

  cancelRescueBtn: {
    backgroundColor: "#666",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  cancelRescueBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  inputButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
    gap: 10, // for RN 0.71+, or use marginRight on children otherwise
  },

  cancelInputText: {
    color: "red",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 10,
  },

  blueLine: {
    height: 1, // thickness of the line
    width: "100%",
    backgroundColor: "#0060ff",
    marginBottom: 20,
  },

  // new interface

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,

    // Top accent border only
    borderWidth: 2,
    borderColor: "transparent", // 👈 remove borders on other sides

    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

    // Android shadow
    elevation: 2,
    marginBottom: 15,
  },

  statusLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
    color: "#0060ff",
  },

  statusLine: {
    height: 2,
    backgroundColor: "#0060ff",
    marginBottom: 10,
    width: 50,
  },

  statusMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },

  timestamp: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
  },

  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,

    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.08, //  lower opacity for softness
    shadowRadius: 8, //  larger radius for nice blur
    shadowOffset: { width: 0, height: 4 }, //  subtle downward shadow

    // Android shadow
    elevation: 2, // 👈 keep low to mimic softness
  },

  messageLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
    color: "#0060ff",
  },

  userMessageText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },

  editBtn: {
    backgroundColor: "#0060ff",
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },

  editBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
