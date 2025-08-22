import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Button } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUser } from "../../hooks/useUser";
import supabase from "../../contexts/supabaseClient";
import profilePic from "../../assets/sohee.jpg";
import Spacer from "../../components/Spacer"
import { useQuery,useQueryClient } from '@tanstack/react-query'


const Profile = () => {
  const { user, logout } = useUser();
  
  // debug (ata, if this makes sense)
  console.log('Profile component - user state:', user);
  console.log('Profile component - user exists:', !!user);
  console.log('Profile component - user ID:', user?.id);
  
  const [userData, setUserData] = useState({
    // the following are the only columns that the user will edit in the profile tab
    firstName:"",
    middleName:"",
    surname:"",
    //dob:"",
    age:0,
    mpin:"",
    userNumber:"",
    householdSize:0,
    addressID:0,
    hasGuardian:false,
    guardianID:0,
    vulnerabilityID:0,
    verificationID:0,
    userID:"",
    email:"",
    isVerified:false
  });
  const [userAddress,setUserAddress] = useState({
    streetName:"",
    brgyName:"",
    cityName:"",
    geolocationCoords:"",
    userID:""
  })
  const [userGuardian,setUserGuardian] = useState({
    fullName: "",
    relationship:"",
    guardianContact:"",
    guardianAddress:"",
    userID:""
  })
  const [userVul,setUserVul] = useState({
    elderly: false,
    pregnantInfant: [],
    physicalPWD: [],
    psychPWD: [],
    sensoryPWD: [],
    medDep: [],
    locationRiskLevel:"",
    userID:""
  })
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  // useEffect(() => {
  //   console.log('Profile useEffect triggered')
  //   console.log('Current user from context:', user)
    
  //   const checkSession = async () => {
  //       try {
  //           const { data: { session }, error } = await supabase.auth.getSession()
  //           console.log('Current session:', session)
  //           console.log('Session error:', error)
            
  //           if (session && session.user) {
  //               console.log('Session user ID:', session.user.id)
  //               await fetchData()
  //           } else {
  //               console.log('No active session found')
  //               setLoading(false)
  //           }
  //       } catch (error) {
  //           console.error('Error checking session:', error)
  //           setLoading(false)
  //       }
  //   }
    
  //   if (user) {
  //       checkSession()
  //   } else {
  //       console.log('No user in context, not fetching profile')
  //       setLoading(false)
  //   }
  // }, [user]);

  //reads from supabase
  
  const fetchUserData = async () => {
    // Get the current logged in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching in getUser:", userError);
      throw new Error("No active session / user");
    }

    const {data,error} = await supabase
    .from('user')
    .select(`*,
      verification:verification(isVerified)`
    )
    .eq('userID', user.id)
    .single()

    if(error){
      console.error("Fetch error in user table: ", error)
    }
    console.log("Successful fetch",  data);
    return {...data,
      email: user.email,
      isVerified: data.verification?.isVerified
    }

  }
  const {data: profileData,isPending,isError,error, refetch} = useQuery({
    queryKey: ["user"],
    queryFn: fetchUserData,
  })
  if(error){
    console.error("Error in fetching user table: ", error);
  }

  // checks if session exists thru isPending 
  useEffect(()=>{
    setLoading(isPending)
  },[isPending])
  // assigns values from profileData to useState
  useEffect(()=>{
    if(profileData){
      setUserData({
        firstName: profileData.firstName || "",
        middleName: profileData.middleName || "",
        surname: profileData.surname || "",
        //dob: profileData.dob || "",
        age: profileData.age || 0,
        mpin: profileData.mpin || "",
        userNumber: profileData.userNumber || "",
        householdSize: profileData.householdSize || 0,
        addressID: profileData.addressID || 0,
        hasGuardian: profileData.hasGuardian || false,
        guardianID: profileData.guardianID || 0,
        vulnerabilityID: profileData.vulnerabilityID || 0,
        verificationID: profileData.verificationID || 0,
        userID: profileData.userID || "",
        email: profileData.email,
        isVerified: profileData.isVerified
      })
    }
  },[profileData])
  {console.log("ISVerified:",userData.isVerified)   }

  const fetchAddressData = async () => {
    // Get the current logged in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const {data,error} = await supabase
    .from('address')
    .select('*')
    .eq('userID', user.id)
    .single()

    if(error){
      console.error("Fetch error in address table: ", error)
    }
    console.log("Successful fetch",  data);
    return data
  }
  const {data: addressData,error:addressError} = useQuery({
    queryKey: ["address"],
    queryFn: fetchAddressData,
  })
  if(addressError){
    console.error("Error in fetching address table: ", addressError);
  }
  useEffect(()=>{
    if(addressData){
      setUserAddress({
        streetName: addressData.streetName || "",
        brgyName: addressData.brgyName || "",
        cityName: addressData.cityName || "",
        geolocationCoords: addressData.geolocationCoords || "",
        userID: addressData.userID || ""
      })
    }
  },[addressData])

  const fetchGuardianData = async () => {
    // Get the current logged in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const {data,error} = await supabase
    .from('guardian')
    .select('*')
    .eq('userID', user.id)
    //.single()

    if(error){
      console.error("Fetch error in guardian table: ", error)
    }
    console.log("Successful fetch",  data);
    return data
  }
  const {data: guardianData,error:guardianError} = useQuery({
    queryKey: ["guardian"],
    queryFn: fetchGuardianData,
    enabled: userData?.hasGuardian === true
  })
  if(guardianError){
    console.error("Error in fetching guardian table: ", addressError);
  }
  useEffect(()=>{
    if(guardianData){
      setUserGuardian({
        fullName: guardianData.fullName || "",
        relationship: guardianData.relationship || "",
        guardianContact: guardianData.guardianContact || "",
        guardianAddress: guardianData.guardianAddress || "",
        userID: guardianData.userID || ""
      })
    }
  },[guardianData])

  const fetchVulData = async () => {
    // Get the current logged in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const {data,error} = await supabase
    .from('vulnerabilityList')
    .select('*')
    .eq('userID', user.id)
    .single()

    if(error){
      console.error("Fetch error in vulList table: ", error)
    }
    console.log("Successful fetch",  data);
    return data
  }
  const {data: vulListData,error:vulListError} = useQuery({
    queryKey: ["vulnerabilityList"],
    queryFn: fetchVulData,
  })
  if(vulListError){
    console.error("Error in fetching vulList table: ", addressError);
  }
  useEffect(()=>{
    if(vulListData){
      setUserVul({
        elderly: vulListData.elderly ?? false,
        pregnantInfant: vulListData.pregnantInfant ?? [],
        physicalPWD: vulListData.physicalPWD ?? [],
        psychPWD: vulListData.psychPWD ?? [],
        sensoryPWD: vulListData.sensoryPWD ?? [],
        medDep: vulListData.medDep ?? [],
        locationRiskLevel: vulListData.locationRiskLevel ?? "None",
        userID: vulListData.userID || ""
      })
    }
  },[vulListData])

  console.log(userVul);
  
  // const fetchUserProfile = async (authUser = user) => {
  //   if (!authUser) {
  //     console.log('No auth user provided to fetchUserProfile')
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     console.log('Auth user ID:', authUser.id)
  //     console.log('Querying database for userID:', authUser.id)

  //     // Fetch user profile data without joins to avoid relationship errors
  //     const { data, error } = await supabase
  //       .from('user')
  //       .select('*')
  //       .eq('userID', authUser.id)
  //       .maybeSingle();

  //     console.log('Query result:', data)
  //     console.log('Query error:', error)

  //     if (error) {
  //       console.error('Error fetching user profile:', error);
  //       console.log("Error in profile");
        
  //       // Use basic user data from auth if profile fetch fails
  //       const fallbackData = {
  //         fullName: authUser.user_metadata?.name || authUser.email?.split('@')[0] || "User",
  //         email: authUser.email,
  //         photoUrl: profilePic,
  //         verified: authUser.email_confirmed_at ? true : false,
  //         created: new Date(authUser.created_at).toLocaleDateString(),
  //         addressLine1: "",
  //         addressLine2: "",
  //         contactNumber: "",
  //         age: "",
  //         emergencyContact: "",
  //         barangay: "",
  //         vulnerability: "None",
  //         guardianName: "",
  //         guardianRelationship: "",
  //         guardianContact: "",
  //         guardianAddress: "",
  //       };
        
  //       setUserData(fallbackData);
  //       setEditedUser(fallbackData);
  //     } else {
  //       console.log("fetch successful!");
        
  //       // Map database fields to display format
  //       const fullName = `${data.firstName || ''} ${data.middleName || ''} ${data.surname || ''}`.trim();
        
  //       const profileData = {
  //         fullName: fullName || authUser.email?.split('@')[0] || "User",
  //         email: authUser.email,
  //         photoUrl: profilePic,
  //         verified: authUser.email_confirmed_at ? true : false,
  //         created: new Date(authUser.created_at).toLocaleDateString(),
  //         addressLine1: "Address data available", // Placeholder since we're not joining
  //         addressLine2: "",
  //         contactNumber: data.userNumber || "",
  //         age: data.age || "",
  //         emergencyContact: "", // Not in current schema
  //         barangay: "", // Would need to fetch from address table
  //         vulnerability: "Data available", // Would need to fetch from vulnerability tables
  //         guardianName: "", // Would need to fetch from guardian table
  //         guardianRelationship: "",
  //         guardianContact: "",
  //         guardianAddress: "",
  //       };
        
  //       setUserData(profileData);
  //       setEditedUser(profileData);
  //     }
  //   } catch (error) {
  //     console.error('Error in fetchUserProfile:', error);
  //     setLoading(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      
      //setUserData(editedUser);
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
        {/* USER PROFILE PICTURE */}
        <Image source={profilePic} style={styles.photo} />
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, userData.isVerified ? styles.safe : styles.pending]}>
            {userData.isVerified ? "Verified" : "Pending Verification"}{" "}
            {userData.isVerified && <Feather name="check-circle" size={16} color="#007bff" />}
          </Text>
          <Text style={styles.fullName}>
            {userData.firstName.charAt(0).toUpperCase()+userData.firstName.slice(1)}
            {userData.middleName === "" &&
          (" " + userData.middleName.charAt(0).toUpperCase()+userData.middleName.slice(1))}
            {userData.surname.charAt(0).toUpperCase()+userData.surname.slice(1)}</Text>
          <Text style={styles.address}>
            {userAddress.streetName.charAt(0).toUpperCase()+userAddress.streetName.slice(1)}, 
            {" " + userAddress.brgyName.charAt(0).toUpperCase()+userAddress.brgyName.slice(1)}, 
            {" " + userAddress.cityName.charAt(0).toUpperCase()+userAddress.cityName.slice(1)} City</Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          {renderField("contactNumber", "Contact Number", userData.userNumber)}
          <View style={styles.rowItem}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={userData.age?.toString() || ""} editable={false} />
          </View>
        <View style={styles.row}>{renderField("householdSize", "Household Size", userData.householdSize.toString(), false)}</View>
        </View>
        <View style={styles.row}>
          {/* {renderField("emergencyContact", "Emergency Contact", userData.emergencyContact)} */}
          <View style={styles.rowItem}>
            <Text style={styles.label}>Barangay</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={userAddress.brgyName || ""} editable={false} />
          </View>
        </View>
        <View style={styles.row}>{renderField("email", "Email", userData.email, false)}</View>
        {/* <View style={styles.row}>{renderField("vulnerability", "Vulnerability", userData.vulnerability, false)}</View> */}
      </View>
      
      { userData.hasGuardian === true &&
        (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guardian Information</Text>
            <View style={styles.divider} />
            <View style={styles.row}>
              {renderField("guardianName", "Name", userGuardian.fullName)}
              {renderField("guardianRelationship", "Relationship", userGuardian.relationship)}
            </View>
            <View style={styles.row}>{renderField("guardianContact", "Contact", userGuardian.guardianContact)}</View>
            <View style={styles.row}>{renderField("guardianAddress", "Address", userGuardian.guardianAddress)}</View>
          </View> 
        )
      }

      <View style={styles.row}>{renderField("elderly", "Age-related", userVul.elderly.toString(), false)}</View>
      <View style={styles.row}>{renderField("pregnantInfant", "Pregnant/Infant", userVul.pregnantInfant.toString(), false)}</View>

      <View style={styles.row}>{renderField("physicalPWD", "Physical Disability", userVul.physicalPWD.toString(), false)}</View>
      <View style={styles.row}>{renderField("psychPWD", "Psychological Disability", userVul.psychPWD.toString(), false)}</View>
      <View style={styles.row}>{renderField("sensoryPWD", "Sensory Disability", userVul.sensoryPWD.toString(), false)}</View>

      <View style={styles.row}>{renderField("medDep", "Medically Dependent", userVul.medDep.toString(), false)}</View>
      <View style={styles.row}>{renderField("locationRiskLevel", "Location Risk Level", userVul.locationRiskLevel.toString(), false)}</View>

      {/* 
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.divider} />
        <View style={styles.row}>{renderField("created", "Created", userData.created, false)}</View>
      </View>     

        */}


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
