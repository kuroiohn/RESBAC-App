import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState } from "react";

const TermsModal = ({ visible, onClose }) => {
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
          <ScrollView style={styles.scroll}>
            <Text style={styles.text}>
              Welcome to RESBAC. Please read these Terms and Conditions
              carefully before using our mobile application. By creating an
              account or using the app, you agree to the following:
              {"\n\n"}1. **Purpose of the App** RESBAC is designed to assist in
              rescue coordination during emergencies such as floods, fires, or
              other disasters. It enables you to request rescue, mark yourself
              safe, and receive important alerts. The app is a support tool and
              does not replace official emergency services.
              {"\n\n"}2. **No Guarantee of Rescue** While RESBAC facilitates
              communication with responders, we cannot guarantee immediate
              assistance, rescue availability, or successful outcomes. You
              should still contact your local emergency hotline (e.g., 911 or
              local authorities) when in danger.
              {"\n\n"}3. **User Responsibilities** - Provide accurate personal
              details and contact information. - Do not submit false alerts,
              prank rescue requests, or misleading information. - Misuse of the
              system may result in suspension or permanent banning of your
              account.
              {"\n\n"}4. **Data Collection and Usage** By using RESBAC, you
              consent to the collection and processing of your data, including:
              - Your location (when shared). - Rescue requests you submit. -
              Information needed to coordinate with responders. This data will
              only be shared with authorized rescue organizations and local
              authorities to assist you during emergencies.
              {"\n\n"}5. **Privacy and Security** We value your privacy. Your
              information is stored securely and will not be sold or shared with
              unauthorized third parties. However, no system is completely
              immune to breaches, and we cannot guarantee absolute data
              security.
              {"\n\n"}6. **Limitations of Liability** RESBAC and its developers
              are not liable for: - Delays, failures, or unavailability of
              rescue services. - Inaccuracies in alerts or information. - Any
              damages, losses, or injuries resulting from reliance on the app.
              Use of the app is at your own risk, and you should always
              prioritize your personal safety.
              {"\n\n"}7. **Updates and Changes** RESBAC may update these Terms
              and Conditions from time to time. Continued use of the app after
              updates means you agree to the revised terms.
              {"\n\n"}By tapping "I Understand," you confirm that you have read,
              understood, and agree to these Terms and Conditions.
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>I Understand</Text>
          </TouchableOpacity>
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
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  scroll: {
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  closeBtn: {
    backgroundColor: "#0060ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
