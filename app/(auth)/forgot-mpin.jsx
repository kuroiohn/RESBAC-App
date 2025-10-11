import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../../contexts/supabaseClient";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedButton from "../../components/ThemedButton";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import { Colors } from "../../constants/Colors";

export default function ForgotMPIN() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Enter credentials, 2: Set new MPIN
  const router = useRouter();

  const handleVerifyCredentials = async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      // Verify credentials with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) throw signInError;

      console.log("Credentials verified, proceeding to MPIN reset");
      setStep(2);
    } catch (error) {
      console.error("Verification error:", error);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetMPIN = async () => {
    setError(null);

    // Validate MPIN
    if (!newMpin || newMpin.length !== 4) {
      setError("MPIN must be exactly 4 digits");
      return;
    }

    if (!/^\d{4}$/.test(newMpin)) {
      setError("MPIN must contain only numbers");
      return;
    }

    if (newMpin !== confirmMpin) {
      setError("MPINs do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User session not found");
      }

      // Update MPIN in database
      const { error: updateError } = await supabase
        .from("user")
        .update({ mpin: newMpin })
        .eq("userID", user.id);

      if (updateError) throw updateError;

      // Update local storage
      await AsyncStorage.setItem(
        `user_mpin_${email.trim()}`,
        JSON.stringify({
          mpin: newMpin,
          password: password,
          email: email.trim(),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        })
      );

      // Sign out after reset
      await supabase.auth.signOut();

      Alert.alert(
        "MPIN Reset Successfully!",
        `Your new MPIN has been set. You can now use it to login.`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (error) {
      console.error("MPIN reset error:", error);
      setError(error.message || "Failed to reset MPIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Top Section */}
        <LinearGradient
          colors={["#0060ff", "#003A99"]}
          style={styles.topSection}
        >
          <Image
            source={require("../../assets/mapOverlay.png")}
            style={styles.mapOverlay}
            resizeMode="cover"
          />

          <MaterialIcons name="dialpad" size={80} color="#fff" />

          <ThemedText style={styles.title}>Forgot MPIN?</ThemedText>
          <ThemedText style={styles.subtitle}>
            {step === 1
              ? "Verify your identity to reset MPIN"
              : "Set your new 4-digit MPIN"}
          </ThemedText>

          {/* Back Button */}
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </LinearGradient>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Spacer height={40} />

          {step === 1 ? (
            // Step 1: Verify Credentials
            <>
              <ThemedText style={styles.stepTitle}>
                Step 1: Verify Your Identity
              </ThemedText>
              <Spacer height={20} />

              <ThemedTextInput
                style={styles.input}
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                value={email}
                editable={!isLoading}
              />

              <Spacer height={15} />

              <ThemedTextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                value={password}
                editable={!isLoading}
              />

              <Spacer height={20} />

              <ThemedButton
                onPress={handleVerifyCredentials}
                disabled={isLoading || !email.trim() || !password.trim()}
                style={
                  isLoading || !email.trim() || !password.trim()
                    ? styles.disabledButton
                    : null
                }
              >
                {isLoading ? (
                  <ActivityIndicator color="#f2f2f2" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialIcons
                      name="verified-user"
                      size={20}
                      color="#f2f2f2"
                    />
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                  </View>
                )}
              </ThemedButton>
            </>
          ) : (
            // Step 2: Set New MPIN
            <>
              <ThemedText style={styles.stepTitle}>
                Step 2: Set New MPIN
              </ThemedText>
              <Spacer height={20} />

              <ThemedTextInput
                style={styles.input}
                placeholder="New 4-digit MPIN"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                onChangeText={(text) => {
                  setNewMpin(text);
                  if (error) setError(null);
                }}
                value={newMpin}
                editable={!isLoading}
              />

              <Spacer height={15} />

              <ThemedTextInput
                style={styles.input}
                placeholder="Confirm MPIN"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                onChangeText={(text) => {
                  setConfirmMpin(text);
                  if (error) setError(null);
                }}
                value={confirmMpin}
                editable={!isLoading}
              />

              <Spacer height={20} />

              <ThemedButton
                onPress={handleResetMPIN}
                disabled={
                  isLoading ||
                  !newMpin.trim() ||
                  !confirmMpin.trim() ||
                  newMpin.length !== 4
                }
                style={
                  isLoading ||
                  !newMpin.trim() ||
                  !confirmMpin.trim() ||
                  newMpin.length !== 4
                    ? styles.disabledButton
                    : null
                }
              >
                {isLoading ? (
                  <ActivityIndicator color="#f2f2f2" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="check-circle" size={20} color="#f2f2f2" />
                    <Text style={styles.buttonText}>Reset MPIN</Text>
                  </View>
                )}
              </ThemedButton>
            </>
          )}

          {error && (
            <>
              <Spacer height={20} />
              <Text style={styles.error}>{error}</Text>
            </>
          )}

          <Spacer height={30} />

          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={20} color="#0060ff" />
            <Text style={styles.infoText}>
              {step === 1
                ? "You'll need your email and password to reset your MPIN."
                : "Choose a 4-digit MPIN that you can remember easily but others can't guess."}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.09,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 10,
    padding: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  input: {
    width: "90%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#f2f2f2",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  error: {
    color: Colors.warning,
    padding: 10,
    backgroundColor: "#f5c1c8",
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "center",
    width: "90%",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#90caf9",
    width: "90%",
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1976d2",
    lineHeight: 18,
  },
});
