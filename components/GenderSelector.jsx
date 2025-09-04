import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

// Destructure 'placeholder' from props
const GenderSelector = ({ value, onChange, placeholder, disable }) => {
  const data = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, disable && styles.disabledDropdown]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={[
          styles.selectedTextStyle,
          disable && styles.disabledSelectedTextStyle,
        ]}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField='label'
        valueField='value'
        // Use the passed-in placeholder prop
        placeholder={placeholder || "Select Sex"} // Provide a default if prop is not passed
        value={value}
        onChange={(item) => {
          onChange(item.value);
        }}
        disable={disable}
      />
    </View>
  );
};

export default GenderSelector;

const styles = StyleSheet.create({
  container: {
    width: "80%",
    alignSelf: "center",
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F5F5F5",
    zIndex: 10,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#999", // A common, soft gray for placeholders.
    marginLeft: 10,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#000",
    marginLeft: 10,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    marginLeft: 10,
  },
  disabledDropdown: {
    backgroundColor: "#f0f0f0", // A light grey background
    borderColor: "#e0e0e0", // A lighter border color
  },
  disabledSelectedTextStyle: {
    color: "#a0a0a0", // A lighter text color
  },
});
