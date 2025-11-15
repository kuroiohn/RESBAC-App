// components/BarangayDropdown.jsx
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

const streets = [
{ label: "Ampalaya", value: "Ampalaya" },
{ label: "Angel Santos / A. Santos", value: "Angel Santos / A. Santos" },
{ label: "Apple", value: "Apple" },
{ label: "Bagong Farmers 1", value: "Bagong Farmers 1" },
{ label: "Bagong Farmers 2", value: "Bagong Farmers 2" },
{ label: "Banner", value: "Banner" },
{ label: "Brazil", value: "Brazil" },
{ label: "Bulalakaw", value: "Bulalakaw" },
{ label: "Bukang Liwayway", value: "Bukang Liwayway" },
{ label: "Cattleya", value: "Cattleya" },
{ label: "Cherry", value: "Cherry" },
{ label: "Crescent", value: "Crescent" },
{ label: "Daisy", value: "Daisy" },
{ label: "Damayan Alley", value: "Damayan Alley" },
{ label: "Del Rosario", value: "Del Rosario" },
{ label: "Denmark", value: "Denmark" },
{ label: "Farmers 2", value: "Farmers 2" },
{ label: "Ilaw", value: "Ilaw" },
{ label: "Iwahig", value: "Iwahig" },
{ label: "Jasmin", value: "Jasmin" },
{ label: "Jewelmark", value: "Jewelmark" },
{ label: "Kalamansi", value: "Kalamansi" },
{ label: "Kalabasa", value: "Kalabasa" },
{ label: "Kamias", value: "Kamias" },
{ label: "Kangkong", value: "Kangkong" },
{ label: "Katipunan", value: "Katipunan" },
{ label: "Kislap", value: "Kislap" },
{ label: "Kutitap", value: "Kutitap" },
{ label: "Labanos", value: "Labanos" },
{ label: "Lacewing", value: "Lacewing" },
{ label: "Liwanag", value: "Liwanag" },
{ label: "Mais", value: "Mais" },
{ label: "Malunggay", value: "Malunggay" },
{ label: "Milflores", value: "Milflores" },
{ label: "Monggo", value: "Monggo" },
{ label: "Monaco", value: "Monaco" },
{ label: "Monarch", value: "Monarch" },
{ label: "Mustasa", value: "Mustasa" },
{ label: "Moscow", value: "Moscow" },
{ label: "Nova Scotia", value: "Nova Scotia" },
{ label: "Okra", value: "Okra" },
{ label: "Orange", value: "Orange" },
{ label: "Palay", value: "Palay" },
{ label: "Panganiban", value: "Panganiban" },
{ label: "Patola", value: "Patola" },
{ label: "Pechay", value: "Pechay" },
{ label: "Piling Santos", value: "Piling Santos" },
{ label: "Pipino", value: "Pipino" },
{ label: "Road 1", value: "Road 1" },
{ label: "Road 2", value: "Road 2" },
{ label: "Road 3", value: "Road 3" },
{ label: "Road 4", value: "Road 4" },
{ label: "Road 5", value: "Road 5" },
{ label: "Road Dike", value: "Road Dike" },
{ label: "Singkamas", value: "Singkamas" },
{ label: "Sitaw", value: "Sitaw" },
{ label: "Silverdrop", value: "Silverdrop" },
{ label: "Sinag", value: "Sinag" },
{ label: "Sinagtala", value: "Sinagtala" },
{ label: "Sunkist", value: "Sunkist" },
{ label: "Swallowtail", value: "Swallowtail" },
{ label: "Talong", value: "Talong" },
{ label: "Upo", value: "Upo" },
{ label: "Vergara", value: "Vergara" }
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
      listMode='MODAL'
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
    zIndex: 5000, // Street dropdown higher
    elevation: 5000,
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
