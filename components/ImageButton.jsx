import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";

import Logo from "../assets/EmerGuideBtn.png";

const ImageButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.buttonContainer}
    >
      <Image source={Logo} style={styles.image} />
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
