import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, Animated, Easing, View, Image } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// themed components
import Spacer from "../components/Spacer";
import ThemedText from "../components/ThemedText";
import ThemedButton from "../components/ThemedButton";
import ImageButton from "../components/ImageButton";

const Home = () => {
  const loginAnim = useRef(new Animated.Value(0)).current;
  const registerAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(loginAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(registerAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const makeSlideAnim = (anim) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-60, 0],
    });

  return (
    <View style={styles.container}>
      {/* Top Blue Gradient */}
      <LinearGradient colors={["#0060ff", "#003A99"]} style={styles.topSection}>
        {/* Map overlay background */}
        <Image
          source={require("../assets/mapOverlay.png")}
          style={styles.mapOverlay}
          resizeMode='cover'
        />

        {/* Logo and Welcome text */}
        <Image
          source={require("../assets/resbacWhite.png")}
          style={styles.logo}
          resizeMode='contain'
        />

        <Text style={styles.welcomeTitle}>Welcome To</Text>
        <Text style={styles.welcomeAppName}>RESBAC</Text>
        <Text style={styles.welcomeSubtitle}>Your safety is our priority</Text>
      </LinearGradient>

      {/* Bottom White Section */}
      <View style={styles.bottomSection}>
        {/* Login */}
        <Animated.View
          style={{
            opacity: loginAnim,
            transform: [{ translateX: makeSlideAnim(loginAnim) }],
            width: "100%",
            alignItems: "center",
          }}
        >
          <Link href='/login' asChild>
            <ThemedButton>
              <Text style={{ color: "#f2f2f2", fontWeight: "600" }}>Login</Text>
            </ThemedButton>
          </Link>
        </Animated.View>

        {/* Register */}
        <Animated.View
          style={{
            opacity: registerAnim,
            transform: [{ translateX: makeSlideAnim(registerAnim) }],
            width: "100%",
            alignItems: "center",
          }}
        >
          <Link href='/register' asChild>
            <ThemedButton>
              <Text style={{ color: "#f2f2f2", fontWeight: "600" }}>
                Register
              </Text>
            </ThemedButton>
          </Link>
        </Animated.View>

        <Spacer height={10} />

        {/* Emergency Guide */}
        <Animated.View
          style={{
            opacity: imageAnim,
            transform: [{ translateX: makeSlideAnim(imageAnim) }],
            width: "100%",
            alignItems: "center",
          }}
        >
          <Link
            href={{
              pathname: "/emergencyGuideGuest",
              params: { role: "guest" },
            }}
            asChild
          >
            <ImageButton />
          </Link>
        </Animated.View>

        <ThemedText style={styles.bottomText}>
          Click here to go to the Emergency Guide Section
        </ThemedText>
      </View>
    </View>
  );
};

export default Home;

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
  logo: {
    width: 200,
    height: 80,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: {
    fontSize: 11,
    color: "#959595",
    textAlign: "center",
    marginTop: 10,
  },
  welcomeTitle: {
    color: "#ffffff",
    fontSize: 22,
    textAlign: "center",
    marginTop: 20,
  },
  welcomeAppName: {
    color: "#ffffff",
    fontSize: 55,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject, // fills the gradient area
    opacity: 0.09, // very low opacity
  },
});
