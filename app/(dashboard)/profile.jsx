import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Button,
  KeyboardTypeOptions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUser } from "../../hooks/useUser";
import supabase from "../../contexts/supabaseClient";
import profilePic from "../../assets/sohee.jpg";
import Spacer from "../../components/Spacer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInYears } from "date-fns";
import ThemedLoader from "../../components/ThemedLoader";
import DatePickerInput from "../../components/DatePickerInput";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import mime from "mime";
import { decode as atob, encode as btoa } from "base-64";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import { Space } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import LocationPermissionInput from "../../components/LocationPermissionInput";
import { useRouter } from "expo-router";
import PasswordChangeModal from "../../components/PasswordChangeModal";
import ChangeMpinModal from "../../components/ChangeMpinModal";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialIcons } from "@expo/vector-icons";

const Profile = () => {
  const { user, logout } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openSex, setOpenSex] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({}); // dynamic for multiple dropdowns
  const [dropdownValues, setDropdownValues] = useState({
    sex: " ",
  });

  // added to remove header in profile tab
  const navigation = useNavigation();

  const [locationData, setLocationData] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // new add for update profile pic
  const [selectedImage, setSelectedImage] = useState(null);

  // debug (ata, if this makes sense)
  console.log("Profile component - user state:", user);
  console.log("Profile component - user exists:", !!user);
  console.log("Profile component - user ID:", user?.id);

  const [userData, setUserData] = useState({
    // the following are the only columns that the user will edit in the profile tab
    firstName: "",
    middleName: "",
    surname: "",
    dob: "",
    age: 0,
    sex: "",
    mpin: "",
    userNumber: "",
    householdSize: 0,
    addressID: 0,
    hasGuardian: false,
    guardianID: 0,
    vulnerabilityID: 0,
    verificationID: 0,
    userID: "",
    email: "",
    profilePic: "",
  });
  const [userAddress, setUserAddress] = useState({
    streetName: "",
    brgyName: "",
    cityName: "",
    geolocationCoords: "",
    userID: "",
  });
  const [userGuardian, setUserGuardian] = useState({
    fullName: "",
    relationship: "",
    guardianContact: "",
    guardianAddress: "",
    userID: "",
  });
  const [userVul, setUserVul] = useState({
    elderly: false,
    pregnantInfant: [],
    physicalPWD: [],
    psychPWD: [],
    sensoryPWD: [],
    medDep: [],
    locationRiskLevel: "",
    userID: "",
  });
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // const [isEditing, setIsEditing] = useState(false);
  const [editingSections, setEditingSections] = useState({
    userData: false,
    address: false,
    guardian: false,
    vulnerability: false,
  });
  // added helper
  const toggleSectionEdit = (section) => {
    setEditingSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  //ANCHOR - pick image here
  const pickImage = async () => {
    // ask permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // allow cropping
      aspect: [1, 1], // square crop
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(result.assets[0].uri);
      uploadProfile(uri);
    }
  };

  const toJPEG = async (uri) => {
    try {
      const context = await ImageManipulator.manipulate(uri);

      //resize if needed
      // context.resize({ width: 800 });

      // render async
      const imageRef = await context.renderAsync();

      const result = await imageRef.saveAsync({
        compress: 0.9,
        format: SaveFormat.JPEG,
      });

      return result.uri;
    } catch (error) {
      Alert.alert(
        "Error in image manipulator",
        "Error in coercing image to JPEG type."
      );
    }
  };

  //ANCHOR - image upload function here
  const uploadProfile = async (uri) => {
    try {
      if (!user?.id) throw new Error("No user id!");

      const ext = uri.split(".").pop();
      // const filename = `users/${user.id}_profile.${ext}`
      const filename = `users/${user.id}_profile.jpeg`;

      const jpegUri = await toJPEG(uri);
      const base64 = await FileSystem.readAsStringAsync(jpegUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // convert to binary
      const imgBlob = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // const contentType = mime.getType(uri) || "image/jpeg"
      const contentType = "image/jpeg";

      const { error } = await supabase.storage
        .from("profilePicture")
        .upload(filename, imgBlob, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error("Error in supabase bucket upload: ", error);
      }

      await fetchProfilePicture(filename);
    } catch (error) {
      console.error("Image upload error in upload profile: ", error);
      Alert.alert("Error", error.message);
    }
  };

  //ANCHOR - fetch image
  const fetchProfilePicture = async (path) => {
    if (!path) {
      Alert.alert("Null", "No path!");
    }

    const { data, error } = await supabase.storage
      .from("profilePicture")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 99);

    if (error) {
      console.error("Error creating signed URL: ", error);
      return null;
    }

    setUserData((prev) => ({
      ...prev,
      profilePic: data.signedUrl,
    }));

    await supabase
      .from("user")
      .update({
        profilePic: data.signedUrl,
      })
      .eq("userID", user.id)
      .select();
  };

  // TODO tih pacheck here if okay lang na di k ginamit to
  //FIXME -  not used
  const [editedUser, setEditedUser] = useState({
    userData: { ...userData },
    userAddress: { ...userAddress },
    userGuardian: { ...userGuardian },
    userVul: { ...userVul },
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMpinModal, setShowMpinModal] = useState(false);

  //reads from supabase

  const fetchUserData = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching in getUser:", userError);
      throw new Error("No active session / user");
    }

    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("userID", user.id)
      .single();

    setUserData({
      firstName: data.firstName || "",
      middleName: data.middleName || "",
      surname: data.surname || "",
      dob: data.dateOfBirth || "",
      age: data.age || 0,
      sex: data.sex || "",
      mpin: data.mpin || "",
      userNumber: data.userNumber || "",
      householdSize: data.householdSize || 0,
      addressID: data.addressID || 0,
      hasGuardian: data.hasGuardian || false,
      guardianID: data.guardianID || 0,
      vulnerabilityID: data.vulnerabilityID || 0,
      verificationID: data.verificationID || 0,
      userID: data.userID || "",
      email: user.email,
      profilePic: data.profilePic || profilePic,
    });
    if (error) {
      console.error("Fetch error in user table: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };
  const {
    data: profileData,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: fetchUserData,
    enabled: !!user,
  });
  if (error) {
    console.error("Error in fetching user table: ", error);
  }
  console.log("profiledata email ", profileData?.email);

  // checks if session exists thru isPending
  useEffect(() => {
    setLoading(isPending);
  }, [isPending]);
  // assigns values from profileData to useState
  useEffect(() => {
    if (profileData) {
      setUserData({
        firstName: profileData.firstName || "",
        middleName: profileData.middleName || "",
        surname: profileData.surname || "",
        dob: profileData.dateOfBirth || "",
        age: profileData.age || 0,
        sex: profileData.sex || "None",
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
      });
    }
  }, [user]);

  console.log("USerdata email", userData.email);

  const fetchAddressData = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const { data, error } = await supabase
      .from("address")
      .select("*")
      .eq("userID", user.id)
      .single();

    setUserAddress({
      streetName: data.streetName || "",
      brgyName: data.brgyName || "",
      cityName: data.cityName || "",
      geolocationCoords: data.geolocationCoords || "",
      userID: data.userID || "",
    });

    if (error) {
      console.error("Fetch error in address table: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };
  const { data: addressData, error: addressError } = useQuery({
    queryKey: ["address"],
    queryFn: fetchAddressData,
  });
  if (addressError) {
    console.error("Error in fetching address table: ", addressError);
  }
  useEffect(() => {
    if (addressData) {
      setUserAddress({
        streetName: addressData.streetName || "",
        brgyName: addressData.brgyName || "",
        cityName: addressData.cityName || "",
        geolocationCoords: addressData.geolocationCoords || "",
        userID: addressData.userID || "",
      });
    }
  }, [user]);
  console.log("hasGuardian: ", profileData?.hasGuardian);

  const fetchGuardianData = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const { data, error } = await supabase
      .from("guardian")
      .select("*")
      .eq("userID", user.id)
      .single();

    setUserGuardian({
      fullName: data.fullName || "",
      relationship: data.relationship || "",
      guardianContact: data.guardianContact || "",
      guardianAddress: data.guardianAddress || "",
      userID: data.userID || "",
    });

    if (error) {
      console.error("Fetch error in guardian table: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };
  const { data: guardianData, error: guardianError } = useQuery({
    queryKey: ["guardian", profileData?.userID],
    queryFn: fetchGuardianData,
    enabled: !!profileData?.hasGuardian === true,
  });
  if (guardianError) {
    console.error("Error in fetching guardian table: ", addressError);
  }
  useEffect(() => {
    if (guardianData) {
      setUserGuardian({
        fullName: guardianData.fullName || "",
        relationship: guardianData.relationship || "",
        guardianContact: guardianData.guardianContact || "",
        guardianAddress: guardianData.guardianAddress || "",
        userID: guardianData.userID || "",
      });
    }
  }, [user]);

  const fetchVulData = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const { data, error } = await supabase
      .from("vulnerabilityList")
      .select("*")
      .eq("userID", user.id)
      .single();

    setUserVul({
      elderly: data.elderly ?? false,
      pregnantInfant: data.pregnantInfant ?? [],
      physicalPWD: data.physicalPWD ?? [],
      psychPWD: data.psychPWD ?? [],
      sensoryPWD: data.sensoryPWD ?? [],
      medDep: data.medDep ?? [],
      locationRiskLevel: data.locationRiskLevel ?? "None",
      userID: data.userID || "",
    });

    if (error) {
      console.error("Fetch error in vulList table: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };
  const { data: vulListData, error: vulListError } = useQuery({
    queryKey: ["vulnerabilityList"],
    queryFn: fetchVulData,
  });
  if (vulListError) {
    console.error("Error in fetching vulList table: ", addressError);
  }
  useEffect(() => {
    if (vulListData) {
      setUserVul({
        elderly: vulListData.elderly ?? false,
        pregnantInfant: vulListData.pregnantInfant ?? [],
        physicalPWD: vulListData.physicalPWD ?? [],
        psychPWD: vulListData.psychPWD ?? [],
        sensoryPWD: vulListData.sensoryPWD ?? [],
        medDep: vulListData.medDep ?? [],
        locationRiskLevel: vulListData.locationRiskLevel ?? "None",
        userID: vulListData.userID || "",
      });
    }
  }, [user]);

  console.log(userVul);

  const fetchVerif = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const { data, error } = await supabase
      .from("verification")
      .select("*")
      .eq("userID", user.id)
      .single();

    setIsVerified(data.isVerified);

    if (error) {
      console.error("Fetch error in verif table: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };
  const { data: verifData, error: verifError } = useQuery({
    queryKey: ["verification"],
    queryFn: fetchVerif,
  });
  if (verifError) {
    console.error("Error in fetching vulList table: ", verifError);
  }
  useEffect(() => {
    if (verifData) {
      setIsVerified(verifData.isVerified);
    }
  }, [user]);

  // SUBSCRIBING TO REALTIME ON ALL TABLES ##############################
  useEffect(() => {
    if (!user?.id) return;

    // USER table subscription
    const userSub = supabase
      .channel("user-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user",
          filter: `userID=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime USER update:", payload);
          setUserData((prev) => ({
            ...prev,
            ...payload.new,
            dob: payload.new.dateOfBirth ?? prev.dob,
          }));
          // Re-fetch with react-query
          // refetch();
        }
      )
      .subscribe();

    // ADDRESS table subscription
    const addressSub = supabase
      .channel("address-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "address",
          filter: `userID=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime ADDRESS update:", payload);
          setUserAddress((prev) => ({
            ...prev,
            ...payload.new,
          }));
          // trigger react-query refetch for address
          queryClient.invalidateQueries(["address"]);
        }
      )
      .subscribe();

    // GUARDIAN table subscription
    const guardianSub = supabase
      .channel("guardian-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guardian",
          filter: `userID=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime GUARDIAN update:", payload);
          setUserGuardian((prev) => ({
            ...prev,
            ...payload.new,
          }));

          queryClient.invalidateQueries(["guardian", user.id]);
        }
      )
      .subscribe();

    // VULNERABILITY table subscription
    const vulSub = supabase
      .channel("vulnerability-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vulnerabilityList",
          filter: `userID=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime VUL update:", payload);
          setUserVul((prev) => ({
            ...prev,
            ...payload.new,
          }));
          queryClient.invalidateQueries(["vulnerabilityList"]);
        }
      )
      .subscribe();

    // VERIFICATION table subscription
    const verifSub = supabase
      .channel("verification-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verification",
          filter: `userID=eq.${user.id}`,
        },
        (payload) => {
          setIsVerified(payload.new);
          queryClient.invalidateQueries(["verification"]);
        }
      )
      .subscribe();

    // cleanup on unmount
    return () => {
      supabase.removeChannel(userSub);
      supabase.removeChannel(addressSub);
      supabase.removeChannel(guardianSub);
      supabase.removeChannel(vulSub);
      supabase.removeChannel(verifSub);
    };
  }, [user?.id]);

  console.log("realtime verif: ", isVerified);

  //NOTE - never tinawag
  const toggleEdit = () => {
    if (editingSections) {
      Alert.alert("Save Changes?", "Do you want to save your changes?", [
        {
          text: "Cancel",
          // onPress: () => setEditedUser(userData),
          style: "cancel",
        },
        {
          text: "Save",
          onPress: saveChanges,
        },
      ]);
    } else {
      // setEditedUser(userData);
    }
    setEditingSections(!editingSections);
  };

  //ANCHOR - update tables here
  const saveChanges = async () => {
    try {
      const newAge = differenceInYears(new Date(), new Date(userData.dob));

      // Update user table ############################################
      await supabase
        .from("user")
        .update({
          firstName: userData.firstName,
          middleName: userData.middleName,
          surname: userData.surname,
          age: newAge,
          sex: userData.sex,
          dateOfBirth: userData.dob,
          userNumber: userData.userNumber,
          householdSize: userData.householdSize,
          hasGuardian: userData.hasGuardian,
        })
        .eq("userID", user.id)
        .select();

      // Update address table ###########################################
      await supabase
        .from("address")
        .update({
          streetName: userAddress.streetName,
          brgyName: userAddress.brgyName,
          cityName: userAddress.cityName,
          geolocationCoords: userAddress.geolocationCoords,
        })
        .eq("userID", user.id);

      // Update guardian table (if exists) ##############################
      if (userData.hasGuardian) {
        await supabase
          .from("guardian")
          .update({
            fullName: userGuardian.fullName,
            relationship: userGuardian.relationship,
            guardianContact: userGuardian.guardianContact,
            guardianAddress: userGuardian.guardianAddress,
          })
          .eq("userID", user.id);
      }

      // Update vulnerability table ###################################
      await supabase
        .from("vulnerabilityList")
        .update({
          elderly:
            differenceInYears(new Date(), new Date(userData.dob)) >= 60
              ? true
              : false,
          pregnantInfant: userVul.pregnantInfant,
          physicalPWD: userVul.physicalPWD,
          psychPWD: userVul.psychPWD,
          sensoryPWD: userVul.sensoryPWD,
          medDep: userVul.medDep,
          locationRiskLevel: userVul.locationRiskLevel,
        })
        .eq("userID", user.id);

      Alert.alert("Success", "Profile updated!");

      // Reset editing state back to false so button goes back to blue
      setEditingSections({
        userData: false,
        address: false,
        guardian: false,
        vulnerability: false,
      });

      //setUserData(editedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const updateField = (section, field, value) => {
    if (section === "userData") {
      setUserData((prev) => ({ ...prev, [field]: value }));
    } else if (section === "guardian" && userData.hasGuardian) {
      setUserGuardian((prev) => ({ ...prev, [field]: value }));
    } else if (section === "address") {
      setUserAddress((prev) => ({ ...prev, [field]: value }));
    } else if (section === "vulnerability") {
      // dont modify
      setUserVul((prev) => {
        const currentValue = prev[field];
        if (Array.isArray(currentValue)) {
          return {
            ...prev,
            [field]: value
              .split(",")
              // .map(v => v.trim())
              .filter((v) => v.length > 0),
          };
        }
        return { ...prev, [field]: value };
      });
    }
  };

  const renderField = (
    section,
    field,
    label,
    value,
    editable = false,
    keyboardType = "default",
    dropdownItems = null // optional: pass array of {label, value} for dropdown
  ) => {
    const isEditing = editingSections[section] && editable;

    // If dropdownItems are provided, render a dropdown instead of text input
    if (dropdownItems && isEditing) {
      return (
        <View style={[styles.rowItem, { zIndex: 1000 }]}>
          <Text style={styles.label}>{label}</Text>
          <DropDownPicker
            open={openDropdowns[field] || false}
            value={dropdownValues[field] ?? value} // controlled value
            items={dropdownItems}
            setOpen={(open) =>
              setOpenDropdowns((prev) => ({ ...prev, [field]: open }))
            }
            setValue={(callback) => {
              setDropdownValues((prev) => {
                const newValue = callback(prev[field] ?? value); // compute new value
                updateField(section, field, newValue);
                return { ...prev, [field]: newValue };
              });
            }}
            placeholder={`Select ${label}`}
            style={[styles.dropdown, styles.editableInput]}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>
      );
    }

    if (isEditing) {
      return (
        <View style={styles.rowItem}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[styles.input, styles.editableInput]}
            value={value}
            onChangeText={(text) => updateField(section, field, text)}
            keyboardType={keyboardType}
          />
        </View>
      );
    }

    return (
      <View style={styles.rowItem}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{value || "—"}</Text>
      </View>
    );
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: logout,
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return <ThemedLoader />;
  }

  if (!user || !userData) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Please log in to view your profile</Text>
        <Text style={{ marginTop: 10, color: "#666" }}>
          User: {user ? "Found" : "Missing"} | Data:{" "}
          {userData ? "Found" : "Missing"}
        </Text>
      </View>
    );
  }

  // ===================================================================================================================================
  // Frontend Starts Here

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* header */}
      <Spacer height={50} />
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          <Image
            source={
              userData.profilePic && typeof userData.profilePic === "string"
                ? { uri: userData.profilePic.toString() }
                : profilePic
            }
            style={styles.photo}
          />
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={pickImage}
          >
            <Feather name='camera' size={18} color='#fff' />
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          {
            //TODO - fetch verification here
          }
          <Text
            style={[
              styles.statusText,
              isVerified ? styles.safe : styles.pending,
            ]}
          >
            {isVerified ? "Verified" : "Pending Verification"}{" "}
            {isVerified && (
              <Feather name='check-circle' size={16} color='#007bff' />
            )}
          </Text>
          <Text style={styles.fullName}>
            {userData.firstName.charAt(0).toUpperCase() +
              userData.firstName.slice(1) +
              " "}
            {userData.middleName !== "" &&
              userData.middleName.charAt(0).toUpperCase() +
                userData.middleName.slice(1) +
                " "}
            {userData.surname.charAt(0).toUpperCase() +
              userData.surname.slice(1)}
          </Text>

          <Text style={[styles.address, { color: "#007bff" }]}>
            {userData.email}
          </Text>

          <View style={styles.addressRow}>
            <Feather name='map-pin' size={14} color='#007bff' />
            <Text style={styles.address}>
              {userAddress.streetName.charAt(0).toUpperCase() +
                userAddress.streetName.slice(1)}
              ,
              {" " +
                userAddress.brgyName.charAt(0).toUpperCase() +
                userAddress.brgyName.slice(1)}
              ,
              {" " +
                userAddress.cityName.charAt(0).toUpperCase() +
                userAddress.cityName.slice(1)}{" "}
              City
            </Text>
          </View>
        </View>
      </View>

      {/* Personal Information */}
      {/* USER DATA */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {/* Edit na to */}
          <TouchableOpacity
            style={styles.ellipsisButton}
            onPress={() => toggleSectionEdit("userData")}
          >
            <MaterialIcons
              name='edit'
              size={18}
              color='#0060ff'
              style={{ marginRight: 4 }}
            />
            <Text style={styles.ellipsisText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Only show editable fields if editingSections.userData is true */}
        {editingSections.userData && (
          <View style={styles.editActions}>
            <Text style={styles.editLabel}>Edit Personal Info</Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#aaa" }]}
                onPress={() => toggleSectionEdit("userData")} // close edit mode
              >
                <Feather name='x' size={18} color='#fff' />
                <Text style={styles.saveButtonText}>Cancel</Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#0060ff" }]}
                onPress={saveChanges}
              >
                <Feather name='check' size={18} color='#fff' />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Name Fields */}
        {editingSections.userData && (
          <>
            <View style={styles.row}>
              {renderField(
                "userData",
                "firstName",
                "First Name",
                userData.firstName,
                true
              )}
            </View>
            <View style={styles.row}>
              {renderField(
                "userData",
                "middleName",
                "Middle Name",
                userData.middleName,
                true
              )}
            </View>
            <View style={styles.row}>
              {renderField(
                "userData",
                "surname",
                "Surname",
                userData.surname,
                true
              )}
            </View>
          </>
        )}
      </View>

      {/* Sex and Household Size */}
      <View style={styles.row}>
        {renderField(
          "userData",
          "sex",
          "Sex",
          userData.sex,
          true, // editable
          "default",
          [
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Others", value: "Others" },
          ] // dropdown items
        )}

        {renderField(
          "userData",
          "householdSize",
          "Household Size",
          userData.householdSize.toString(),
          true,
          "number-pad"
        )}
      </View>

      {/* DOB and Age */}
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Date of Birth</Text>
          {editingSections.userData ? (
            <View style={[styles.input, styles.editableInput]}>
              <DatePickerInput
                minimumDate={new Date(1900, 0, 1)}
                value={userData.dob ? new Date(userData.dob) : null}
                onChange={(date) => {
                  if (date) {
                    updateField(
                      "userData",
                      "dob",
                      date.toISOString().split("T")[0]
                    );
                  }
                }}
              />
            </View>
          ) : (
            <Text style={styles.valueText}>{userData.dob || "—"}</Text>
          )}
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.label}>Age</Text>
          {editingSections.userData ? (
            <TextInput
              style={[styles.input, styles.editableInput]}
              value={userData.age?.toString() || ""}
              editable={false} // optional: could be read-only
            />
          ) : (
            <Text style={styles.valueText}>
              {userData.age?.toString() || "—"}
            </Text>
          )}
        </View>
      </View>

      {/* Household Information */}
      <View style={styles.row}>
        <View style={styles.row}>
          {renderField(
            "userData",
            "userNumber",
            "Contact Number",
            userData.userNumber,
            true,
            "phone-pad"
          )}
          {/* <View style={styles.row}>{renderField("userData","email", "Email", userData.email, false)}</View> */}
        </View>
      </View>
      <View style={styles.row}></View>
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Address Information</Text>

            {/* Edit na rin */}
            <TouchableOpacity
              style={styles.ellipsisButton}
              onPress={() => toggleSectionEdit("address")}
            >
              <MaterialIcons
                name='edit'
                size={18}
                color='#0060ff'
                style={{ marginRight: 4 }}
              />
              <Text style={styles.ellipsisText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {editingSections.address && (
            <View style={styles.editActions}>
              <Text style={styles.editLabel}>Edit Address Info</Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* Cancel Button */}
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: "#aaa" }]}
                  onPress={() => toggleSectionEdit("address")} // close edit mode
                >
                  <Feather name='x' size={18} color='#fff' />
                  <Text style={styles.saveButtonText}>Cancel</Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: "#0060ff" }]}
                  onPress={saveChanges}
                >
                  <Feather name='check' size={18} color='#fff' />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {renderField(
            "address",
            "streetName",
            "Street",
            userAddress.streetName,
            true
          )}
          {renderField(
            "address",
            "brgyName",
            "Barangay",
            userAddress.brgyName,
            true
          )}
          {renderField(
            "address",
            "cityName",
            "City",
            userAddress.cityName,
            true
          )}

          {editingSections.address === true && (
            <LocationPermissionInput
              value={locationData}
              onChange={(data) => {
                setLocationData(data);
              }}
              placeholder='Edit Location Coordinates'
              disabled={!editingSections.address}
            />
          )}

          <View style={styles.row}>
            {renderField(
              "address",
              "completeAddress",
              "Complete Address",
              locationData?.formattedAddress ||
                `${userAddress.streetName}, ${userAddress.brgyName}, ${userAddress.cityName} City`,
              true
            )}
          </View>
          {/* <Text style={styles.label}>Barangay</Text> */}
          {/* <TextInput style={[styles.input, styles.disabledInput]} value={userAddress.brgyName || ""} editable={true} /> */}
        </View>
      </View>
      {/* <View style={styles.row}>{renderField("vulnerability", "Vulnerability", userData.vulnerability, false)}</View> */}

      {userData.hasGuardian === true && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guardian Information</Text>

            {/* edit guardian */}
            <TouchableOpacity
              style={styles.ellipsisButton}
              onPress={() => toggleSectionEdit("guardian")}
            >
              <MaterialIcons
                name='edit'
                size={18}
                color='#0060ff'
                style={{ marginRight: 4 }}
              />
              <Text style={styles.ellipsisText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Only show editable fields if editingSections.guardian is true */}
          {editingSections.guardian && (
            <View style={styles.editActions}>
              <Text style={styles.editLabel}>Edit Guardian Info</Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* Cancel Button */}
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: "#aaa" }]}
                  onPress={() => toggleSectionEdit("guardian")} // close edit mode
                >
                  <Feather name='x' size={18} color='#fff' />
                  <Text style={styles.saveButtonText}>Cancel</Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: "#0060ff" }]}
                  onPress={saveChanges}
                >
                  <Feather name='check' size={18} color='#fff' />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.row}>
            {renderField(
              "guardian",
              "fullName",
              "Name",
              userGuardian.fullName,
              true
            )}
            {renderField(
              "guardian",
              "relationship",
              "Relationship",
              userGuardian.relationship,
              true
            )}
          </View>
          <View style={styles.row}>
            {renderField(
              "guardian",
              "guardianContact",
              "Contact",
              userGuardian.guardianContact,
              true
            )}
          </View>
          <View style={styles.row}>
            {renderField(
              "guardian",
              "guardianAddress",
              "Address",
              userGuardian.guardianAddress,
              true
            )}
          </View>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.sectionTitle}>Vulnerability Information</Text>
        <TouchableOpacity
          style={styles.ellipsisButton}
          onPress={() =>
            router.push({
              pathname: "/(auth)/vulnerable",
              params: { from: "profile" },
            })
          }
        >
          <MaterialIcons
            name='edit'
            size={18}
            color='#0060ff'
            style={{ marginRight: 4 }}
          />
          <Text style={styles.ellipsisText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        {renderField(
          "vulnerability",
          "elderly",
          "Age-related",
          userVul.elderly.toString() === "true" ? "Elderly" : "Not Elderly",
          true
        )}
      </View>
      <View style={styles.row}>
        {renderField(
          "vulnerability",
          "pregnantInfant",
          "Pregnant/Infant",
          userVul.pregnantInfant.toString(),
          true
        )}
      </View>

      <View style={styles.row}>
        {renderField(
          "vulnerability",
          "physicalPWD",
          "Physical Disability",
          userVul.physicalPWD.toString(),
          true
        )}
      </View>
      <View style={styles.row}>
        {renderField(
          "vulnerability",
          "psychPWD",
          "Psychological Disability",
          userVul.psychPWD.toString(),
          true
        )}
      </View>
      <View style={styles.row}>
        {renderField(
          "vulnerability",
          "sensoryPWD",
          "Sensory Disability",
          userVul.sensoryPWD.toString(),
          true
        )}
      </View>

      <View style={styles.row}>
        {renderField(
          "vulnerability",
          "medDep",
          "Medically Dependent",
          userVul.medDep.toString(),
          true
        )}
      </View>
      <View style={styles.row}>
        {renderField(
          "vulnerability",
          "locationRiskLevel",
          "Location Risk Level",
          userVul.locationRiskLevel.toString(),
          false
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: "#6c757d" }]}
          onPress={() => setShowPasswordModal(true)}
        >
          <Feather name='lock' size={20} color='#fff' />
          <Text style={styles.editButtonText}>Change Password</Text>
        </TouchableOpacity>

        {/* Change MPIN Button */}
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: "#6c757d" }]}
          onPress={() => setShowMpinModal(true)}
        >
          <Feather name='shield' size={20} color='#fff' />
          <Text style={styles.editButtonText}>Change MPIN</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.editButton,
          { backgroundColor: "#dc3545", alignSelf: "center", marginTop: 10 },
        ]}
        onPress={handleLogout}
      >
        <Feather name='log-out' size={20} color='#fff' />
        <Text style={styles.editButtonText}>Logout</Text>
      </TouchableOpacity>

      <PasswordChangeModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <ChangeMpinModal
        visible={showMpinModal}
        onClose={() => setShowMpinModal(false)}
      />
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
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#007bff",
    marginBottom: 8,
  },
  fullName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },

  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  safe: { color: "#007bff" },
  pending: { color: "#EB3A32" },
  address: { fontSize: 15, color: "#555", marginLeft: 4 },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    textAlign: "center",
  },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#007bff" },
  divider: { height: 1, backgroundColor: "#007bff", marginVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 0,
  },
  rowItem: { flex: 1, marginRight: 8, marginBottom: 12 },
  label: { fontSize: 12, color: "#555", marginBottom: 4 },

  // Unified input style
  input: {
    fontSize: 16,
    height: 44,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },

  editableInput: {
    backgroundColor: "#e6f0ff",
    borderColor: "#007bff",
  },

  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#555",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: { color: "#fff", fontWeight: "600", marginLeft: 8 },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
  },

  photoContainer: {
    position: "relative",
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007bff",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B6B6B",
    marginBottom: 2,
  },
  dropdown: {
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownContainer: {
    borderColor: "#ccc",
    borderRadius: 8,
    height: 44,
  },
  valueText: {
    fontSize: 19,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // ensures ellipsis is at the far right
    marginBottom: -5,
  },

  ellipsisButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  ellipsisText: {
    fontSize: 13,
    color: "#007bff",
  },

  editActions: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
  },

  editLabel: {
    fontSize: 13,
    color: "#007bff",
    fontWeight: "600",
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  saveButtonText: {
    color: "#fff",
    marginLeft: 5,
  },
});
