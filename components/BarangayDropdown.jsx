// components/BarangayDropdown.jsx
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

const barangays = [
  // { label: "Kalumpang", value: "Kalumpang" },
  // { label: "Barangka", value: "Barangka" },
  // { label: "Tañong", value: "Tañong" },
  // { label: "Jesus Dela Peña", value: "Jesus Dela Peña" },
  // { label: "I.V.C.", value: "I.V.C." },
  // { label: "San Roque", value: "San Roque" },
  // { label: "Sta. Elena", value: "Sta. Elena" },
  // { label: "Sto. Niño", value: "Sto. Niño" },
  // { label: "Malanday", value: "Malanday" },
  // { label: "Concepcion I", value: "Concepcion I" },
  // { label: "Marikina Heights", value: "Marikina Heights" },
  // { label: "Parang", value: "Parang" },
  // { label: "Nangka", value: "Nangka" },
  // { label: "Concepcion II", value: "Concepcion II" },
  // { label: "Fortune", value: "Fortune" },
  { label: "Tumana", value: "Tumana" },
];

const BarangayDropdown = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={barangays}
      setOpen={setOpen}
      setValue={(callback) => {
        const newValue = callback(value);
        onChange(newValue);
      }}
      placeholder='Select Barangay'
      disabled={disabled}
      listMode='MODAL'
      scrollViewProps={{
        contentContainerStyle: {
          paddingBottom: 20,
        },
      }}
      style={styles.dropdown}
      containerStyle={[styles.container]}
      textStyle={styles.text}
      dropDownContainerStyle={styles.dropDownContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: "95%",
    marginBottom: 10,
    zIndex: 4000, // Lower than street
    elevation: 4000,
  },
  dropdown: {
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: Colors.secondary,
  },
  text: {
    color: "#000",
  },
  dropDownContainer: {
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 45,
  },
});

export default BarangayDropdown;
