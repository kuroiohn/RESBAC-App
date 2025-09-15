import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

const CheckboxComponent = ({ label, isChecked, onValueChange, style }) => {
  return (
    // Pass the style prop to the top-level View
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => onValueChange(!isChecked)}
      >
        <View
          style={[styles.checkboxSquare, isChecked && styles.checkboxChecked]}
        >
          {isChecked && <View style={styles.checkedIndicator} />}
        </View>
        <Text style={styles.optionText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    borderColor: "#ccc",
    width: "100%",
  },
  checkboxSquare: {
    height: 11,
    width: 11,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  checkedIndicator: {
    height: 10,
    width: 10,
    backgroundColor: "#1279D7",
  },
  optionText: {
    marginLeft: 10,
    fontSize: 14,
  },
});

export default CheckboxComponent;
