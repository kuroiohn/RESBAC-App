import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons"; // or react-native-vector-icons

export default function DOBField({ label, value, onChange, editable }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split("T")[0]); // YYYY-MM-DD
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 4 }}>{label}</Text>
      {editable ? (
        <Pressable
          onPress={() => setShowPicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#3b82f6", // blue border
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        >
          <MaterialIcons
            name='calendar-today'
            size={20}
            color='#3b82f6'
            style={{ marginRight: 8 }}
          />
          <Text style={{ flex: 1, color: value ? "black" : "#9ca3af" }}>
            {value || "Select date"}
          </Text>
        </Pressable>
      ) : (
        <Text>{value || "—"}</Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode='date'
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date(1900, 0, 1)}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
