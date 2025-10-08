import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import ThemedView from "../../components/ThemedView";
import ThemedLogo from "../../components/ThemedLogo";
import ThemedText from "../../components/ThemedText";
import Spacer from "../../components/Spacer";
import BackNextButtons from "../../components/buttons/BackNextButtons";
import { useUser } from "../../hooks/useUser";
import supabase from "../../contexts/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import mime from "mime";
import { decode as atob, encode as btoa } from "base-64";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import Logo from "../../assets/RESBACLogo.png";
import TitleText from "../../components/TitleText";

export default function uploadID() {
  let pregnantID = null; // not insecure, its sandwiched anyways
  const { user } = useUser();
  const [image, setImage] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { userData } = useLocalSearchParams();
  const { register } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  // no risk level 0 since no area is submerged during alert 1
  const moderateStreets = [ // risk level 1
    "Bagong Farmers Avenue 1", //
    "Banner Street", //
    "Camia Street", //
    "Cattleya Street", //
    "Crescent Street", //
    "Daisy Street", //
    "Jasmin Street", //
    "Jewelmark Street",  //
    "Katipunan Street", //
    "Lacewing Street", //
    "Liwanag Street Area",
    "Mil Flores Street", //
    "Monarch Street", //
    "Moscow Street", //
    "Okra Street", //
    "Silverdrop Street", //
    "Sunkist Street", //
    "Swallowtail Street", //

  ]
  const highStreets = [
    "Angel Santos Street", //
    "Ilaw Street", //
    "Kangkong Street", //
    "Labanos Street", //
    "Palay Street", //
    "Upo Street" //
  ]
  const criticalStreets = [
    "Ampalaya Street", //
    "Bagong Farmers Avenue 2", //
    "Ilaw Street", //
    "Mais Street", //
    "Pipino Street", //
    "Road 1",
    "Road 2",
    "Road 3",
    "Road 4",
    "Road 5",
    "Road Dike",
    "Singkamas Street", //
    "Talong Street", //
  ]

  // Parse all the collected user data
  const completeUserData = userData ? JSON.parse(userData) : {};
  // console.log("Complete user data in uploadID:", completeUserData);

  // Clean location data before saving to database
  // Both manual address and GPS verification are now required
  const getCleanLocationData = (userData) => {
    // house info
    const gpsHouseInfo = userData.houseInfo || "None"
    // Get GPS data
    const gpsCoordinates =
      userData.location && userData.location.coordinates
        ? `${userData.location.coordinates.latitude},${userData.location.coordinates.longitude}`
        : defaultCoordinates;

    const gpsCityName = userData.location?.address?.city || "Unknown City";
    const gpsBrgyName =
      userData.barangay ||
      userData.location?.address?.barangay ||
      userData.location?.address?.subLocality ||
      userData.location?.address?.village ||
      userData.location?.address?.neighborhood

    const gpsStreetName =
      userData.street ||
      userData.location?.address?.road ||
      userData.location?.address?.street ||
      userData.location?.address?.route ||
      userData.location?.address?.address_line

    return {
      houseInfo: gpsHouseInfo,
      streetName: gpsStreetName,
      cityName: gpsCityName,
      brgyName: gpsBrgyName,
      coordinates: gpsCoordinates,
    };
  };

  //ANCHOR - pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const isValid = validateFile(file);

      if (isValid) {
        setImage(file.uri);
        // uploadProofs(file.uri)
      }
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
  const uploadProofs = async (uri, userID) => {
    try {
      setIsUploading(true); // loading
      if (!userID) throw new Error("No user id!");

      // const ext = uri.split(".").pop();
      // const filename = `users/${user.id}_profile.${ext}`
      const filename = `users/${userID}proof.jpeg`;

      const jpegUri = await toJPEG(uri);
      const base64 = await FileSystem.readAsStringAsync(jpegUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // convert to binary
      const imgBlob = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // const contentType = mime.getType(uri) || "image/jpeg"
      const contentType = "image/jpeg";

      const { error } = await supabase.storage
        .from("proofs")
        .upload(filename, imgBlob, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error("Error in supabase bucket upload: ", error);
      }

      await fetchProofs(filename, userID);
    } catch (error) {
      console.error("Image upload error in upload proof: ", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsUploading(false); // stop loading
    }
  };

  //ANCHOR - fetch image
  const fetchProofs = async (path, userID) => {
    if (!path) {
      Alert.alert("Null", "No path!");
    }

    const { data, error } = await supabase.storage
      .from("proofs")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 99);

    if (error) {
      console.error("Error creating signed URL: ", error);
      return null;
    }

    await supabase
      .from("verification")
      .update({
        proofFile: data.signedUrl,
      })
      .eq("userID", userID)
      .select();
  };

  const validateFile = (file) => {
    const allowedExtensions = ["jpeg", "jpg", "png", "heic", "heif"];
    const maxSizeMB = 5;
    const sizeMB = file.fileSize ? file.fileSize / 1024 / 1024 : 0;

    const uri = file.uri || "";
    const ext = uri.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      Alert.alert(
        "Invalid File",
        "Only JPEG, PNG, and HEIC images are allowed."
      );
      return false;
    }

    if (sizeMB > maxSizeMB) {
      Alert.alert("File Too Large", "Maximum file size is 5MB.");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!image) {
      Alert.alert("Missing ID", "Please upload a valid ID before proceeding.");
      return;
    }

    if (!completeUserData.email || !completeUserData.password) {
      Alert.alert("Error", "Missing registration data. Please start over.");
      return;
    }

    setIsCreating(true);

    //ANCHOR - INSERT TO SUPA
    try {
      console.log("Creating Supabase account...");

      // Create the Supabase account with email/password
      const cleanEmail = completeUserData.email.trim();
      const authResult = await register(cleanEmail, completeUserData.password);

      console.log("Account created successfully!");
      console.log("User ID:", authResult.user.id);

      // Verify authentication session is properly established
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log("Session check after registration:", session?.user?.id);

      if (!session?.user?.id) {
        throw new Error("User not properly authenticated");
      }

      console.log("Saving profile data to database...");

      // Get clean location data
      const locationData = getCleanLocationData(completeUserData);
      // console.log("Clean location data:", locationData);

      // Create address record
      const { data: addressData, error: addressError } = await supabase
        .from("address")
        .insert({
          houseInfo: locationData.houseInfo,
          streetName: locationData.streetName,
          brgyName: locationData.brgyName,
          cityName: locationData.cityName,
          geolocationCoords: locationData.coordinates,
          userID: authResult.user.id,
        })
        .select("*")
        .single();

      if (addressError) {
        console.error("Error creating address:", addressError);
        throw new Error("Failed to create address record");
      }

      // console.log("Address created:", addressData);

      //ANCHOR - CLUSTERING
      const { data: clusterData, error: clusterError } = await supabase
        .from("cluster")
        .select();

      if (clusterError) {
        console.error("Error fetching cluster data:", clusterError);
      }

      const response = await fetch(
        "https://kmeanscluster.onrender.com/cluster",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            n_clusters:
              clusterData.length < 1
                ? 1
                : Math.max(...clusterData.map((c) => c.clusterNumber)),
            data: [
              {
                userID: authResult.user.id,
                coords: locationData.coordinates.split(",").map(Number),
              },
            ],
          }),
        }
      );

      const result = await response.json();
      // console.log("Result: ", result.clusters);

      let clusterID = null;
      //ANCHOR - update cluster table
      for (const c of result.clusters) {
        const { data: clusterRow, error: clusterUpsertError } = await supabase
          .from("cluster")
          .upsert(
            {
              userID: c.userID,
              clusterNumber: c.cluster + 1,
            },
            { onConflict: ["userID"] } // ensures update if exists
          )
          .select("*");

        if (clusterUpsertError) {
          console.error(`Error updating userID:`, clusterUpsertError);
          continue;
        } else {
          // console.log("Cluster row:", clusterRow);
          if (c.userID === authResult.user.id) {
            clusterID = clusterRow[0].id; // keep your new user’s cluster
          }
        }
      }

      // Create guardian record if guardian exists - with explicit userID
      const guardianData =
        completeUserData.vulnerability?.hasGuardian === "yes" &&
        completeUserData.vulnerability?.guardianInfo
          ? await (async () => {
              const guardian = completeUserData.vulnerability.guardianInfo;
              const { data: guardianResult, error: guardianError } =
                await supabase
                  .from("guardian")
                  .insert({
                    fullName: guardian.name || "Unknown Guardian",
                    relationship: guardian.relationship || "Unknown",
                    guardianContact: guardian.contact || "0000000000",
                    guardianAddress: guardian.address || "Unknown Address",
                    userID: authResult.user.id,
                  })
                  .select("*")
                  .single();

              if (guardianError) {
                console.error("Error creating guardian:", guardianError);
                return null;
              } else {
                // console.log("Guardian created:", guardianResult);
                return guardianResult;
              }
            })()
          : null;

      if (
        completeUserData.sex === "Female" &&
        completeUserData.vulnerability?.pregnancy === "yes"
      ) {
        const { data: pregnantData, error: pregnantError } = await supabase
          .from("pregnant")
          .insert({
            dueDate: completeUserData.vulnerability?.dueDate,
            trimester: completeUserData.vulnerability?.trimester,
            userID: authResult.user.id,
          })
          .select("*")
          .single();

        if (pregnantError) {
          console.error("Error inserting to pregnant table:", pregnantError);
          throw new Error("Failed to create in pregnant table");
        }

        // console.log("Pregnant entry created:", pregnantData);
        pregnantID = pregnantData.id;
      }

      const { data: vulStatusData, error: vulStatusError } = await supabase
        .from("vulStatus")
        .insert({
          physicalStatus: completeUserData.vulnerability?.isPDPermanent,
          psychStatus: completeUserData.vulnerability?.isPSYPermament,
          sensoryStatus: completeUserData.vulnerability?.isSDPermament,
          medDepStatus: completeUserData.vulnerability?.isMDPermament,
          userID: authResult.user.id,
        })
        .select()
        .single();

      if (vulStatusError) {
        console.error("Error in insert in vulstatus table: ", vulStatusError);
      }
      // console.log("Vulnerability list created:", vulnerabilityListData);

      // Create vulnerability list record - with explicit userID
      const { data: vulnerabilityListData, error: vulListError } =
        await supabase
          .from("vulnerabilityList")
          .insert({
            elderly: completeUserData.vulnerability?.elderly,
            pregnantInfant: [
              ...(completeUserData.vulnerability?.pregnancy === "yes"
                ? ["yes"]
                : ["no"]),
              ...(completeUserData.vulnerability?.infant === "yes"
                ? ["yes"]
                : ["no"]),
            ],
            physicalPWD:
              completeUserData.vulnerability?.physicalDisability || [],
            psychPWD: completeUserData.vulnerability?.psychologicalDisability
              ? completeUserData.vulnerability.psychologicalDisability
              : [],
            sensoryPWD: completeUserData.vulnerability?.sensoryDisability || [],
            medDep: completeUserData.vulnerability?.healthCondition || [],
            locationRiskLevel: 
              criticalStreets.some((street)=> locationData.streetName.toLowerCase().includes(street.toLowerCase())) ? "Critical" :
              highStreets.some((street)=> locationData.streetName.toLowerCase().includes(street.toLowerCase())) ? "High" : 
              moderateStreets.some((street)=> locationData.streetName.toLowerCase().includes(street.toLowerCase())) ? "Moderate" : "Low",
            userID: authResult.user.id,
            pregnantID: pregnantID,
          })
          .select("*")
          .single();

      if (vulListError) {
        console.error("Error creating vulnerability list:", vulListError);
        throw new Error("Failed to create vulnerability list");
      }
      // console.log("Vulnerability list created:", vulnerabilityListData);

      const {
        data: { user }
      } = await supabase.auth.getUser();

      const { data: riskData, error: riskError } = await supabase
        .from("riskScore")
        .insert({
          // 60 - 69
          elderlyScore:
            completeUserData.age >= 90
              ? 4 // 90+
              : completeUserData.age >= 80
              ? 3 // 80 - 89
              : completeUserData.age >= 70
              ? 2 // 70 - 79
              : completeUserData.age >= 60
              ? 2
              : 0,
          pregnantInfantScore:
            completeUserData.vulnerability?.pregnancy === "yes" &&
            completeUserData.vulnerability?.infant === "yes"
              ? 4
              : completeUserData.vulnerability?.pregnancy === "yes" ||
                completeUserData.vulnerability?.infant === "yes"
              ? 2
              : 0,
          physicalPWDScore:
            completeUserData.vulnerability?.physicalDisability?.length > 2
              ? 4
              : completeUserData.vulnerability?.physicalDisability?.length === 2
              ? 2
              : completeUserData.vulnerability?.physicalDisability?.length === 1
              ? 1
              : 0,
          psychPWDScore:
            completeUserData.vulnerability?.psychologicalDisability?.length > 2
              ? 4
              : completeUserData.vulnerability?.psychologicalDisability
                  ?.length === 2
              ? 2
              : completeUserData.vulnerability?.psychologicalDisability
                  ?.length === 1
              ? 1
              : 0,
          sensoryPWDScore:
            completeUserData.vulnerability?.sensoryDisability?.length > 2
              ? 4
              : completeUserData.vulnerability?.sensoryDisability?.length === 2
              ? 2
              : completeUserData.vulnerability?.sensoryDisability?.length === 1
              ? 1
              : 0,
          medDepScore:
            completeUserData.vulnerability?.healthCondition?.length > 0 ? 4 : 0,
          locationRiskLevel: 
            criticalStreets.some((street)=> locationData.streetName.toLowerCase().includes(street.toLowerCase())) ? 3 :
            highStreets.some((street)=> locationData.streetName.toLowerCase().includes(street.toLowerCase())) ? 2 : 
            moderateStreets.some((street)=> locationData.streetName.toLowerCase().includes(street.toLowerCase())) ? 1 : 0,
          userID: authResult.user.id,
        })
        .select("*")
        .single();
      if (riskError) {
        console.error("Error creating riskscore list:", riskError);
        throw new Error("Failed to create riskscore list");
      }
      // console.log("riskscore list created:", riskData);

      //ANCHOR - PRIO API CONNECTION
      const getPrioritization = async () => {
        try {
          const response = await fetch("https://xgprio.onrender.com/predict", {
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
          });

          const result = await response.json();
          // console.log("Result: ", result.prediction);
          return result.prediction;
        } catch (error) {
          console.error("error in getting prioritization: ", error);
        }
      };

      const priorityLevel = await getPrioritization();
      // Create vulnerability record - with explicit userID
      const { data: priorityData, error: prioError } = await supabase
        .from("priority")
        .insert({
          prioLevel: parseFloat(priorityLevel),
          riskScoreID: riskData.id,
          userID: authResult.user.id,
        })
        .select("*")
        .single();

      if (prioError) {
        console.error("Error creating priorty:", prioError);
        throw new Error("Failed to create priorty record");
      }
      
      // Create vulnerability record - with explicit userID
      const { data: statusData, error: statusError } = await supabase
        .from("requestStatus")
        .insert({
          userID: authResult.user.id,
        })
        .select("*")
        .single();

      console.log("priorty: ", statusData);
      if (statusError) {
        console.error("Error creating status:", statusError);
      }

      // Create vulnerability record - with explicit userID
      const { data: vulnerabilityData, error: vulError } = await supabase
        .from("vulnerability")
        .insert({
          vulListID: vulnerabilityListData.id,
          vulStatusID: vulStatusData.id,
          userID: user.id,
        })
        .select("*")
        .single();

      if (vulError) {
        console.error("Error creating vulnerability:", vulError);
        throw new Error("Failed to create vulnerability record");
      }

      //TODO - add verification table insert somewhere here
      const { data: verifData, error: verifError } = await supabase
        .from("verification")
        .insert({
          isVerified: false, // will turn true after admin
          proofFile: image,
          userID: authResult.user.id,
        })
        .select("*")
        .single();

      if (verifError) {
        console.error("Error creating verification:", verifError);
        throw new Error("Failed to create verification record");
      }

      const { error: userError } = await supabase
        .from("user")
        .insert({
          userID: authResult.user.id,
          firstName: completeUserData.firstName || "Unknown",
          middleName: completeUserData.middleName || "",
          surname: completeUserData.surname || "User",
          sex: completeUserData.sex || "",
          dateOfBirth: completeUserData.dob || new Date("2025-01-01"),
          age: completeUserData.age || 0,
          mpin: Math.floor(1000 + Math.random() * 9000).toString(),
          userNumber: completeUserData.contactNumber || "0000000000",
          householdSize:
            parseInt(completeUserData.vulnerability?.householdCount) || 1,
          addressID: addressData.id,
          statusID: statusData.id,
          hasGuardian: completeUserData.vulnerability?.hasGuardian === "yes",
          guardianID: guardianData?.id || null,
          vulnerabilityID: vulnerabilityData.id,
          verificationID: verifData.id,
          prioID: priorityData.id,
          clusterID: clusterID,
        })
        .select("*");

      if (userError) {
        console.error("Error creating user:", userError);
        throw new Error("Failed to create user record: " + userError.message);
      }

      console.log("User profile saved successfully!");

      // Add the uploaded ID to the complete user data
      const finalUserData = {
        ...completeUserData,
        uploadedID: image,
        isVerified: verifData.isVerified,
        step: "complete",
        completedAt: new Date().toISOString(),
      };

      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: completeUserData.password,
        });
      if (loginError) {
        console.error("Error in login after registration: ", loginError);
      }
      const currentUser = loginData.user;

      // console.log("Current user: ", currentUser);
      // console.log("Final user data:", finalUserData);

      // Navigate to MPIN setup instead of dashboard
      console.log("Redirecting to MPIN setup...");
      console.log(
        "Final user data being passed:",
        JSON.stringify(finalUserData).substring(0, 200) + "..."
      );

      // TODO - upload file to supabase storage
      await uploadProofs(image, authResult.user.id);

      router.replace({
        pathname: "/mpinSetup",
        params: {
          userData: JSON.stringify({
            ...finalUserData,
            userID: currentUser.id,
          }),
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.message || "Failed to create account. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fafafa" }}
        contentContainerStyle={styles.scrollContainer}
      >
        <ThemedView style={styles.container} safe={true}>
          <Spacer height={33} />
          <View style={styles.headerRow}>
            <Image source={Logo} style={styles.logo} />
            <View style={{ marginLeft: 11 }}>
              <TitleText type='title1' style={styles.title}>
                RESBAC
              </TitleText>
              <TitleText type='title3' style={{ marginLeft: 8 }}>
                Verification of Account
              </TitleText>
            </View>
          </View>
          <Spacer />

          {/* DEBUG: Show received data */}
          {completeUserData.name && (
            <Text
              style={{ textAlign: "center", color: "green", marginBottom: 10 }}
            >
              Almost done for: {completeUserData.name}
            </Text>
          )}

          <Spacer height={50} />
          <View style={{ width: "100%", alignItems: "flex-start" }}>
            <Text
              style={[styles.title1, { textAlign: "left", marginLeft: 15 }]}
            >
              Upload a photo of <Text style={styles.bold}>Valid ID</Text>
            </Text>
          </View>

          <Spacer height={5} />
          <View style={styles.uploadBox}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <Text style={styles.placeholderText}>No image selected</Text>
            )}
          </View>

          <TouchableOpacity style={styles.browseButton} onPress={pickImage}>
            <Text style={styles.browseText}>Browse Files</Text>
          </TouchableOpacity>

          <Text style={styles.supportedText}>
            Files supported: JPEG, PNG, HEIC{"\n"}
            Maximum Size: 5MB
          </Text>

          <View style={{ width: "100%", alignItems: "flex-start" }}>
            <Text style={styles.idListHeader}>
              These can be any of the following:
            </Text>
            <Text style={styles.idList}>
              - Philippine National ID (PhilID){"\n"}- Passport{"\n"}- Driver's
              License{"\n"}- Social Security System (SSS){"\n"}- Unified
              Multi-Purpose ID (UMID){"\n"}- PhilHealth ID{"\n"}- Voter's ID
              {"\n"}- Professional Regulation Commission (PRC) ID{"\n"}- Postal
              ID
            </Text>
          </View>

          <BackNextButtons
            onBack={() => router.back()}
            onNext={handleNext}
            nextDisabled={isCreating}
            nextText={isCreating ? "Creating Account..." : "Next: Set MPIN"}
          />
        </ThemedView>
      </ScrollView>
      {(isCreating || isUploading) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size='large' color='#0060ff' />
            <Text style={styles.loadingText}>
              {isUploading ? "Uploading ID..." : "Creating Account..."}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  bold: {
    fontWeight: "bold",
  },
  uploadBox: {
    width: 340,
    height: 180,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 11,
    borderColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  placeholderText: {
    color: "#888",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 11,
    resizeMode: "cover",
  },
  browseButton: {
    borderWidth: 1.5,
    borderColor: "#0060ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  browseText: {
    color: "#0060ff",
    fontWeight: "600",
    fontSize: 16,
  },
  supportedText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  idListHeader: {
    fontWeight: "600",
    marginBottom: 6,
  },
  idList: {
    fontSize: 14,
    color: "#444",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center", // Align to the center
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain", // prevent stretching
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)", // softer dim
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loadingBox: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8, // for Android shadow
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
