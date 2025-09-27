import { useRef, useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import {
  TouchableWithoutFeedback,
  StyleSheet,
  View,
  Linking,
  Alert,
} from "react-native";
import supabase from "../contexts/supabaseClient";
import { useUser } from "../hooks/useUser";

const CallButton = ({
  onAnimationStart,
  onAnimationFinish,
  disabled,
  onPress,
}) => {
  const { user } = useUser();
  const animationRef = useRef(null);
  const phoneNumber = "09684319082";
  const [isDisabled, setIsDisabled] = useState(false);

  {
    /*const handlePress = () => {
    if (isDisabled || disabled) return;

    if (onAnimationStart) onAnimationStart();
    setIsDisabled(true);

    // Always start from frame 0
    animationRef.current?.reset();
    animationRef.current?.play();

    setTimeout(() => {
      animationRef.current?.reset(); // reset so it's ready for next press
      onPress && onPress()
      // if (onAnimationFinish) onAnimationFinish();
      setIsDisabled(false);
    }, 2000); */
  }

  const handlePress = () => {
    if (isDisabled || disabled) return;

    onPress && onPress();

    if (onAnimationStart) onAnimationStart();
    setIsDisabled(true);

    animationRef.current?.reset();
    animationRef.current?.play();

    setTimeout(() => {
      animationRef.current?.reset(); // reset so it's ready for next press
      if (onAnimationFinish) onAnimationFinish();
      setIsDisabled(false);
    }, 2000);
  };

  const handleDial = async () => {
    // const { data: { user }, error: userError } = await supabase.auth.getUser();
    // if (userError) {
    //   console.error("Error fetching auth user: ", userError);
    // }

    const now = new Date();
    const { data, error } = await supabase
      .from("user")
      .update({
        pressedCallBtn: new Date(
          now.getTime() - now.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, -1),
      })
      .eq("userID", user.id)
      .select();

    console.log("updated call btn:", data, error);

    if (error) {
      console.error("Error in updating call btn", error);
    }

    const url = `tel:${phoneNumber}`;
    // const supported = await Linking.canOpenURL(url);

    await Linking.openURL(url);
    // if (supported) {
    //   await Linking.openURL(url);
    // } else {
    //   Alert.alert(
    //     "Error in Call Button",
    //     "Dialer not supported on this device!"
    //   );
    // }
  };

  return (
    <TouchableWithoutFeedback
      disabled={isDisabled || disabled}
      onPressIn={handlePress}
    >
      <View style={styles.container}>
        <LottieView
          ref={animationRef}
          source={require("../assets/animations/rippleBtn.json")}
          style={styles.animation}
          autoPlay={false}
          loop={false}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CallButton;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: 200,
    height: 200,
  },
});
