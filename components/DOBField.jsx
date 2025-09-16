import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  Modal,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";

export default function DOBField({ value, onChange, editable }) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(
    value ? new Date(value) : new Date()
  );

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value ? new Date(value) : new Date());
    setShowPicker(false);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {editable ? (
        <Pressable
          onPress={() => setShowPicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#007bff",
            backgroundColor: "#e6f0ff",
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 8,
            height: 45,
          }}
        >
          <MaterialIcons
            name='calendar-today'
            size={20}
            color='#3b82f6'
            style={{ marginRight: 8 }}
          />
          <Text style={{ flex: 1, color: value ? "black" : "#9ca3af" }}>
            {value ? new Date(value).toLocaleDateString() : "Select date"}
          </Text>
        </Pressable>
      ) : (
        <Text>{value ? new Date(value).toLocaleDateString() : "—"}</Text>
      )}

      {/* iOS modal popup */}
      {showPicker && Platform.OS === "ios" && (
        <Modal
          visible={showPicker}
          transparent
          animationType='slide'
          onRequestClose={handleCancel}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                padding: 16,
              }}
            >
              <DateTimePicker
                value={tempDate}
                mode='date'
                display='spinner'
                minimumDate={new Date(1900, 0, 1)}
                onChange={(e, selected) => setTempDate(selected || tempDate)}
                style={{ width: "100%", height: 220 }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={{ color: "#888", fontSize: 16, padding: 20 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={{ color: "#0060ff", fontSize: 16, padding: 20 }}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android default popup */}
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode='date'
          display='default'
          minimumDate={new Date(1900, 0, 1)}
          onChange={(e, selected) => {
            setShowPicker(false);
            if (selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
}
