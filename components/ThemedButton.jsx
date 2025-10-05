import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/Colors";

function ThemedButton({ style, children, ...props }) {
  return (
    <Pressable style={styles.wrapper} {...props}>
      {({ pressed }) => (
        <LinearGradient
          colors={
            pressed
              ? ["#003a99", "#0052e0"] // darker blue when pressed
              : ["#0047cc", Colors.primary] // normal subtle gradient
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, style]}
        >
          {typeof children === "string" ? (
            <Text style={styles.text}>{children}</Text>
          ) : (
            children
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "88%",
    marginVertical: 5,
    borderRadius: 7,
    overflow: "hidden", // keeps gradient & ripple inside rounded corners
  },
  btn: {
    padding: 15,
    alignItems: "center",
    borderRadius: 7,
  },
  text: {
    color: "#f2f2f2",
    fontWeight: "600",
  },
});

export default ThemedButton;
