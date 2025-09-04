import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

const CheckboxComponent = ({ label, isChecked, onValueChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        // CHANGE: We removed the conditional style from here so the container color doesn't change.
        style={styles.optionContainer}
        onPress={() => onValueChange(!isChecked)}
      >
        {/* CHANGE: We now apply the conditional style to the checkbox square itself.
                  The checkboxChecked style is added only when `isChecked` is true.
                */}
        <View
          style={[styles.checkboxSquare, isChecked && styles.checkboxChecked]}
        >
          {/* The checked indicator is only visible when the component is checked */}
          {isChecked && <View style={styles.checkedIndicator} />}
        </View>
        <Text style={styles.optionText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "80%",
    alignSelf: "center",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    borderColor: "#ccc",
  },
  checkboxSquare: {
    height: 24,
    width: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  checkedIndicator: {
    height: 14,
    width: 14,
    backgroundColor: "#1279D7",
  },
  optionText: {
    marginLeft: 10,
    fontSize: 14,
  },
});

export default CheckboxComponent;
