import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useState, useEffect } from "react";
import { useUser } from "../../hooks/useUser";
import { SecureStorage } from "../../utils/secureStorage";
import supabase from "../../contexts/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        // Check if any stored sessions exist
        const keys = await AsyncStorage.getAllKeys();
        const sessionKeys = keys.filter((key) =>
          key.startsWith("session_data")
        );
        const mpinKeys = keys.filter((key) => key.startsWith("user_mpin_"));

        if (sessionKeys.length > 0) {
          // Prioritize session-based quick access
          const userEmail = await AsyncStorage.getItem("user_email");
          if (userEmail) {
            setQuickAccessEmail(userEmail);
            setLoginMethod("mpin");
          }
        } else if (mpinKeys.length > 0) {
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
            setQuickAccessEmail(mostRecentEmail);
            setLoginMethod("mpin");
          }
        }
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

      // Check if user has a locally stored MPIN from registration
      const localMpinData = await AsyncStorage.getItem(
        `user_mpin_${email.trim()}`
      );

      if (localMpinData) {
        const mpinDataParsed = JSON.parse(localMpinData);
        const { mpin } = mpinDataParsed;
        console.log("Found locally stored MPIN, enabling quick access");

        // Store MPIN with password for automatic login
        await AsyncStorage.setItem(
          `user_mpin_${email.trim()}`,
          JSON.stringify({
            mpin: mpin,
            password: password, // Store password for auto-login
            email: email.trim(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          })
        )
        
        console.log('MPIN data updated with password for auto-login')
        
        router.replace('/(dashboard)/home')
        // Alert.alert(
        //   'Quick Access Enabled!',
        //   'You can now use your 4-digit MPIN for quick login on this device.',
          // [{ text: 'OK', onPress: () => router.replace('/(dashboard)/home') }]
        // )
      } else {
        // No local MPIN found
        console.log("No local MPIN found");
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
        <ThemedLogo />
        <Spacer height={20} />

        <TitleText type='title1'>RESBAC</TitleText>

        <TitleText type='title3'>Sign in to start your session</TitleText>

        <Spacer />

        {quickAccessEmail && loginMethod === "mpin" ? (
          // Quick Access Mode - Show MPIN directly for known user
          <View style={styles.quickAccessSection}>
            <ThemedText style={styles.quickAccessWelcome}>
              Welcome back!
            </ThemedText>
            <ThemedText style={styles.quickAccessEmail}>
              {quickAccessEmail}
            </ThemedText>
            <ThemedButton
              onPress={handleMpinLogin}
              style={styles.quickAccessButton}
            >
              <Text style={{ color: "#f2f2f2" }}>Use MPIN</Text>
            </ThemedButton>

            <ThemedText
              style={styles.switchToEmailLogin}
              onPress={() => {
                setLoginMethod("email");
                setQuickAccessEmail(null);
              }}
            >
              Use different account or email login
            </ThemedText>
          </View>
        ) : (
          // Standard Login Mode
          <>
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
                >
                  <Text style={{ color: "#f2f2f2" }}>Enter MPIN</Text>
                </ThemedButton>

                <ThemedText style={styles.mpinNote}>
                  Forgot your MPIN? Use email login above
                </ThemedText>
              </View>
            )}
          </>
        )}

        <Spacer />

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
    width: "80%",
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
  },
  quickAccessSection: {
    alignItems: "center",
    width: "80%",
    paddingVertical: 20,
  },
  quickAccessWelcome: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
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
});
