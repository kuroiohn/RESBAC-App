import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Button } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUser } from "../../hooks/useUser";
import supabase from "../../contexts/supabaseClient";
import profilePic from "../../assets/sohee.jpg";
import Spacer from "../../components/Spacer"
import { useQuery,useQueryClient } from '@tanstack/react-query'
import { differenceInYears } from "date-fns";


const Profile = () => {
  const { user, logout } = useUser();
  const queryClient = useQueryClient()
  
  // debug (ata, if this makes sense)
  console.log('Profile component - user state:', user);
  console.log('Profile component - user exists:', !!user);
  console.log('Profile component - user ID:', user?.id);
  
  const [userData, setUserData] = useState({
    // the following are the only columns that the user will edit in the profile tab
    firstName:"",
    middleName:"",
    surname:"",
    dob:"",
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
    // isVerified:false,
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
  const [editedUser,setEditedUser] = useState({
    userData:{...userData},
    userAddress: {...userAddress},
    userGuardian: {...userGuardian},
    userVul: {...userVul}
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  //reads from supabase
  
  const fetchUserData = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching in getUser:", userError);
      throw new Error("No active session / user");
    }

    const {data,error} = await supabase
    .from('user')
    .select('*')
    .eq('userID', user.id)
    .single()

    setUserData({
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        surname: data.surname || "",
        dob: data.dateOfBirth || "",
        age: data.age || 0,
        mpin: data.mpin || "",
        userNumber: data.userNumber || "",
        householdSize: data.householdSize || 0,
        addressID: data.addressID || 0,
        hasGuardian: data.hasGuardian || false,
        guardianID: data.guardianID || 0,
        vulnerabilityID: data.vulnerabilityID || 0,
        verificationID: data.verificationID || 0,
        userID: data.userID || "",
        email: user.email
      })
    if(error){
      console.error("Fetch error in user table: ", error)
    }
    console.log("Successful fetch",  data);
    return data

  }
  const {data: profileData,isPending,isError,error, refetch} = useQuery({
    queryKey: ["user", user?.id],
    queryFn: fetchUserData,
    enabled: !!user
  })
  if(error){
    console.error("Error in fetching user table: ", error);
  }
  console.log("profiledata email ",profileData?.email);

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
        dob: profileData.dateOfBirth || "",
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
        email: profileData.email
      })
    }
  },[user])

  console.log("USerdata email", userData.email);
  

  const fetchAddressData = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const {data,error} = await supabase
    .from('address')
    .select('*')
    .eq('userID', user.id)
    .single()

    setUserAddress({
        streetName: data.streetName || "",
        brgyName: data.brgyName || "",
        cityName: data.cityName || "",
        geolocationCoords: data.geolocationCoords || "",
        userID: data.userID || ""
      })
    
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
  },[user])
  console.log("hasGuardian: ", profileData?.hasGuardian);
  

  const fetchGuardianData = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const {data,error} = await supabase
    .from('guardian')
    .select('*')
    .eq('userID', user.id)
    .single()

    setUserGuardian({
        fullName: data.fullName || "",
        relationship: data.relationship || "",
        guardianContact: data.guardianContact || "",
        guardianAddress: data.guardianAddress || "",
        userID: data.userID || ""
      })

    if(error){
      console.error("Fetch error in guardian table: ", error)
    }
    console.log("Successful fetch",  data);
    return data
  }
  const {data: guardianData,error:guardianError} = useQuery({
    queryKey: ["guardian",profileData?.userID],
    queryFn: fetchGuardianData,
    enabled: !!profileData?.hasGuardian === true
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
  },[user])

  const fetchVulData = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const {data,error} = await supabase
    .from('vulnerabilityList')
    .select('*')
    .eq('userID', user.id)
    .single()

    setUserVul({
        elderly: data.elderly ?? false,
        pregnantInfant: data.pregnantInfant ?? [],
        physicalPWD: data.physicalPWD ?? [],
        psychPWD: data.psychPWD ?? [],
        sensoryPWD: data.sensoryPWD ?? [],
        medDep: data.medDep ?? [],
        locationRiskLevel: data.locationRiskLevel ?? "None",
        userID: data.userID || ""
      })

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
  },[user])

  console.log(userVul);

  // SUBSCRIBING TO REALTIME ON ALL TABLES ##############################
  useEffect(() => {
    if (!user?.id) return;

    // USER table subscription
    const userSub = supabase
      .channel('user-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user', filter: `userID=eq.${user.id}` },
        (payload) => {
          console.log("Realtime USER update:", payload);
          setUserData(prev => ({
            ...prev,
            ...payload.new,
            dob: payload.new.dateOfBirth ?? prev.dob
          }))
          // Re-fetch with react-query
          // refetch();
        }
      )
      .subscribe();

    // ADDRESS table subscription
    const addressSub = supabase
      .channel('address-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'address', filter: `userID=eq.${user.id}` },
        (payload) => {
          console.log("Realtime ADDRESS update:", payload);
          setUserAddress(prev => ({
            ...prev,
            ...payload.new
          }))
          // trigger react-query refetch for address
          queryClient.invalidateQueries(["address"]);
        }
      )
      .subscribe();

    // GUARDIAN table subscription
    const guardianSub = supabase
      .channel('guardian-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guardian', filter: `userID=eq.${user.id}` },
        (payload) => {
          console.log("Realtime GUARDIAN update:", payload);
          setUserGuardian(prev => ({
            ...prev,
            ...payload.new
          }))

          queryClient.invalidateQueries(["guardian", user.id]);
        }
      )
      .subscribe();

    // VULNERABILITY table subscription
    const vulSub = supabase
      .channel('vulnerability-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vulnerabilityList', filter: `userID=eq.${user.id}` },
        (payload) => {
          console.log("Realtime VUL update:", payload);
          setUserVul(prev => ({
            ...prev,
            ...payload.new
          }))
          queryClient.invalidateQueries(["vulnerabilityList"]);
        }
      )
      .subscribe();

    // cleanup on unmount
    return () => {
      supabase.removeChannel(userSub);
      supabase.removeChannel(addressSub);
      supabase.removeChannel(guardianSub);
      supabase.removeChannel(vulSub);
    };
  }, [user?.id]);


  const toggleEdit = () => {
    if (isEditing) {
      Alert.alert(
        "Save Changes?",
        "Do you want to save your changes?",
        [
          {
            text: "Cancel",
            // onPress: () => setEditedUser(userData),
            style: "cancel",
          },
          {
            text: "Save",
            onPress: saveChanges,
          },
        ]
      );
    } else {
      // setEditedUser(userData);
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = async () => {
    try {
      const newAge = differenceInYears(new Date(), new Date(userData.dob))
      // update email ################################################
      // const {error:emailError} = await supabase.auth.updateUser({
      //   email: userData.email
      // })
      // if (emailError) {
      //   console.error("Email update error", error);
      // }

      // Update user table ############################################
      await supabase.from('user').update({
        firstName: userData.firstName,
        middleName: userData.middleName,
        surname: userData.surname,
        age: newAge,
        userNumber: userData.userNumber,
        householdSize: userData.householdSize,
        hasGuardian: userData.hasGuardian
      })
      .eq('userID', user.id)
      .select()

      // Update address table ###########################################
      await supabase.from('address').update({
        streetName: userAddress.streetName,
        brgyName: userAddress.brgyName,
        cityName: userAddress.cityName,
        geolocationCoords: userAddress.geolocationCoords
      }).eq('userID', user.id);

      // Update guardian table (if exists) ##############################
      if(userData.hasGuardian){
        await supabase.from('guardian').update({
          fullName: userGuardian.fullName,
          relationship: userGuardian.relationship,
          guardianContact: userGuardian.guardianContact,
          guardianAddress: userGuardian.guardianAddress
        }).eq('userID', user.id);
      }

      // Update vulnerability table ###################################
      await supabase.from('vulnerabilityList').update({
        elderly: userVul.elderly,
        pregnantInfant: userVul.pregnantInfant,
        physicalPWD: userVul.physicalPWD,
        psychPWD: userVul.psychPWD,
        sensoryPWD: userVul.sensoryPWD,
        medDep: userVul.medDep,
        locationRiskLevel: userVul.locationRiskLevel
      }).eq('userID', user.id);
      
      Alert.alert("Success", "Profile updated!");
      //setUserData(editedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const updateField = (section,field, value) => {
    if (section === "userData") {setUserData((prev) => ({ ...prev, [field]: value })) } 
    else if (section === "userGuardian" && userData.hasGuardian) {setUserGuardian((prev) => ({ ...prev, [field]: value })) }
    else if (section === "userAddress") {setUserAddress((prev) => ({ ...prev, [field]: value })) }
    else if (section === "userVul") {setUserVul((prev) => ({ ...prev, [field]: value })) }
  };

  const renderField = (section, field, label, value, editable = true) => (
    <View style={styles.rowItem}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          editable ? (isEditing ? styles.editableInput : styles.disabledInput) : styles.disabledInput,
        ]}
        value={value || ""}
        editable={isEditing && editable}
        onChangeText={(text) => editable && updateField(section, field, text)}
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

  //TODO - gawan ng loading or gamitin yung dati
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
        {/* USER PROFILE PICTURE 
            //TODO - add bucket insert for picture
        */}
        <Image source={profilePic} style={styles.photo} />
        <View style={styles.statusContainer}>
          {
            //TODO - fetch verification here

          }
          <Text style={[styles.statusText, userData.isVerified ? styles.safe : styles.pending]}>
            {userData.isVerified ? "Verified" : "Pending Verification"}{" "}
            {userData.isVerified && <Feather name="check-circle" size={16} color="#007bff" />}
          </Text>
          <Text style={styles.fullName}>
            {userData.firstName.charAt(0).toUpperCase()+userData.firstName.slice(1) + " "}
            {userData.middleName !== "" &&
          (userData.middleName.charAt(0).toUpperCase()+userData.middleName.slice(1)) + " "}
            {userData.surname.charAt(0).toUpperCase()+userData.surname.slice(1)}</Text>
          <Text style={styles.address}>
            {userAddress.streetName.charAt(0).toUpperCase()+userAddress.streetName.slice(1)}, 
            {" " + userAddress.brgyName.charAt(0).toUpperCase()+userAddress.brgyName.slice(1)}, 
            {" " + userAddress.cityName.charAt(0).toUpperCase()+userAddress.cityName.slice(1)} City</Text>
        </View>
      </View>

      {/* Personal Information */}
      {/* USER DATA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowItem}>
          {renderField("userData","firstName", "First Name", userData.firstName)}
          </View>
          <View style={styles.rowItem}>
          {
            userData.middleName !== null ? renderField("userData","middleName", "Middle Name", userData.middleName) : renderField("userData","", "Middle Name", userData.middleName)
          }
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.row}>
          {renderField("userData","surname", "Surname", userData.surname)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={userData.age?.toString() || ""} editable={false} />
          </View>
            {renderField("userData","dob", "Date of Birth (YYYY-MM-DD)", userData.dob, false)}
        </View>

            <View style={styles.row}>
              {renderField("userData","householdSize", "Household Size", userData.householdSize.toString())}
              <View style={styles.row}>
                {renderField("userData","contactNumber", "Contact Number", userData.userNumber)}
              <View style={styles.row}>{renderField("userData","email", "Email", userData.email, false)}</View>
            </View>
        </View>
        <View style={styles.row}>
        </View>
        <View style={styles.row}>
          {/* {renderField("emergencyContact", "Emergency Contact", userData.emergencyContact)} */}
          <View style={styles.rowItem}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          <View style={styles.divider} />
            {renderField("userAddress","streetName", "Street", userAddress.streetName)}
            {renderField("userAddress","brgyName", "Barangay", userAddress.brgyName)}
            {renderField("userAddress","cityName", "City", userAddress.cityName)}
            {/* <Text style={styles.label}>Barangay</Text> */}
            {/* <TextInput style={[styles.input, styles.disabledInput]} value={userAddress.brgyName || ""} editable={true} /> */}
          </View>
        </View>
        {/* <View style={styles.row}>{renderField("vulnerability", "Vulnerability", userData.vulnerability, false)}</View> */}
      </View>
      
      { userData.hasGuardian === true &&
        (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guardian Information</Text>
            <View style={styles.divider} />
            <View style={styles.row}>
              {renderField("userGuardian","fullName", "Name", userGuardian.fullName)}
              {renderField("userGuardian","relationship", "Relationship", userGuardian.relationship)}
            </View>
            <View style={styles.row}>{renderField("userGuardian","guardianContact", "Contact", userGuardian.guardianContact)}</View>
            <View style={styles.row}>{renderField("userGuardian","guardianAddress", "Address", userGuardian.guardianAddress)}</View>
          </View> 
        )
      }

      <Text style={styles.sectionTitle}>Vulnerability Information</Text>
      <View style={styles.divider} />
      <View style={styles.row}>{renderField("userVul","elderly", "Age-related", (userVul.elderly ? "Elderly" : "Not elderly"), false)}</View>
      <View style={styles.row}>{renderField("userVul","pregnantInfant", "Pregnant/Infant", userVul.pregnantInfant.toString(), false)}</View>

      <View style={styles.row}>{renderField("userVul","physicalPWD", "Physical Disability", userVul.physicalPWD.toString(), false)}</View>
      <View style={styles.row}>{renderField("userVul","psychPWD", "Psychological Disability", userVul.psychPWD.toString(), false)}</View>
      <View style={styles.row}>{renderField("userVul","sensoryPWD", "Sensory Disability", userVul.sensoryPWD.toString(), false)}</View>

      <View style={styles.row}>{renderField("userVul","medDep", "Medically Dependent", userVul.medDep.toString(), false)}</View>
      <View style={styles.row}>{renderField("userVul","locationRiskLevel", "Location Risk Level", userVul.locationRiskLevel.toString(), false)}</View>

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
