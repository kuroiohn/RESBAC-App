// components/BarangayDropdown.jsx
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

const streets = [
  { label: "Ampalaya Street", value: "Ampalaya Street" },
  { label: "Angel Santos Street", value: "Angel Santos Street" },
  { label: "Bagong Farmers Avenue 1", value: "Bagong Farmers Avenue 1" },
  { label: "Bagong Farmers Avenue 2", value: "Bagong Farmers Avenue 2" },
  { label: "Banner Street", value: "Banner Street" },
  { label: "Camia Street", value: "Camia Street" },
  { label: "Cattleya Street", value: "Cattleya Street" },
  { label: "Crescent Street", value: "Crescent Street" },
  { label: "Daisy Street", value: "Daisy Street" },
  { label: "Ilaw Street", value: "Ilaw Street" },
  { label: "Jasmin Street", value: "Jasmin Street" },
  { label: "Jewelmark Street", value: "Jewelmark Street" },
  { label: "Katipunan Street", value: "Katipunan Street" },
  { label: "Kangkong Street", value: "Kangkong Street" },
  { label: "Labanos Street", value: "Labanos Street" },
  { label: "Lacewing Street", value: "Lacewing Street" },
  { label: "Liwanag Street Area", value: "Liwanag Street Area" },
  { label: "Lower Pipino Street", value: "Lower Pipino Street" },
  { label: "Mais Street", value: "Mais Street" },
  { label: "Malunggay Street", value: "Malunggay Street" },
  { label: "Mil Flores Street", value: "Mil Flores Street" },
  { label: "Monggo Street", value: "Monggo Street" },
  { label: "Monarch Street", value: "Monarch Street" },
  { label: "Moscow Street", value: "Moscow Street" },
  { label: "Okra Street", value: "Okra Street" },
  { label: "Old Barangay", value: "Old Barangay" },
  {
    label: "Palay Street",
    value: "Palay Street",
  },
  { label: "Pipino Street", value: "Pipino Street" },
  { label: "Road 1", value: "Road 1" },
  { label: "Road 2", value: "Road 2" },
  { label: "Road 3", value: "Road 3" },
  { label: "Road 4", value: "Road 4" },
  { label: "Road 5", value: "Road 5" },
  { label: "Road Dike", value: "Road Dike" },
  { label: "Silverdrop Street", value: "Silverdrop Street" },
  { label: "Singkamas Street", value: "Singkamas Street" },
  { label: "Sunkist Street", value: "Sunkist Street" },
  { label: "Swallowtail Street", value: "Swallowtail Street" },
  { label: "Talong Street", value: "Talong Street" },
  { label: "Upo Street", value: "Upo Street" },
];

const StreetDropdown = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={streets}
      setOpen={setOpen}
      setValue={(callback) => {
        const newValue = callback(value);
        onChange(newValue);
      }}
      placeholder='Select Street'
      disabled={disabled}
      listMode='SCROLLVIEW'
      scrollViewProps={{
        contentContainerStyle: {
          paddingBottom: 20,
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
    width: "95%",
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

export default StreetDropdown;
