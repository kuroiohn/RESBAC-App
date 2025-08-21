import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Button } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUser } from "../../hooks/useUser";
import supabase from "../../contexts/supabaseClient";
import profilePic from "../../assets/sohee.jpg";
import Spacer from "../../components/Spacer"

const Profile = () => {
  const { user, logout } = useUser();
  
  // debug (ata, if this makes sense)
  console.log('Profile component - user state:', user);
  console.log('Profile component - user exists:', !!user);
  console.log('Profile component - user ID:', user?.id);
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    console.log('Profile useEffect triggered')
    console.log('Current user from context:', user)
    
    const checkSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            console.log('Current session:', session)
            console.log('Session error:', error)
            
            if (session && session.user) {
                console.log('Session user ID:', session.user.id)
                await fetchUserProfile(session.user)
            } else {
                console.log('No active session found')
                setLoading(false)
            }
        } catch (error) {
            console.error('Error checking session:', error)
            setLoading(false)
        }
    }
    
    if (user) {
        checkSession()
    } else {
        console.log('No user in context, not fetching profile')
        setLoading(false)
    }
  }, [user]);

  const fetchUserProfile = async (authUser = user) => {
    if (!authUser) {
      console.log('No auth user provided to fetchUserProfile')
      setLoading(false);
      return;
    }

    try {
      console.log('Auth user ID:', authUser.id)
      console.log('Querying database for userID:', authUser.id)

      // Fetch user profile data without joins to avoid relationship errors
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('userID', authUser.id)
        .single();

      console.log('Query result:', data)
      console.log('Query error:', error)

      if (error) {
        console.error('Error fetching user profile:', error);
        // Use basic user data from auth if profile fetch fails
        const fallbackData = {
          fullName: authUser.user_metadata?.name || authUser.email?.split('@')[0] || "User",
          email: authUser.email,
          photoUrl: profilePic,
          verified: authUser.email_confirmed_at ? true : false,
          created: new Date(authUser.created_at).toLocaleDateString(),
          addressLine1: "",
          addressLine2: "",
          contactNumber: "",
          age: "",
          emergencyContact: "",
          barangay: "",
          vulnerability: "None",
          guardianName: "",
          guardianRelationship: "",
          guardianContact: "",
          guardianAddress: "",
        };
        
        setUserData(fallbackData);
        setEditedUser(fallbackData);
      } else {
        // Map database fields to display format
        const fullName = `${data.firstName || ''} ${data.middleName || ''} ${data.surname || ''}`.trim();
        
        const profileData = {
          fullName: fullName || authUser.email?.split('@')[0] || "User",
          email: authUser.email,
          photoUrl: profilePic,
          verified: authUser.email_confirmed_at ? true : false,
          created: new Date(authUser.created_at).toLocaleDateString(),
          addressLine1: "Address data available", // Placeholder since we're not joining
          addressLine2: "",
          contactNumber: data.userNumber || "",
          age: data.age || "",
          emergencyContact: "", // Not in current schema
          barangay: "", // Would need to fetch from address table
          vulnerability: "Data available", // Would need to fetch from vulnerability tables
          guardianName: "", // Would need to fetch from guardian table
          guardianRelationship: "",
          guardianContact: "",
          guardianAddress: "",
        };
        
        setUserData(profileData);
        setEditedUser(profileData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      Alert.alert(
        "Save Changes?",
        "Do you want to save your changes?",
        [
          {
            text: "Cancel",
            onPress: () => setEditedUser(userData),
            style: "cancel",
          },
          {
            text: "Save",
            onPress: saveChanges,
          },
        ]
      );
    } else {
      setEditedUser(userData);
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = async () => {
    try {
      Alert.alert("Info", "Profile updates require backend API implementation due to normalized database structure. Please contact your development team.");
      
      setUserData(editedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
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
        value={value || ""}
        editable={isEditing && editable}
        onChangeText={(text) => editable && updateField(field, text)}
      />
    </View>
  );

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      Alert.alert("Error", "New password and confirm password do not match!");
      return;
    }
    
    if (passwords.new.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long!");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      Alert.alert("Success", "Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
      setShowPasswordModal(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: logout,
          style: "destructive" 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!user || !userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Please log in to view your profile</Text>
        <Text style={{ marginTop: 10, color: '#666' }}>
          User: {user ? 'Found' : 'Missing'} | Data: {userData ? 'Found' : 'Missing'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={userData.photoUrl} style={styles.photo} />
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, userData.verified ? styles.safe : styles.pending]}>
            {userData.verified ? "Verified" : "Pending Verification"}{" "}
            {userData.verified && <Feather name="check-circle" size={16} color="#007bff" />}
          </Text>
          <Text style={styles.fullName}>{userData.fullName}</Text>
          <Text style={styles.address}>{userData.addressLine1}</Text>
          <Text style={styles.address}>{userData.addressLine2}</Text>
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
            <TextInput style={[styles.input, styles.disabledInput]} value={editedUser.age?.toString() || ""} editable={false} />
          </View>
        </View>
        <View style={styles.row}>
          {renderField("emergencyContact", "Emergency Contact", editedUser.emergencyContact)}
          <View style={styles.rowItem}>
            <Text style={styles.label}>Barangay</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={editedUser.barangay || ""} editable={false} />
          </View>
        </View>
        <View style={styles.row}>{renderField("email", "Email", editedUser.email, false)}</View>
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
        <View style={styles.row}>{renderField("created", "Created", userData.created, false)}</View>
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

      {/* Logout Button */}
      <TouchableOpacity style={[styles.editButton, { backgroundColor: "#dc3545", alignSelf: 'center', marginTop: 10 }]} onPress={handleLogout}>
        <Feather name="log-out" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Logout</Text>
      </TouchableOpacity>

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
