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
  Platform,
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
import DateTimePicker from "@react-native-community/datetimepicker";
import DOBField from "../../components/DOBField";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
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
import StreetDropdown from "../../components/StreetDropdown";
import BarangayDropdown from "../../components/BarangayDropdown";
import { decryptData, encryptData } from "../../utils/encryption";
import { Colors } from "../../constants/Colors"; 

const Profile = () => {
  const { user, logout } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [openDropdowns, setOpenDropdowns] = useState({}); // dynamic for multiple dropdowns
  const [dropdownValues, setDropdownValues] = useState({
    sex: null,
  });

  // Validation State
  const [formErrors, setFormErrors] = useState({});

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
    sex: null,
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
  const [userPregnant, setUserPregnant] = useState({
    dueDate: "",
    trimester: "",
  });
  
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Street Lists
  const moderateStreets = [
    "Bagong Farmers 1",
    "Liwanag",
    "Banner",
    "Camia",
    "Cattleya",
    "Crescent",
    "Daisy",
    "Jasmin",
    "Jewelmark",
    "Katipunan",
    "Lacewing",
    "MilFlores",
    "Monarch",
    "Moscow",
    "Sitaw",
    "Okra",
    "Silverdrop",
    "Sunkist",
    "Swallowtail",
    "Apple",
    "Doña Petra",
    "Farmers 2",
    "Brazil",
    "Bulalakaw",
    "Bukang Liwayway",
    "Cherry",
    "Damayan Alley",
    "Del Rosario",
    "Denmark",
    "Iwahig",
    "Kalamansi",
    "Kalabasa",
    "Kislap",
    "Kutitap",
    "Malunggay",
    "Monaco",
    "Monggo",
    "Mustasa",
    "Nova Scotia",
    "Orange",
    "Panganiban",
    "Patola",
    "Pechay",
    "Piling Santos",
    "Vergara",
    "Sinag",
    "Sinagtala",
    "Waterlily",
  ];

  const highStreets = [
    "Ampalaya",
    "Kangkong",
    "Labanos",
    "Road Dike",
    "Upo",
    "Bagong Farmers 2",
    "Mais",
    "Road 1",
    "Road 2",
    "Road 3",
    "Road 4",
    "Road 5",
    "Singkamas",
    "Talong",
  ];
  const criticalStreets = [
    "Angel Santos",
    "Ilaw",
    "Palay",
    "Pipino",
    "Kangkong",
    "Labanos",
    "Upo",
  ];

  const [editingSections, setEditingSections] = useState({
    userData: false,
    address: false,
    guardian: false,
    vulnerability: false,
  });

  const toggleSectionEdit = (section) => {
    // Clear errors when toggling sections
    setFormErrors({}); 
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
      const filename = `users/${user.id}_profile.jpeg`;

      const jpegUri = await toJPEG(uri);
      const base64 = await FileSystem.readAsStringAsync(jpegUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imgBlob = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMpinModal, setShowMpinModal] = useState(false);

  //reads from supabase

  const fetchUserData = async () => {
    setLoading(true);
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

    //ANCHOR - decryption here
    const [
      decFirstName,
      decMiddleName,
      decSurname,
      decUserNumber,
      decDob,
      decAge,
    ] = await Promise.all([
      decryptData(data.firstName),
      data?.middleName ? decryptData(data?.middleName) : Promise.resolve(""),
      decryptData(data.surname),
      decryptData(data.userNumber),
      decryptData(data.dateOfBirth),
      decryptData(data.age),
    ]);

    const decryptedUser = {
      ...data,
      firstName: decFirstName || "",
      middleName: decMiddleName || "",
      surname: decSurname || "",
      dateOfBirth: decDob || "",
      age: decAge || 0,
      sex: data.sex || null,
      userNumber: decUserNumber || "",
    };

    setUserData({
      firstName: decryptedUser.firstName,
      middleName: decryptedUser.middleName,
      surname: decryptedUser.surname,
      dob: decryptedUser.dateOfBirth,
      age: decryptedUser.age,
      sex: decryptedUser.sex,
      mpin: data.mpin || "",
      userNumber: decryptedUser.userNumber,
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
    setLoading(false);
    return decryptedUser; // RETURN DECRYPTED DATA
  };

  const {
    data: profileData,
    isPending,
    isError,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: fetchUserData,
    enabled: !!user,
  });
  if (error) {
    console.error("Error in fetching user table: ", error);
  }

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
        sex: profileData.sex || null,
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
        profilePic: profileData.profilePic || profilePic,
      });
    }
  }, [profileData]);


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

    const [
      dhouseInfo,
      dstreetName,
      dbrgyName,
      dcityName,
      dgeolocationCoords,
    ] = await Promise.all([
      decryptData(data.houseInfo),
      decryptData(data.streetName),
      decryptData(data.brgyName),
      decryptData(data.cityName),
      decryptData(data.geolocationCoords),
    ]);

    const decryptedAddress = {
      ...data,
      houseInfo: dhouseInfo || "",
      streetName: dstreetName || "",
      brgyName: dbrgyName || "",
      cityName: dcityName || "",
      geolocationCoords: dgeolocationCoords || "",
    };

    //ANCHOR -  decryption address
    setUserAddress({
      houseInfo: decryptedAddress.houseInfo,
      streetName: decryptedAddress.streetName,
      brgyName: decryptedAddress.brgyName,
      cityName: decryptedAddress.cityName,
      geolocationCoords: decryptedAddress.geolocationCoords,
      userID: data.userID || "",
    });

    if (error) {
      console.error("Fetch error in address table: ", error);
    }
    return decryptedAddress;
  };
  const { data: addressData, error: addressError, refetch: refetchAddress } = useQuery({
    queryKey: ["address"],
    queryFn: fetchAddressData,
  });
  if (addressError) {
    console.error("Error in fetching address table: ", addressError);
  }
  useEffect(() => {
    if (addressData) {
      setUserAddress({
        houseInfo: addressData.houseInfo || "",
        streetName: addressData.streetName || "",
        brgyName: addressData.brgyName || "",
        cityName: addressData.cityName || "",
        geolocationCoords: addressData.geolocationCoords || "",
        userID: addressData.userID || "",
      });
    }
  }, [addressData]);

  const fetchGuardianData = async () => {
    setLoading(true);
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

    const [
      decFullName,
      decRelationship,
      decGuardianContact,
      decGuardianAddress,
    ] = await Promise.all([
      decryptData(data.fullName),
      decryptData(data.relationship),
      decryptData(data.guardianContact),
      decryptData(data.guardianAddress),
    ]);

    const decryptedGuardian = {
      ...data,
      fullName: decFullName || "",
      relationship: decRelationship || "",
      guardianContact: decGuardianContact || "",
      guardianAddress: decGuardianAddress || "",
    };

    setUserGuardian({
      fullName: decryptedGuardian.fullName,
      relationship: decryptedGuardian.relationship,
      guardianContact: decryptedGuardian.guardianContact,
      guardianAddress: decryptedGuardian.guardianAddress,
      userID: data.userID || "",
    });

    if (error) {
      console.error("Fetch error in guardian table: ", error);
    }
    setLoading(false);
    return decryptedGuardian;
  };
  const { data: guardianData, error: guardianError, refetch: refetchGuardian } = useQuery({
    queryKey: ["guardian", profileData?.userID],
    queryFn: fetchGuardianData,
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
  }, [guardianData]);

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

    setIsVerified(data?.isVerified);

    if (error) {
      console.error("Fetch error in verif table: ", error);
    }
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
      setIsVerified(verifData?.isVerified);
    }
  }, [user]);

  //ANCHOR - pregnant fetch
  const fetchPregnant = async () => {
    // Get the current logged in user
    const { error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching auth user:", userError);
      throw new Error("No active session / user");
    }

    const { data, error } = await supabase
      .from("pregnant")
      .select("*")
      .eq("userID", user.id);

    setUserPregnant({
      dueDate: data?.[0]?.dueDate ?? "",
      trimester: data?.[0]?.trimester ?? "",
    });

    if (error) {
      console.error("Fetch error in pregnant table: ", error);
    }
    return data;
  };
  const { data: pregnantData, error: pregnantError } = useQuery({
    queryKey: ["pregnant"],
    queryFn: fetchPregnant,
    enabled: userVul.pregnantInfant[0] === "yes",
  });
  if (pregnantError) {
    console.error("Error in fetching pregnant table: ", pregnantError);
  }

  useEffect(() => {
    if (pregnantData) {
      setUserPregnant({
        dueDate: pregnantData?.dueDate,
        trimester: pregnantData?.trimester,
      });
    }
  }, [user]);

  const getLocationRiskName = (streetName) => {
    const isExactMatch = (list) =>
      streetName &&
      list.some((street) => streetName.toLowerCase() === street.toLowerCase());

    return isExactMatch(criticalStreets)
      ? "Critical"
      : isExactMatch(highStreets)
      ? "High"
      : isExactMatch(moderateStreets)
      ? "Moderate"
      : "Low";
  };
  const getLocationRiskLevel = (streetName) => {
    const isExactMatch = (list) =>
      streetName &&
      list.some((street) => streetName.toLowerCase() === street.toLowerCase());

    return isExactMatch(criticalStreets)
      ? 3
      : isExactMatch(highStreets)
      ? 2
      : isExactMatch(moderateStreets)
      ? 1
      : 0;
  };

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
          setUserData((prev) => ({
            ...prev,
            ...payload.new,
            dob: payload.new.dateOfBirth ?? prev.dob,
          }));
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
          setUserAddress((prev) => ({
            ...prev,
            ...payload.new,
          }));
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

    // VERIFICATION table subscription
    const pregnantSub = supabase
      .channel("pregnant-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pregnant",
          filter: `userID=eq.${user.id}`,
        },
        (payload) => {
          setIsVerified(payload.new);
          queryClient.invalidateQueries(["pregnant"]);
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
      supabase.removeChannel(pregnantSub);
    };
  }, [user?.id]);


  //ANCHOR - invalidates for refetch and get new data
  useEffect(() => {
    queryClient.invalidateQueries(["user", user.id]);
    queryClient.invalidateQueries(["address"]);
    queryClient.invalidateQueries(["guardian", user.id]);
    queryClient.invalidateQueries(["vulnerabilityList"]);
    queryClient.invalidateQueries(["verification"]);
  }, []);

  // Handle Cancel Logic - profile update
  const handleCancel = (section) => {
    // 1. Reset Errors
    setFormErrors({});
    
    // 2. Close edit mode for the section
    setEditingSections((prev) => ({
      ...prev,
      [section]: false,
    }));

    // 3. Re-fetch data to revert changes
    if (section === "userData") {
      refetchUser();
    } else if (section === "address") {
      refetchAddress();
    } else if (section === "guardian") {
      refetchGuardian();
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    // Validate Personal Info if editing
    if (editingSections.userData) {
      if (!userData.firstName || !userData.firstName.trim()) {
        errors.firstName = "First Name is required";
      }
      if (!userData.surname || !userData.surname.trim()) {
        errors.surname = "Surname is required";
      }
      // Check for null, empty string, or "None"
      if (!userData.sex || userData.sex === "None" || userData.sex.trim() === "") {
        errors.sex = "Sex is required";
      }
      if (!userData.dob) {
        errors.dob = "Date of Birth is required";
      }
      if (!userData.userNumber || !userData.userNumber.trim()) {
        errors.userNumber = "Contact Number is required";
      }
      if (!userData.householdSize) {
        errors.householdSize = "Household Size is required";
      }
    }

    // Validate Address if editing
    if (editingSections.address) {
      if (!userAddress.houseInfo || !userAddress.houseInfo.trim()) {
        errors.houseInfo = "House Info is required";
      }
      if (!userAddress.streetName || !userAddress.streetName.trim()) {
        errors.streetName = "Street is required";
      }
      if (!userAddress.brgyName || !userAddress.brgyName.trim()) {
        errors.brgyName = "Barangay is required";
      }
      if (!userAddress.cityName || !userAddress.cityName.trim()) {
        errors.cityName = "City is required";
      }
    }

    // Validate Guardian if editing
    if (editingSections.guardian) {
      if (!userGuardian.fullName || !userGuardian.fullName.trim()) {
        errors.fullName = "Name is required";
      }
      if (!userGuardian.relationship || !userGuardian.relationship.trim()) {
        errors.relationship = "Relationship is required";
      }
      if (!userGuardian.guardianContact || !userGuardian.guardianContact.trim()) {
        errors.guardianContact = "Contact is required";
      }
      if (!userGuardian.guardianAddress || !userGuardian.guardianAddress.trim()) {
        errors.guardianAddress = "Address is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  //ANCHOR - update tables here
  const saveChanges = async () => {
    try {
      // 1. Run Validation
      if (!validateForm()) {
        
        return; 
      }

      const newAge = differenceInYears(new Date(), new Date(userData.dob));

      //ANCHOR - encryption for update
      const [
        efirstName,
        emiddleName,
        esurname,
        eage,
        edob,
        euserNumber,
        //address
        ehouseInfo,
        estreetName,
        ebrgyName,
        ecityName,
        egeolocationCoords,
        //guardian
        efullName,
        erelationship,
        eguardianContact,
        eguardianAddress,
      ] = await Promise.all([
        encryptData(userData.firstName),
        userData?.middleName ? encryptData(userData?.middleName) : null,
        encryptData(userData.surname),
        encryptData(newAge),
        encryptData(userData.dob),
        encryptData(userData.userNumber),
        //address
        encryptData(userAddress.houseInfo),
        encryptData(userAddress.streetName),
        encryptData(userAddress.brgyName),
        encryptData(userAddress.cityName),
        encryptData(userAddress.geolocationCoords),
        //guardian
        encryptData(userGuardian.fullName),
        encryptData(userGuardian.relationship),
        encryptData(userGuardian.guardianContact),
        encryptData(userGuardian.guardianAddress),
      ]);

      await supabase
        .from("user")
        .update({
          firstName: efirstName,
          middleName: emiddleName,
          surname: esurname,
          age: eage,
          sex: userData.sex,
          dateOfBirth: edob,
          userNumber: euserNumber,
          householdSize: userData.householdSize,
          hasGuardian: userData.hasGuardian,
        })
        .eq("userID", user.id)
        .select();

      // Update address table ###########################################
      await supabase
        .from("address")
        .update({
          houseInfo: ehouseInfo,
          streetName: estreetName,
          brgyName: ebrgyName,
          cityName: ecityName,
          geolocationCoords: egeolocationCoords,
        })
        .eq("userID", user.id);

      // Update guardian table (if exists) ##############################
      await supabase
        .from("guardian")
        .update({
          fullName: efullName,
          relationship: erelationship,
          guardianContact: eguardianContact,
          guardianAddress: eguardianAddress,
        })
        .eq("userID", user.id);

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
          locationRiskLevel: getLocationRiskName(userAddress.streetName),
        })
        .eq("userID", user.id);

      Alert.alert("Success", "Profile updated!");

      const age = differenceInYears(new Date(), new Date(userData.dob));
      await supabase
        .from("riskScore")
        .update({
          // 60 - 69
          elderlyScore:
            age >= 90
              ? 4 // 90+
              : age >= 80
              ? 3 // 80 - 89
              : age >= 70
              ? 2 // 70 - 79
              : age >= 60
              ? 2
              : 0,
          locationRiskLevel: getLocationRiskLevel(userAddress.streetName),
        })
        .eq("userID", user.id);

      const { data: riskData, error: riskError } = await supabase
        .from("riskScore")
        .select("*")
        .eq("userID", user.id)
        .single();
      if (riskError) {
        console.error("Error in updating risk table: ", riskError);
      } else {
        // console.log("risk data", riskData);
      }

      //ANCHOR - PRIO API CONNECTION
      const getPrioritization = async () => {
        try {
          const response = await fetch(
            "https://ffxzuvjivql5sbw3zahbv4qi2q0tgwxj.lambda-url.ap-southeast-1.on.aws/predict",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                values: {
                  ElderlyScore: riskData.elderlyScore,
                  PregnantOrInfantScore: riskData.pregnantInfantScore,
                  PhysicalPWDScore: riskData.physicalPWDScore,
                  PsychPWDScore: riskData.psychPWDScore,
                  SensoryPWDScore: riskData.sensoryPWDScore,
                  MedicallyDependentScore: riskData.medDepScore,
                  // hasGuardian: riskData.hasGuardian,
                  locationRiskLevel: riskData.locationRiskLevel,
                },
              }),
            }
          );

          const result = await response.json();
          // console.log("Result: ", result.prediction);
          return result.prediction;
        } catch (error) {
          console.error("error in getting prioritization: ", error);
        }
      };
      // console.log("Prio DAta: ", riskData);

      const priorityLevel = await getPrioritization();
      // Create vulnerability record - with explicit userID
      const { data: priorityData, error: prioError } = await supabase
        .from("priority")
        .update({
          prioLevel: parseFloat(priorityLevel),
        })
        .eq("userID", user.id)
        .select("*")
        .single();

      // console.log("priorty: ", priorityData);
      if (prioError) {
        console.error("Error creating priorty:", prioError);
        throw new Error("Failed to create priorty record");
      }

      // Reset editing state back to false so button goes back to blue
      setEditingSections({
        userData: false,
        address: false,
        guardian: false,
        vulnerability: false,
      });
      // Clear errors on success
      setFormErrors({});
      
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const updateField = (section, field, value) => {
    // 1. Update the data
    if (section === "userData") {
      setUserData((prev) => ({ ...prev, [field]: value }));
    } else if (section === "guardian") {
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

    // 2. Clear validation errors
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
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
    dropdownItems = null // optional: array of {label, value}
  ) => {
    const isEditing = editingSections[section] && editable;
    const errorMessage = formErrors[field];

    let content = null;

    if (field === "streetName" && isEditing) {
      content = (
          <StreetDropdown
            value={value}
            onChange={(newValue) => updateField(section, field, newValue)}
            disabled={false}
          />
      );
    } else if (field === "brgyName" && isEditing) {
      content = (
          <BarangayDropdown
            value={value}
            onChange={(newValue) => updateField(section, field, newValue)}
            disabled={false}
          />
      );
    } else if (dropdownItems && isEditing) {
      content = (
        <View style={{ zIndex: 3000 }}>
          <DropDownPicker
            open={openDropdowns[field] || false}
            value={dropdownValues[field] ?? value} // controlled value
            items={dropdownItems}
            listMode='SCROLLVIEW'
            setOpen={(open) =>
              setOpenDropdowns((prev) => ({ ...prev, [field]: open }))
            }
            setValue={(callback) => {
              setDropdownValues((prev) => {
                const newValue = callback(prev[field]);
                updateField(section, field, newValue);
                return { ...prev, [field]: newValue };
              });
            }}
            placeholder={`Select ${label}`}
            style={[styles.dropdown, styles.editableInput, errorMessage && styles.inputErrorBorder]}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={2000}
            zIndexInverse={1000}
          />
        </View>
      );
    } else if (isEditing) {
      // Standard Text Input
      content = (
          <TextInput
            style={[styles.input, styles.editableInput, errorMessage && styles.inputErrorBorder]}
            value={value}
            onChangeText={(text) => updateField(section, field, text)}
            keyboardType={keyboardType}
          />
      );
    } else {
      // Read Only
      content = <Text style={styles.valueText}>{value || "—"}</Text>;
    }

    return (
      <View style={styles.rowItem}>
        <Text style={styles.label}>{label}</Text>
        {content}
        {isEditing && errorMessage && (
          <Text style={styles.fieldError}>{errorMessage}</Text>
        )}
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
    <ScrollView
      nestedScrollEnabled={true}
      contentContainerStyle={styles.container}
    >
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
            {userData.firstName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ') + " "} 
            {userData.middleName !== "" &&
              userData.middleName.charAt(0).toUpperCase() +
                userData.middleName.slice(1) +
                " "}
            {userData.surname.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')}
          </Text>

          <View style={styles.addressRow}>
            {/*<Feather name='map-pin' size={14} color='#007bff' /> */}
            <Text style={styles.address}>
              {userAddress.streetName.charAt(0).toUpperCase() +
                userAddress.streetName.slice(1)}
              ,{" " + userAddress.brgyName},
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
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#aaa" }]}
                onPress={() => handleCancel("userData")} // Use handleCancel
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
                userData.firstName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' '),
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
        {renderField("userData", "sex", "Sex", userData.sex, true, "default", [
          { label: "Male", value: "Male" },
          { label: "Female", value: "Female" },
        ])}

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
            <>
              <DOBField
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
                editable={true}
              />
              {formErrors.dob && (
                <Text style={styles.fieldError}>{formErrors.dob}</Text>
              )}
            </>
          ) : (
            <Text style={styles.valueText}>
              {new Date(userData.dob).toLocaleDateString("en-us", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }) || "—"}
            </Text>
          )}
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.label}>Age</Text>
          {editingSections.userData ? (
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData.age?.toString() || ""}
              editable={false} // optional: could be read-only
            />
          ) : (
            <Text style={styles.valueText}>{userData.age || "—"}</Text>
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
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Email</Text>
          {editingSections.userData ? (
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData.email || ""}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.valueText}>{userData.email || "-"}</Text>
          )}
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
              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* Cancel Button */}
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: "#aaa" }]}
                  onPress={() => handleCancel("address")} // Use handleCancel
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
            "houseInfo",
            "House Information",
            userAddress.houseInfo,
            true
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
          {/* <Text style={styles.label}>Barangay</Text> */}
          {/* <TextInput style={[styles.input, styles.disabledInput]} value={userAddress.brgyName || ""} editable={true} /> */}
        </View>
      </View>
      {/* <View style={styles.row}>{renderField("vulnerability", "Vulnerability", userData.vulnerability, false)}</View> */}

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
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#aaa" }]}
                onPress={() => handleCancel("guardian")} // Use handleCancel
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
            style={{ marginRight: 4, marginBottom: -15 }}
          />
          <Text style={[styles.ellipsisText, { marginBottom: -7 }]}>
            Update
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          marginTop: 10,
          backgroundColor: "#e6f0ff",
          borderRadius: 8,
          padding: 10,
          maxWidth: "100%", // ensures it doesn't overflow
        }}
      >
        <Feather
          name='alert-circle'
          size={22}
          color='#007bff'
          style={{ marginRight: 8 }}
        />
        <Text
          style={{
            fontSize: 15,
            color: "#007bff",
            fontWeight: "600",
            flex: 1,
            flexWrap: "wrap",
            flexShrink: 1,
          }}
          numberOfLines={3}
          ellipsizeMode='tail'
        >
          Update your vulnerability information to help us prioritize your
          safety!
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      ></View>

      <View style={styles.row}>
        <Feather
          name='user'
          size={18}
          color='#007bff'
          style={{ marginRight: 6 }}
        />
        {renderField(
          "vulnerability",
          "elderly",
          "Age-related",
          userVul.elderly.toString() === "true" ? "Elderly" : "Not Elderly",
          true
        )}
      </View>

      <View style={styles.row}>
        {userVul.pregnantInfant[0] === "yes" && (
          <>
            <View style={styles.rowItem}>
              <MaterialIcons
                name='pregnant-woman'
                size={18}
                color='#b94e7a'
                style={{ marginRight: 6 }}
              />
              {renderField(
                "vulnerability",
                "pregnantInfant",
                "Pregnant",
                userVul.pregnantInfant[0] === "yes" ? "Yes" : "No" || "",
                true
              )}
            </View>
            <View style={styles.rowItem}>
              <Feather
                name='calendar'
                size={18}
                color='#007bff'
                style={{ marginRight: 6 }}
              />
              {renderField(
                "vulnerability",
                "pregnant",
                "Trimester",
                userPregnant?.trimester,
                true
              )}
            </View>
            <View style={styles.rowItem}>
              <Feather
                name='calendar'
                size={18}
                color='#007bff'
                style={{ marginRight: 6 }}
              />
              {renderField(
                "vulnerability",
                "pregnant",
                "Due Date",
                new Date(userPregnant?.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                }),
                true
              )}
            </View>
          </>
        )}
      </View>
      {userVul.pregnantInfant[1] === "yes" && (
        <View style={styles.row}>
          <MaterialIcons
            name='child-care'
            size={18}
            color='#3a6cb7'
            style={{ marginRight: 6 }}
          />
          {renderField(
            "vulnerability",
            "pregnantInfant",
            "With Infant",
            userVul.pregnantInfant[1] === "yes" ? "Yes" : "No" || "",
            true
          )}
        </View>
      )}
      <View style={styles.row}>
        <Feather
          name='activity'
          size={18}
          color='#2a7a3b'
          style={{ marginRight: 6 }}
        />
        {renderField(
          "vulnerability",
          "physicalPWD",
          "Physical Disability",
          Array.isArray(userVul.physicalPWD)
            ? userVul.physicalPWD.join(", ")
            : userVul.physicalPWD?.toString() || "",
          true
        )}
      </View>

      <View style={styles.row}>
        <MaterialIcons
          name='psychology'
          size={18}
          color='#b98c2a'
          style={{ marginRight: 6 }}
        />
        {renderField(
          "vulnerability",
          "psychPWD",
          "Psychological Disability",
          Array.isArray(userVul.psychPWD[0])
            ? userVul.psychPWD[0].join(", ")
            : userVul.psychPWD?.toString() || "",
          true
        )}
      </View>

      <View style={styles.row}>
        <Feather
          name='eye'
          size={18}
          color='#6c4eb9'
          style={{ marginRight: 6 }}
        />
        {renderField(
          "vulnerability",
          "sensoryPWD",
          "Sensory Disability",
          Array.isArray(userVul.sensoryPWD)
            ? userVul.sensoryPWD.join(", ")
            : userVul.sensoryPWD?.toString() || "",
          true
        )}
      </View>

      <View style={styles.row}>
        <MaterialIcons
          name='medical-services'
          size={18}
          color='#2ab9a3'
          style={{ marginRight: 6 }}
        />
        {renderField(
          "vulnerability",
          "medDep",
          "Medically Dependent",
          Array.isArray(userVul.medDep)
            ? userVul.medDep.join(", ")
            : userVul.medDep?.toString() || "",
          true
        )}
      </View>

      <View style={styles.row}>
        <Feather
          name='map-pin'
          size={18}
          color='#007bff'
          style={{ marginRight: 6 }}
        />
        {renderField(
          "vulnerability",
          "locationRiskLevel",
          "Location Risk Level",
          userVul.locationRiskLevel.toString(),
          false
        )}
      </View>

      {/* Buttons */}
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.rowButton}
        onPress={() => setShowPasswordModal(true)}
      >
        <Feather
          name='lock'
          size={20}
          color='#0060ff'
          style={{ marginRight: 8 }}
        />
        <Text style={styles.rowButtonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Change MPIN Button */}
      <TouchableOpacity
        style={styles.rowButton}
        onPress={() => setShowMpinModal(true)}
      >
        <Feather
          name='shield'
          size={20}
          color='#0060ff'
          style={{ marginRight: 8 }}
        />
        <Text style={styles.rowButtonText}>Change MPIN</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.rowButton} onPress={handleLogout}>
        <Feather
          name='log-out'
          size={20}
          color='#0060ff'
          style={{ marginRight: 8 }}
        />
        <Text style={styles.rowButtonText}>Logout</Text>
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
  address: { fontSize: 15, color: "#555", marginLeft: 4, textAlign: "center" },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    textAlign: "center",
  },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007bff",
    marginBottom: -15,
  },
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
  
  inputErrorBorder: {
    borderColor: Colors.warning,
    borderWidth: 1.5,
  },

  editableInput: {
    backgroundColor: "#e6f0ff",
    borderColor: "#007bff",
  },

  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#555",
  },
  
  fieldError: {
    color: Colors.warning || "red",
    fontSize: 12, 
    marginTop: 4,
    marginLeft: 2
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
    marginBottom: -15,
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
    height: 88,
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
    marginBottom: 0,
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
    marginBottom: -15,
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },

  saveButtonText: {
    color: "#fff",
    marginLeft: 5,
  },

  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowButtonText: {
    fontSize: 16,
    color: "#0060ff",
  },
});