import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState, useRef } from "react";

const TermsModal = ({ visible, onClose, onAgree }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
    if (isBottom) setScrolledToBottom(true);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Terms & Conditions</Text>

          <ScrollView
            style={styles.scroll}
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <Text style={styles.text}>
              Welcome to RESBAC. Please read these Terms and Conditions
              carefully before using our mobile application. By creating an
              account or using the app, you agree to the following:
              {"\n\n"}1. <Text style={styles.bold}>Purpose of the App</Text> –
              RESBAC assists in rescue coordination during emergencies such as
              floods, fires, or other disasters. It enables you to request
              rescue, mark yourself safe, and receive alerts. The app is a
              support tool and does not replace official emergency services.
              {"\n\n"}2. <Text style={styles.bold}>No Guarantee of Rescue</Text>{" "}
              – RESBAC facilitates communication with responders, but we cannot
              guarantee immediate assistance or successful outcomes. Always
              contact your local emergency hotline when in danger.
              {"\n\n"}3. <Text style={styles.bold}>User Responsibilities</Text>
              {"\n"}• Provide accurate personal details and contact information.
              {"\n"}• Do not submit false alerts or prank rescue requests.
              {"\n"}• Misuse may result in suspension or banning of your
              account.
              {"\n\n"}4.{" "}
              <Text style={styles.bold}>Data Collection & Usage</Text> – By
              using RESBAC, you consent to the collection of your location,
              rescue requests, and related info. Data is only shared with
              authorized responders to assist during emergencies.
              {"\n\n"}5. <Text style={styles.bold}>Privacy & Security</Text> –
              Your information is stored securely and will not be sold or shared
              with unauthorized third parties.
              {"\n\n"}6.{" "}
              <Text style={styles.bold}>Limitations of Liability</Text> – RESBAC
              and its developers are not liable for delays, failures, or
              inaccuracies in alerts or rescue services. Use of the app is at
              your own risk.
              {"\n\n"}7. <Text style={styles.bold}>Updates & Changes</Text> –
              RESBAC may update these Terms. Continued use means you agree to
              the latest version.
              {"\n\n"}By tapping “I Agree,” you confirm that you have read,
              understood, and accepted these Terms and Conditions.
            </Text>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                !scrolledToBottom && { backgroundColor: "#aaa" },
              ]}
              disabled={!scrolledToBottom}
              onPress={() => {
                onAgree();
                onClose();
              }}
            >
              <Text style={styles.primaryText}>
                {scrolledToBottom ? "I Agree" : "Scroll to Agree"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TermsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxHeight: "85%",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#222",
  },
  scroll: {
    marginBottom: 20,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },
  bold: {
    fontWeight: "600",
    color: "#111",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#0060ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryBtn: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryText: {
    color: "#444",
    fontSize: 16,
  },
});
