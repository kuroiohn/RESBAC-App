import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
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
  const [step, setStep] = useState(1); // 1: Enter credentials, 2: Set new MPIN, 3: Confirm MPIN
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
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

  const handleNewMpinSubmit = () => {
    setError(null);

    if (newMpin.length !== 4) {
      setError("MPIN must be exactly 4 digits");
      return;
    }

    if (!/^\d{4}$/.test(newMpin)) {
      setError("MPIN must contain only numbers");
      return;
    }

    setStep(3);
  };

  const handleResetMPIN = async () => {
    setError(null);

    // Validate MPIN
    if (confirmMpin.length !== 4) {
      setError("MPIN must be exactly 4 digits");
      return;
    }

    if (newMpin !== confirmMpin) {
      setError("MPINs do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

  const handleKeyPress = (val) => {
    if (step === 2 && newMpin.length < 4) {
      setNewMpin((prev) => prev + val);
      if (error) setError(null);
    } else if (step === 3 && confirmMpin.length < 4) {
      setConfirmMpin((prev) => prev + val);
      if (error) setError(null);
    }
  };

  const handleDelete = () => {
    if (step === 2) {
      setNewMpin((prev) => prev.slice(0, -1));
    } else if (step === 3) {
      setConfirmMpin((prev) => prev.slice(0, -1));
    }
  };

  const getCurrentMpin = () => {
    if (step === 2) return newMpin;
    if (step === 3) return confirmMpin;
    return "";
  };

  const renderMpinBoxes = (value) => (
    <View style={styles.mpinContainer}>
      {Array.from({ length: 4 }, (_, i) => (
        <View
          key={i}
          style={[styles.mpinBox, value.length > i && styles.mpinBoxFilled]}
        >
          <Text style={styles.mpinText}>
            {value.length > i ? value[i] : ""}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderKeypad = () => (
    <View style={styles.keypad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <TouchableOpacity
          key={num}
          style={styles.key}
          onPress={() => handleKeyPress(num.toString())}
          disabled={isLoading}
        >
          <Text style={styles.keyText}>{num}</Text>
        </TouchableOpacity>
      ))}

      {/* Empty space */}
      <View style={styles.key} />

      {/* Zero */}
      <TouchableOpacity
        style={styles.key}
        onPress={() => handleKeyPress("0")}
        disabled={isLoading}
      >
        <Text style={styles.keyText}>0</Text>
      </TouchableOpacity>

      {/* Delete */}
      <TouchableOpacity
        style={[styles.key, styles.specialKey]}
        onPress={handleDelete}
        disabled={isLoading}
      >
        <Feather name='delete' size={20} color='#0060ff' />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <StatusBar style='light' />
      <View style={styles.container}>
        {/* Top Section */}
        <LinearGradient
          colors={["#0060ff", "#003A99"]}
          style={styles.topSection}
        >
          <Image
            source={require("../../assets/mapOverlay.png")}
            style={styles.mapOverlay}
            resizeMode='cover'
          />

          <MaterialIcons name='dialpad' size={80} color='#fff' />

          <ThemedText style={styles.title}>Forgot MPIN?</ThemedText>
          <ThemedText style={styles.subtitle}>
            {step === 1
              ? "Verify your identity to reset MPIN"
              : step === 2
              ? "Set your new 4-digit MPIN"
              : "Confirm your new MPIN"}
          </ThemedText>

          {/* Back Button */}
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </LinearGradient>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Spacer height={10} />

          {step === 1 ? (
            // Step 1: Verify Credentials
            <>
              <ThemedText style={styles.stepTitle}>
                Step 1: Verify Your Identity
              </ThemedText>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View
                  style={[styles.progressDot, styles.progressDotComplete]}
                />
                <View style={styles.progressLine} />
                <View style={styles.progressDot} />
                <View style={styles.progressLine} />
                <View style={styles.progressDot} />
              </View>

              <Spacer height={15} />

              <ThemedTextInput
                style={styles.input}
                placeholder='Email Address'
                keyboardType='email-address'
                autoCapitalize='none'
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
                placeholder='Password'
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
                  <ActivityIndicator color='#f2f2f2' size='small' />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialIcons
                      name='verified-user'
                      size={20}
                      color='#f2f2f2'
                    />
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                  </View>
                )}
              </ThemedButton>

              {error && (
                <>
                  <Spacer height={20} />
                  <Text style={styles.error}>{error}</Text>
                </>
              )}

              <Spacer height={30} />

              <View style={styles.infoBox}>
                <MaterialIcons name='info-outline' size={20} color='#0060ff' />
                <Text style={styles.infoText}>
                  You'll need your email and password to reset your MPIN.
                </Text>
              </View>
            </>
          ) : (
            // Step 2 & 3: Set New MPIN with Keypad
            <>
              <ThemedText style={styles.stepTitle}>
                {step === 2 ? "Step 2: Set New MPIN" : "Step 3: Confirm MPIN"}
              </ThemedText>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View
                  style={[styles.progressDot, styles.progressDotComplete]}
                />
                <View style={styles.progressLine} />
                <View
                  style={[
                    styles.progressDot,
                    step >= 2 && styles.progressDotComplete,
                  ]}
                />
                <View style={styles.progressLine} />
                <View
                  style={[
                    styles.progressDot,
                    step >= 3 && styles.progressDotComplete,
                  ]}
                />
              </View>

              <Spacer height={20} />

              {/* MPIN Input Boxes */}
              {renderMpinBoxes(getCurrentMpin())}

              {error && (
                <>
                  <Spacer height={10} />
                  <Text style={styles.error}>{error}</Text>
                </>
              )}

              <Spacer height={20} />

              {/* Keypad */}
              {renderKeypad()}

              <Spacer height={15} />

              {/* Submit Button */}
              {step === 2 && newMpin.length === 4 && (
                <ThemedButton
                  onPress={handleNewMpinSubmit}
                  disabled={isLoading}
                  style={isLoading ? styles.disabledButton : null}
                >
                  <View style={styles.buttonContent}>
                    <MaterialIcons
                      name='arrow-forward'
                      size={20}
                      color='#f2f2f2'
                    />
                    <Text style={styles.buttonText}>Continue</Text>
                  </View>
                </ThemedButton>
              )}

              {step === 3 && confirmMpin.length === 4 && (
                <ThemedButton
                  onPress={handleResetMPIN}
                  disabled={isLoading}
                  style={isLoading ? styles.disabledButton : null}
                >
                  {isLoading ? (
                    <ActivityIndicator color='#f2f2f2' size='small' />
                  ) : (
                    <View style={styles.buttonContent}>
                      <MaterialIcons
                        name='check-circle'
                        size={20}
                        color='#f2f2f2'
                      />
                      <Text style={styles.buttonText}>Reset MPIN</Text>
                    </View>
                  )}
                </ThemedButton>
              )}
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 0.35,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 60 : 40,
    paddingBottom: 20,
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
    top: Platform.OS === "android" ? 50 : 70,
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
    padding: 10,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ddd",
  },
  progressDotComplete: {
    backgroundColor: "#0060ff",
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: "#ddd",
    marginHorizontal: 5,
  },
  mpinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginVertical: 1,
  },
  mpinBox: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  mpinBoxFilled: {
    borderColor: "#0060ff",
    backgroundColor: "#e3f2fd",
  },
  mpinText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 50,
  },
  key: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  specialKey: {
    backgroundColor: "#f0f0f0",
  },
  keyText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "600",
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
