import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../hooks/useUser";
import { SecureStorage } from "../../utils/secureStorage";
import supabase from "../../contexts/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

// themed components
import ThemedLogo from "../../components/ThemedLogo";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import ThemedLoader from "../../components/ThemedLoader";

const MPin = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser, login } = useUser();
  const [mpin, setMpin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userEmail = params.userEmail || params.email || "";

  console.log("MPIN screen loaded");
  console.log("All params:", params);
  console.log("Extracted email:", userEmail);

  const dotAnimations = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    mpin.split("").forEach((_, i) => {
      Animated.timing(dotAnimations[i], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });

    for (const i of Array.from(
      { length: 4 - mpin.length },
      (_, index) => mpin.length + index
    )) {
      dotAnimations[i].setValue(0);
    }
  }, [mpin]);

  // If no email provided, redirect back to login
  useEffect(() => {
    if (!userEmail) {
      console.log("No email found, redirecting to login");
      Alert.alert(
        "Email Required",
        "Please select MPIN option from the login screen.",
        [{ text: "Go to Login", onPress: () => router.replace("/login") }]
      );
    }
  }, [userEmail]);

  const handleKeyPress = (val) => {
    if (mpin.length < 4) {
      setMpin((prev) => prev + val);
    }
  };

  const handleDelete = () => {
    setMpin((prev) => prev.slice(0, -1));
  };

  // Function to update the most recent login timestamp
  const updateMostRecentLogin = async (userEmail) => {
    try {
      const currentTime = new Date().toISOString();

      // Update the specific user's lastLogin time
      const targetKey = `user_mpin_${userEmail}`;
      const existingData = await AsyncStorage.getItem(targetKey);

      if (existingData) {
        const parsed = JSON.parse(existingData);
        parsed.lastLogin = currentTime;
        await AsyncStorage.setItem(targetKey, JSON.stringify(parsed));
        console.log(`Updated lastLogin for ${userEmail} to ${currentTime}`);
      }
    } catch (error) {
      console.error("Error updating most recent login:", error);
    }
  };

  const handleMpinSubmit = async () => {
    if (mpin.length !== 4) {
      Alert.alert("Invalid MPIN", "Please enter a 4-digit MPIN.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting MPIN unlock for:", userEmail);

      // Check local MPIN storage first (from registration or previous login)
      const localMpinData = await AsyncStorage.getItem(
        `user_mpin_${userEmail}`
      );

      if (localMpinData) {
        const { mpin: storedMpin, password, email } = JSON.parse(localMpinData);

        console.log(`Async: ${email} ${password} ${storedMpin}`);

        if (mpin === storedMpin) {
          console.log("Local MPIN verified - performing automatic login");

          // ALWAYS update the most recent user email for quick access
          await AsyncStorage.setItem("most_recent_user_email", userEmail);
          console.log(`Set most recent user email to: ${userEmail}`);

          // Update the specific user's lastLogin time
          await updateMostRecentLogin(userEmail);

          // if may password stored, do automatic login
          if (password) {
            try {
              const result = await login(userEmail, password);
              console.log("Auto-login successful via MPIN");

              setUser(result.user);

              setTimeout(() => {
                router.replace("/(dashboard)/home");
              }, 100);
              return;
            } catch (loginError) {
              console.error("Auto-login failed:", loginError);
              Alert.alert(
                "Login Failed",
                "MPIN verified but login failed. Please try email/password login.",
                [
                  {
                    text: "Go to Email Login",
                    onPress: () => router.replace("/(auth)/login"),
                  },
                ]
              );
              return;
            }
          } else {
            Alert.alert(
              "MPIN Verified!",
              "Your MPIN is correct, but you need to log in with email/password once to enable automatic login.",
              [
                {
                  text: "Go to Email Login",
                  onPress: () => router.replace("/(auth)/login"),
                },
              ]
            );
            return;
          }
        } else {
          throw new Error("Invalid MPIN. Please try again.");
        }
      }

      // No local MPIN found - direct user to email/password login
      console.log("No local MPIN data found for this user");

      // Update recent login tracker even though MPIN failed
      await AsyncStorage.setItem("most_recent_user_email", userEmail);
      console.log(`Set most recent user email to: ${userEmail}`);

      Alert.alert(
        "MPIN Setup Required",
        "This account doesn't have MPIN quick access set up yet. Please log in with email/password first to enable MPIN access.",
        [
          {
            text: "Go to Email Login",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (error) {
      console.error("MPIN unlock error:", error);
      Alert.alert(
        "Authentication Failed",
        error.message || "Invalid MPIN. Please try again."
      );
      setMpin("");
    } finally {
      setIsLoading(false);
    }
  };

  const renderKey = (label, onPress, isSpecial = false) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        isSpecial && styles.specialKey,
        pressed && styles.keyPressed, // pressed effect
      ]}
      disabled={isLoading}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.keyText,
            isSpecial && styles.specialKeyText,
            pressed && styles.keyTextPressed, // text turns white when pressed
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Top Blue Gradient Section */}
      <LinearGradient colors={["#0060ff", "#003A99"]} style={styles.topSection}>
        <Image
          source={require("../../assets/resbacWhite.png")}
          style={styles.logo}
          resizeMode='contain'
        />
        <ThemedText style={styles.title2}>Enter MPIN</ThemedText>
        <Spacer height={10} />
        <ThemedText style={styles.title3}>
          Quick access for {"\n"} {userEmail}
        </ThemedText>

        {/* Dot Display */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      scale: dotAnimations[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                  opacity: dotAnimations[i],
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      {/* Bottom White Section */}
      <View style={styles.bottomSection}>
        {userEmail ? (
          <>
            {/* Flat Keypad */}
            <View style={styles.keypad}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) =>
                renderKey(num, () => handleKeyPress(num))
              )}
              {renderKey("⌫", handleDelete, true)}
              {renderKey("0", () => handleKeyPress("0"))}
              {isLoading ? (
                <View style={styles.loaderWrapper}>
                  <ThemedLoader size={28} />
                </View>
              ) : (
                renderKey("✓", handleMpinSubmit, true)
              )}
            </View>

            <Spacer height={10} />

            <ThemedText
              style={styles.backToLogin}
              onPress={() => router.replace("/login")}
            >
              ← Use Email Login Instead
            </ThemedText>
          </>
        ) : (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <ThemedText>No email provided</ThemedText>
            <ThemedText
              style={styles.backToLogin}
              onPress={() => router.replace("/login")}
            >
              ← Use Email/Password Instead
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
};

export default MPin;

const styles = StyleSheet.create({
  container: { flex: 1 },
  title2: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  title3: {
    color: "white",
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 30,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 8,
    backgroundColor: "white",
  },
  keypad: {
    width: "80%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    rowGap: 5,
    columnGap: 45,
    marginTop: 0,
  },

  key: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 28,
    color: "#0060ff",
    fontWeight: "600",
  },
  specialKeyText: {
    fontSize: 28,
    color: "#0060ff",
    fontWeight: "600",
  },

  backToLogin: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: "underline",
  },
  loaderWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 10,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
