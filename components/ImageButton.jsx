import React, { useState } from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";

import Logo from "../assets/EmerGuideBtn.png";
import LogoPressed from "../assets/EmerGuideBtnPressed.png";

const ImageButton = ({ onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={styles.buttonContainer}
    >
      <Image source={isPressed ? LogoPressed : Logo} style={styles.image} />
    </TouchableOpacity>
  );
};

export default ImageButton;

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  image: {
    width: "100%",
    height: 69,
    resizeMode: "contain",
  },
});
