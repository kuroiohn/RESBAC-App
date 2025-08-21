import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Button } from "react-native";
import { Feather } from "@expo/vector-icons";
import profilePic from "../../assets/sohee.jpg";
import Spacer from "../../components/Spacer"

const dummyUser = {
  fullName: "Lee So Hee",
  photoUrl: profilePic,
  verified: true,
  addressLine1: "Munggo Main St",
  addressLine2: "123 Block",
  contactNumber: "09123456789",
  age: 28,
  emergencyContact: "09987654321",
  barangay: "Barangay tumana",
  email: "sohee@gmail.com",
  vulnerability: "None",
  created: "2025-08-21",
  guardianName: "John Martin",
  guardianRelationship: "Bestie",
  guardianContact: "09876543210",
  guardianAddress: "456 Guardian St",
};

const Profile = () => {
  const [user, setUser] = useState(dummyUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const toggleEdit = () => {
    if (isEditing) {
      Alert.alert(
        "Save Changes?",
        "Do you want to save your changes?",
        [
          {
            text: "Cancel",
            onPress: () => setEditedUser(user),
            style: "cancel",
          },
          {
            text: "Save",
            onPress: () => setUser(editedUser),
          },
        ]
      );
    }
    setIsEditing(!isEditing);
  };

  const updateField = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const renderField = (field, label, value, editable = true) => (
    <View style={styles.rowItem}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          editable ? (isEditing ? styles.editableInput : styles.disabledInput) : styles.disabledInput,
        ]}
        value={value}
        editable={isEditing && editable}
        onChangeText={(text) => editable && updateField(field, text)}
      />
    </View>
  );

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      Alert.alert("Error", "New password and confirm password do not match!");
      return;
    }
    // Here you would handle password update logic
    Alert.alert("Success", "Password changed successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
    setShowPasswordModal(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={user.photoUrl} style={styles.photo} />
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, user.verified ? styles.safe : styles.pending]}>
            {user.verified ? "Verified" : "Pending Verification"}{" "}
            {user.verified && <Feather name="check-circle" size={16} color="#007bff" />}
          </Text>
          <Text style={styles.fullName}>{user.fullName}</Text>
          <Text style={styles.address}>{user.addressLine1}</Text>
          <Text style={styles.address}>{user.addressLine2}</Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          {renderField("contactNumber", "Contact Number", editedUser.contactNumber)}
          <View style={styles.rowItem}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={editedUser.age.toString()} editable={false} />
          </View>
        </View>
        <View style={styles.row}>
          {renderField("emergencyContact", "Emergency Contact", editedUser.emergencyContact)}
          <View style={styles.rowItem}>
            <Text style={styles.label}>Barangay</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={editedUser.barangay} editable={false} />
          </View>
        </View>
        <View style={styles.row}>{renderField("email", "Email", editedUser.email)}</View>
        <View style={styles.row}>{renderField("vulnerability", "Vulnerability", editedUser.vulnerability, false)}</View>
      </View>

      {/* Guardian Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guardian Information</Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          {renderField("guardianName", "Name", editedUser.guardianName)}
          {renderField("guardianRelationship", "Relationship", editedUser.guardianRelationship)}
        </View>
        <View style={styles.row}>{renderField("guardianContact", "Contact", editedUser.guardianContact)}</View>
        <View style={styles.row}>{renderField("guardianAddress", "Address", editedUser.guardianAddress)}</View>
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.divider} />
        <View style={styles.row}>{renderField("created", "Created", editedUser.created, false)}</View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: isEditing ? "#28a745" : "#007bff" }]} onPress={toggleEdit}>
          <Feather name={isEditing ? "check" : "edit"} size={20} color="#fff" />
          <Text style={styles.editButtonText}>{isEditing ? "Save Changes" : "Edit Profile"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: "#6c757d" }]} onPress={() => setShowPasswordModal(true)}>
          <Feather name="lock" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <Spacer height={10} />
            <TextInput
              placeholder="Current Password"
              style={styles.input}
              secureTextEntry
              value={passwords.current}
              onChangeText={(text) => setPasswords((p) => ({ ...p, current: text }))}
            />
            <Spacer height={22} />
            <TextInput
              placeholder="New Password"
              style={styles.input}
              secureTextEntry
              value={passwords.new}
              onChangeText={(text) => setPasswords((p) => ({ ...p, new: text }))}
            />
            <Spacer height={22} />
            <TextInput
              placeholder="Confirm New Password"
              style={styles.input}
              secureTextEntry
              value={passwords.confirm}
              onChangeText={(text) => setPasswords((p) => ({ ...p, confirm: text }))}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
              <Button title="Cancel" onPress={() => setShowPasswordModal(false)} />
              <Button title="Save" onPress={handleChangePassword} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 22,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  fullName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  safe: { color: "#007bff" },
  pending: { color: "#EB3A32" },
  address: { fontSize: 15, color: "#555" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#007bff" },
  divider: { height: 1, backgroundColor: "#007bff", marginVertical: 8 },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 12 },
  rowItem: { flex: 1, marginRight: 8, marginBottom: 12 },
  label: { fontSize: 12, color: "#555", marginBottom: 4 },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  editableInput: { backgroundColor: "#e6f0ff" },
  disabledInput: { backgroundColor: "#f0f0f0", color: "#555" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 20 },
  editButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  editButtonText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "85%", backgroundColor: "#fff", borderRadius: 8, padding: 20 },
});
