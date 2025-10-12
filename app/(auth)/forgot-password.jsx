import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import supabase from "../../contexts/supabaseClient";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedButton from "../../components/ThemedButton";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import { Colors } from "../../constants/Colors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const router = useRouter();

  const handleSendResetEmail = async () => {
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // Check rate limit (60 seconds between requests)
    const now = Date.now();
    if (lastRequestTime && (now - lastRequestTime) < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - lastRequestTime)) / 1000);
      setError(`Please wait ${waitSeconds} seconds before requesting another reset email.`);
      return;
    }

    setIsLoading(true);

    try {
      // Send password reset email with redirectTo pointing to Vercel page
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: 'https://resbac-password-reset.vercel.app',
        }
      );

      if (error) throw error;

      setLastRequestTime(now);

      Alert.alert(
        "Check Your Email",
        `We've sent password reset instructions to ${email.trim()}.\n\nIMPORTANT: The reset link is valid for 1 hour. Please check your email (including spam folder) and click the link within 1 hour to reset your password.\n\nNote: Email delivery may take a few minutes.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Password reset error:", error);

      // Handle specific error cases
      if (error.message?.includes('seconds')) {
        setError("Please wait 60 seconds before requesting another reset email.");
      } else if (error.message?.includes('rate limit')) {
        setError("Too many requests. Please try again in a few minutes.");
      } else if (error.message?.includes('User not found')) {
        Alert.alert(
          "Check Your Email",
          `If an account exists for ${email.trim()}, you will receive password reset instructions.`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        setError(
          error.message || "Failed to send reset email. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />
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

          <MaterialIcons name="lock-reset" size={80} color="#fff" />

          <ThemedText style={styles.title}>Forgot Password?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your email to receive reset instructions
          </ThemedText>

          {/* Back Button */}
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </LinearGradient>

        {/* Bottom Section */}
        <ScrollView
          style={styles.bottomSection}
          contentContainerStyle={styles.bottomSectionContent}
          keyboardShouldPersistTaps="handled"
        >
          <Spacer height={40} />

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

          <Spacer height={20} />

          <ThemedButton
            onPress={handleSendResetEmail}
            disabled={isLoading || !email.trim()}
            style={isLoading || !email.trim() ? styles.disabledButton : null}
          >
            {isLoading ? (
              <ActivityIndicator color="#f2f2f2" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="email" size={20} color="#f2f2f2" />
                <Text style={styles.buttonText}>Send Reset Email</Text>
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
            <MaterialIcons name="info-outline" size={20} color="#0060ff" />
            <Text style={styles.infoText}>
              You'll receive an email with a link to reset your password. Click
              the link to open a web page where you can enter your new password.
            </Text>
          </View>

          <Spacer height={20} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 0.45,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 60 : 40,
    paddingBottom: 40,
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
  },
  bottomSectionContent: {
    padding: 20,
    alignItems: "center",
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
