import React from "react";
import { Text, StyleSheet } from "react-native";
import { useAccessibility } from "../contexts/AccessibilityContext";

export default function AppText({ children, style, ...props }) {
  const { fontScale } = useAccessibility();

  // Safely convert style to a plain object
  const flatStyle = StyleSheet.flatten(style) || {};

  const baseFontSize = flatStyle.fontSize || 16;
  console.log("fontScale:", fontScale);

  return (
    <Text style={[style, { fontSize: baseFontSize * fontScale }]} {...props}>
      {children}
    </Text>
  );
}
