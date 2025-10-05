import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useState, useEffect } from "react";
import { useUser } from "../../hooks/useUser";
import { SecureStorage } from "../../utils/secureStorage";
import supabase from "../../contexts/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

//themed components
import ThemedLogo from "../../components/ThemedLogo";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import Spacer from "../../components/Spacer";
import TitleText from "../../components/TitleText";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'mpin'
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [quickAccessEmail, setQuickAccessEmail] = useState(null); // Email for quick access

  const { login, setUser } = useUser();
  const router = useRouter();

  // Check for any stored sessions on component mount
  useEffect(() => {
    const checkForQuickAccess = async () => {
      try {
        console.log("Checking for quick access...");

        // Check for most recent user email first
        const mostRecentEmail = await AsyncStorage.getItem(
          "most_recent_user_email"
        );
        console.log("Most recent user email found:", mostRecentEmail);

        if (mostRecentEmail) {
          console.log(
            "Setting quick access for most recent user:",
            mostRecentEmail
          );
          setQuickAccessEmail(mostRecentEmail);
          setLoginMethod("mpin");
          return;
        }

        // Fallback to session-based quick access
        const keys = await AsyncStorage.getAllKeys();
        const sessionKeys = keys.filter((key) =>
          key.startsWith("session_data")
        );

        if (sessionKeys.length > 0) {
          const userEmail = await AsyncStorage.getItem("user_email");
          if (userEmail) {
            console.log("Found session-based quick access for:", userEmail);
            setQuickAccessEmail(userEmail);
            setLoginMethod("mpin");
            return;
          }
        }

        // Final fallback to MPIN timestamp comparison
        const mpinKeys = keys.filter((key) => key.startsWith("user_mpin_"));
        if (mpinKeys.length > 0) {
          let mostRecentEmail = null;
          let mostRecentTime = 0;

          for (const mpinKey of mpinKeys) {
            const email = mpinKey.replace("user_mpin_", "");
            const mpinData = await AsyncStorage.getItem(mpinKey);

            if (mpinData) {
              const parsed = JSON.parse(mpinData);
              const lastLogin = new Date(
                parsed.lastLogin || parsed.createdAt || 0
              ).getTime();

              if (lastLogin > mostRecentTime) {
                mostRecentTime = lastLogin;
                mostRecentEmail = email;
              }
            }
          }

          if (mostRecentEmail) {
            console.log(
              "Fallback: Found most recent MPIN user:",
              mostRecentEmail
            );
            setQuickAccessEmail(mostRecentEmail);
            setLoginMethod("mpin");
          }
        }

        console.log("No quick access options found");
      } catch (error) {
        console.log("Error checking for quick access:", error);
      }
    };

    checkForQuickAccess();
  }, []);

  // Check if user has a stored session for this email (when typing)
  useEffect(() => {
    const checkStoredSession = async () => {
      if (email.trim() && email.includes("@")) {
        // Check both secure storage and local MPIN storage
        const hasSecureSession = await SecureStorage.hasStoredSession(
          email.trim()
        );
        const localMpinData = await AsyncStorage.getItem(
          `user_mpin_${email.trim()}`
        );

        setHasStoredSession(hasSecureSession || !!localMpinData);
      } else {
        setHasStoredSession(false);
      }
    };

    if (loginMethod === "email" && email) {
      const timeoutId = setTimeout(checkStoredSession, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [email, loginMethod]);

  const handleEmailPasswordLogin = async () => {
    // Clear any previous errors
    setError(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting email/password login with:", email);
      const result = await login(email.trim(), password);
      console.log("Login successful");

      // ALWAYS update most recent user email for quick access
      await AsyncStorage.setItem("most_recent_user_email", email.trim());
      console.log(`Set most recent user email to: ${email.trim()}`);

      // Check if user has a locally stored MPIN from registration
      const localMpinData = await AsyncStorage.getItem(
        `user_mpin_${email.trim()}`
      );

      if (localMpinData) {
        const mpinDataParsed = JSON.parse(localMpinData);
        const { mpin } = mpinDataParsed;
        console.log("Found locally stored MPIN, enabling quick access");

        // Store MPIN with password for automatic login and update lastLogin
        await AsyncStorage.setItem(
          `user_mpin_${email.trim()}`,
          JSON.stringify({
            mpin: mpin,
            password: password, // Store password for auto-login
            email: email.trim(),
            createdAt: mpinDataParsed.createdAt || new Date().toISOString(),
            lastLogin: new Date().toISOString(), // Always update lastLogin on successful login
          })
        );

        console.log("MPIN data updated with password for auto-login");

        setTimeout(() => {
        router.replace("/(dashboard)/home");
      }, 500);
      } else {
        // Check if user has MPIN in database but no local storage
        console.log("No local MPIN found, checking database...");

        try {
          const { data: dbUser, error: dbError } = await supabase
            .from("user")
            .select("mpin")
            .eq("userID", result.user.id)
            .single();

          if (dbError) {
            console.log("Database query error:", dbError);
          }

          if (dbUser?.mpin) {
            console.log("Found database MPIN, creating local storage");
            // User has MPIN in database, create local storage
            await AsyncStorage.setItem(
              `user_mpin_${email.trim()}`,
              JSON.stringify({
                mpin: dbUser.mpin,
                password: password,
                email: email.trim(),
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              })
            );
            console.log("Created local MPIN storage for existing user");

            Alert.alert(
              "MPIN Access Enabled!",
              "Your MPIN quick access has been set up. You can now use your 4-digit MPIN for quick login.",
              [
                {
                  text: "OK",
                  onPress: () => router.replace("/(dashboard)/home"),
                },
              ]
            );
            return;
          } else {
            console.log("No MPIN found in database either");
          }
        } catch (error) {
          console.log("Error checking database MPIN:", error);
        }

        // No local MPIN found and no database MPIN
        console.log("No MPIN found anywhere, proceeding to dashboard");
        router.replace("/(dashboard)/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMpinLogin = () => {
    const emailToUse = quickAccessEmail || email.trim();

    if (!emailToUse) {
      setError("Please enter your email first");
      return;
    }

    // Navigate directly to MPIN entry with the email using router params
    router.push({
      pathname: "/(auth)/mpin",
      params: { userEmail: emailToUse },
    });
  };

  const handleSubmit = () => {
    if (loginMethod === "email") {
      handleEmailPasswordLogin();
    } else {
      handleMpinLogin();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container} safe={true}>
        {/* Back Button fixed at top-left */}
        <Pressable
          onPress={() => router.back()}
          style={{ position: "absolute", top: 70, left: 10, padding: 10 }}
        >
          <Text style={{ color: "#0060ff", fontSize: 16 }}>← Back</Text>
        </Pressable>
        <ThemedLogo />

        {quickAccessEmail && loginMethod === "mpin" ? (
          // Quick Access Mode - Show MPIN directly for known user
          <View style={styles.quickAccessSection}>
            <ThemedText style={styles.quickAccessWelcome}>
              Welcome back,
            </ThemedText>
            <ThemedText style={styles.quickAccessEmail}>
              {quickAccessEmail}
            </ThemedText>
            <Spacer height={200} />
            <ThemedButton
              onPress={handleMpinLogin}
              style={styles.quickAccessButton}
            >
              <MaterialIcons
                name='dialpad'
                size={20}
                color='#f2f2f2'
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Use MPIN</Text>
            </ThemedButton>

            <ThemedButton
              onPress={() => {
                setLoginMethod("email");
                setQuickAccessEmail(null);
              }}
              style={styles.switchToEmailLoginBtn}
            >
              <MaterialIcons
                name='email'
                size={20}
                color='#f2f2f2'
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Use email/password instead</Text>
            </ThemedButton>
          </View>
        ) : (
          // Standard Login Mode
          <>
            <Text style={styles.quickAccessWelcome}>RESBAC</Text>
            <Text style={styles.quickAccessEmail}>
              Sign in to start your session.
            </Text>

            {/* Login Method Selector */}
            <View style={styles.methodSelector}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  loginMethod === "email" && styles.methodButtonActive,
                ]}
                onPress={() => setLoginMethod("email")}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    loginMethod === "email" && styles.methodButtonTextActive,
                  ]}
                >
                  Email & Password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  loginMethod === "mpin" && styles.methodButtonActive,
                ]}
                onPress={() => setLoginMethod("mpin")}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    loginMethod === "mpin" && styles.methodButtonTextActive,
                  ]}
                >
                  Quick MPIN
                </Text>
              </TouchableOpacity>
            </View>

            <Spacer height={100} />

            <Spacer height={20} />

            {loginMethod === "email" ? (
              // Email/Password Login Form
              <>
                <ThemedTextInput
                  style={{ width: "80%", marginBottom: 20 }}
                  placeholder='Email'
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

                <ThemedTextInput
                  style={{ width: "80%", marginBottom: 20 }}
                  placeholder='Password'
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                  value={password}
                  secureTextEntry
                  editable={!isLoading}
                />

                <ThemedButton
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={isLoading ? styles.disabledButton : null}
                >
                  {isLoading ? (
                    <ActivityIndicator color='#f2f2f2' size='small' />
                  ) : (
                    <Text style={{ color: "#f2f2f2" }}>Login</Text>
                  )}
                </ThemedButton>
              </>
            ) : (
              // MPIN Manual Entry (when no quick access available)
              <View style={styles.mpinSection}>
                <ThemedText style={styles.mpinInstructions}>
                  Enter email for MPIN access
                </ThemedText>

                <ThemedTextInput
                  style={{ width: "80%", marginBottom: 20 }}
                  placeholder='Email Address'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                  onChangeText={setEmail}
                  value={email}
                />

                <ThemedButton
                  onPress={handleMpinLogin}
                  disabled={!email.trim()}
                  style={styles.quickAccessButton}
                >
                  <MaterialIcons
                    name='dialpad'
                    size={20}
                    color='#f2f2f2'
                    style={styles.icon}
                  />
                  <Text style={styles.buttonText}>Enter MPIN</Text>
                </ThemedButton>

                <ThemedText style={styles.mpinNote}>
                  Don't remember your MPIN? Use email/password above
                </ThemedText>
              </View>
            )}
          </>
        )}

        <TitleText type='title4' style={{ marginRight: 111 }}>
          Don't have an Account?{" "}
          <Link href='/(auth)/register' asChild>
            <Text style={{ color: "#0060ff", fontWeight: "600" }}>
              Register instead
            </Text>
          </Link>
        </TitleText>

        <Spacer />
        {error && <Text style={styles.error}>{error}</Text>}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  methodSelector: {
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    padding: 4,
    width: "80%",
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  methodButtonActive: {
    backgroundColor: Colors.primary,
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  methodButtonTextActive: {
    color: "#fff",
  },
  mpinSection: {
    alignItems: "center",
    width: "100%",
  },
  mpinInstructions: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  mpinNote: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginRight: 15,
  },
  quickAccessSection: {
    alignItems: "center",
    width: "100%",
    paddingVertical: 10,
  },
  quickAccessWelcome: {
    fontSize: 33,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: "center",
    color: Colors.primary,
  },
  quickAccessEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  quickAccessButton: {
    width: "100%",
    marginBottom: 15,
  },
  switchToEmailLogin: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  btn: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
  },
  pressed: {
    opacity: 0.8,
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
    marginHorizontal: 10,
    textAlign: "center",
  },
  buttonText: {
    color: "#f2f2f2",
    fontWeight: "600",
  },
  quickAccessButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  switchToEmailLoginBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
});
