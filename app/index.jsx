import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, Animated, Easing } from "react-native";
import { Link } from "expo-router";

// themed components
import ThemedView from "../components/ThemedView";
import Spacer from "../components/Spacer";
import ThemedText from "../components/ThemedText";
import WelcomeHeader from "../components/WelcomeHeader";
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
      outputRange: [-60, 0], // slide from left
    });

  return (
    <ThemedView style={styles.container}>
      <WelcomeHeader />
      <Spacer height={20} />
      <Spacer />

      {/* Login */}
      <Animated.View
        style={{
          opacity: loginAnim,
          transform: [{ translateX: makeSlideAnim(loginAnim) }],
          width: "100%", // ensures button width stays consistent
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
        <Link href='/emergencyGuideGuest' asChild>
          <ImageButton />
        </Link>
      </Animated.View>

      <ThemedText style={styles.title3}>
        Click here to go to the Emergency Guide Section
      </ThemedText>
    </ThemedView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title3: {
    fontSize: 11,
    color: "#959595",
    textAlign: "left",
    marginRight: 70,
  },
});
