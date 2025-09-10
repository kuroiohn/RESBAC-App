// components/BarangayDropdown.jsx
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

const barangays = [
    { label: "Barangka", value: "Barangka" },
    { label: "Calumpang", value: "Calumpang" },
    { label: "Concepcion I", value: "Concepcion I" },
    { label: "Concepcion II", value: "Concepcion II" },
    { label: "Fortune", value: "Fortune" },
    { label: "Industrial Valley Complex", value: "Industrial Valley Complex" },
    { label: "Jesus dela Peña", value: "Jesus dela Peña" },
    { label: "Malanday", value: "Malanday" },
    { label: "Marikina Heights", value: "Marikina Heights" },
    { label: "Nangka", value: "Nangka" },
    { label: "Parang", value: "Parang" },
    { label: "San Roque", value: "San Roque" },
    { label: "Santa Elena", value: "Santa Elena" },
    { label: "Santo Niño", value: "Santo Niño" },
    { label: "Tañong", value: "Tañong" },
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
                const newValue = callback(value)
                onChange(newValue)
            }}
            placeholder='Select Barangay'
            disabled={disabled}
            listMode="SCROLLVIEW"
            scrollViewProps={{
                contentContainerStyle: {
                    paddingBottom: 20
                },
            }}
            style={styles.dropdown}
            containerStyle={styles.container}
            textStyle={styles.text}
            dropDownContainerStyle={styles.dropDownContainer}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        width: "80%",
        marginBottom: 10,
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
        backgroundColor: "#fff", // Change this to white
    },
});

export default BarangayDropdown;