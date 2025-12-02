import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Button,
  Alert,
  Image,
} from "react-native";
import Logo from "../../assets/RESBACLogo.png";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackNextButtons from "../../components/buttons/BackNextButtons";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import { Colors } from "../../constants/Colors";
import Spacer from "../../components/Spacer";
import ThemedLogo from "../../components/ThemedLogo";
import TitleText from "../../components/TitleText";
import RadioGroup from "../../components/RadioComponent";
import ThemedTextInput from "../../components/ThemedTextInput";
import { Dropdown } from "react-native-element-dropdown";
import CheckboxComponent from "../../components/CheckboxComponent";
import { useRoute } from "@react-navigation/native";
import { useState, useEffect } from "react";
import supabase from "../../contexts/supabaseClient";
import { useUser } from "../../hooks/useUser";
import { differenceInYears } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import DatePickerInput from "../../components/DatePickerInput";

const Vulnerable = () => {
  const { user } = useUser();
  const router = useRouter();
  const { userData } = useLocalSearchParams();

  // new add by ten
  const { from } = useLocalSearchParams();

  // Validation State
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (from === "profile") {
      // Prefill formData with userVul from Profile
    }
  }, [from]);

  const [formData, setFormData] = useState({
    elderly: "",
    pregnantInfant: "",
    physicalPWD: "",
    psychPWD: "",
    sensoryPWD: "",
    medDep: "",
    locationRiskLevel: "",
  });

  const handleSubmit = () => {
    if (from === "profile") {
      router.replace("/dashboard/profile"); // go back to Profile
    } else {
      router.push("/(auth)/nextStep"); // go to next registration step
    }
  };

  //NOTE - Added by raven
  const [userSex, setUserSex] = useState("");
  // Parse incoming data from register screen
  const existingUserData = userData ? JSON.parse(userData) : {};

  //form field state variables for guardian
  const [hasGuardian, setHasGuardian] = useState(null);
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");
  const [guardianAddress, setGuardianAddress] = useState("");
  const [householdCount, setHouseholdCount] = useState("");

  //form field state variables for disabilities
  const [physicalDisability, setPhysicalDisability] = useState([]);
  const [otherPhysicalDisability, setOtherPhysicalDisability] = useState("");
  const [psychologicalDisability, setPsychologicalDisability] = useState([]);
  const [otherPsychologicalDisability, setOtherPsychologicalDisability] =
    useState("");
  const [sensoryDisability, setSensoryDisability] = useState([]);
  const [otherSensoryDisability, setOtherSensoryDisability] = useState("");

  //new state for pregnancy
  const [pregnancy, setPregnancy] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [trimester, setTrimester] = useState("");
  const [hasInfant, setHasInfant] = useState(null);

  //new state for health conditions
  const [healthCondition, setHealthCondition] = useState([]);
  const [otherHealthCondition, setOtherHealthCondition] = useState("");

  //new state for mobility status in terms of evacuation
  const [mobilityStatus, setMobilityStatus] = useState(null);

  // new state for asking if vulnerability is permanent or not
  const [isPDPermanent, setIsPDPermanent] = useState(false);
  const [isSDPermament, setIsSDPermanent] = useState(false);
  const [isPSYPermament, setIsPSYPermament] = useState(false);
  const [isMDPermament, setIsMDPermament] = useState(false);

  // new state for showing the expand modal of disabilities
  const [showPhysicalDisabilityForm, setShowPhysicalDisabilityForm] =
    useState(false);
  const [showPsychologicalDisabilityForm, setShowPsychologicalDisabilityForm] =
    useState(false);
  const [showSensoryDisabilityForm, setShowSensoryDisabilityForm] =
    useState(false);
  const [showHealthConditionForm, setShowHealthConditionForm] = useState(false);

  // usestates for others checkbox trigger
  const [physicalTrigger, setPhysicalTrigger] = useState(false);
  const [psychTrigger, setPsychTrigger] = useState(false);
  const [sensoryTrigger, setSensoryTrigger] = useState(false);
  const [medDepTrigger, setMedDepTrigger] = useState(false);

  const [dueDateError, setDueDateError] = useState("");
  const [trimesterError, setTrimesterError] = useState("");

  const validatePregnancy = () => {
    let valid = true;

    // Validate due date
    if (pregnancy === "yes" && !dueDate) {
      setDueDateError("Due date is required when pregnant.");
      valid = false;
    } else {
      setDueDateError("");
    }

    // Validate trimester
    if (pregnancy === "yes" && trimester === "") {
      setTrimesterError("Please select a trimester.");
      valid = false;
    } else {
      setTrimesterError("");
    }

    return valid;
  };

  useEffect(() => {
    if (!sensoryTrigger) {
      setOtherSensoryDisability("");
      setSensoryDisability((prev) =>
        prev.filter((item) => item !== otherSensoryDisability)
      );
    }
  }, [sensoryTrigger]);

  //new data for pregnancy options
  const pregnancyOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  //new data for infant options
  const infantOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  // Data for the radio buttons
  const guardianOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  //data for the household count dropdown
  const householdData = Array.from({ length: 10 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
  }));

  //data for the mobility status
  const mobilityOptions = [
    { label: "Yes", value: "canEvacuate" },
    { label: "No", value: "requiresAssistance" },
  ];

  // Function to handle selections for Physical disabilities
  const togglePhysicalDisability = (disability) => {
    if (physicalDisability.includes(disability)) {
      setPhysicalDisability(
        physicalDisability.filter((item) => item !== disability)
      );
    } else {
      setPhysicalDisability([...physicalDisability, disability]);
    }
  };

  //Function to handle selection for psychological disabilities
  const togglePsychologicalDisability = (disability) => {
    if (psychologicalDisability.includes(disability)) {
      setPsychologicalDisability(
        psychologicalDisability.filter((item) => item !== disability)
      );
    } else {
      setPsychologicalDisability([...psychologicalDisability, disability]);
    }
  };

  // Function to handle selections for Sensory disabilities
  const toggleSensoryDisability = (disability) => {
    if (sensoryDisability.includes(disability)) {
      setSensoryDisability(
        sensoryDisability.filter((item) => item !== disability)
      );
    } else {
      setSensoryDisability([...sensoryDisability, disability]);
    }
  };

  // Function to handle selections for Health conditions
  const toggleHealthCondition = (condition) => {
    if (healthCondition.includes(condition)) {
      setHealthCondition(healthCondition.filter((item) => item !== condition));
    } else {
      setHealthCondition([...healthCondition, condition]);
    }
  };

  const fetchSex = async () => {
    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("userID", user.id)
      .single();

    if (error) {
      console.error("Error in fetching dateOfBirth in edit profile: ", error);
    }

    setUserSex(data.sex);
    return data;
  };

  useEffect(() => {
    if (from === "profile") {
      fetchSex();
    }
  }, [from]);

  // Helper to clear errors
  const clearFieldError = (fieldName) => {
    const newErrors = { ...formErrors };
    delete newErrors[fieldName];
    setFormErrors(newErrors);
  };

  // Validation Function
  const validateForm = () => {
    const errors = {};

    // Only run these validations during registration (or whenever the fields are visible)
    if (from === "register") {
      // Guardian Name
      if (!guardianName || guardianName.trim() === "") {
        errors.guardianName = "Guardian Name is required";
      }

      // Guardian Contact Number
      if (!guardianContact || guardianContact.trim() === "") {
        errors.guardianContact = "Guardian Contact Number is required";
      } else if (!/^\d{11}$/.test(guardianContact.replace(/[^0-9]/g, ""))) {
        errors.guardianContact = "Contact Number must be exactly 11 digits";
      }

      // Relationship
      if (!guardianRelation || guardianRelation.trim() === "") {
        errors.guardianRelation = "Relationship is required";
      }

      // Guardian Address
      if (!guardianAddress || guardianAddress.trim() === "") {
        errors.guardianAddress = "Guardian Address is required";
      }

      // Household Count
      if (!householdCount) {
        errors.householdCount = "Household count is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    console.log("Collecting vulnerability data...");

    if (!validatePregnancy()) return;

    // Validate Form First
    if (!validateForm()) {
      // Optional: Scroll to top or show a general error toast if needed
      return;
    }

    // Get sex from userData (should be available from register screen)
    const userSex = existingUserData.sex;
    const userDob = existingUserData.dob;

    // Combine existing data with vulnerability data
    const completeUserData = {
      ...existingUserData,
      // Vulnerability data
      vulnerability: {
        hasGuardian,
        guardianInfo: {
          name: guardianName,
          contact: guardianContact,
          relationship: guardianRelation,
          address: guardianAddress,
        },
        householdCount,
        elderly:
          differenceInYears(new Date(), new Date(userDob)) >= 60 ? true : false,
        physicalDisability,
        otherPhysicalDisability,
        psychologicalDisability,
        sensoryDisability,
        otherSensoryDisability,
        isPDPermanent,
        isPSYPermament,
        isSDPermament,
        isMDPermament,
        infant: hasInfant,
        pregnancy: userSex === "Female" ? pregnancy : null,
        dueDate: pregnancy === "yes" ? dueDate : null,
        trimester: pregnancy === "yes" ? trimester : null,
        healthCondition,
        mobilityStatus,
      },
      step: "vulnerability",
    };

    if (from === "register") {
      // Navigate to upload screen with all data
      router.push({
        pathname: "./uploadID",
        params: {
          userData: JSON.stringify(completeUserData),
        },
      });
    } else if (from === "profile") {
      try {
        const { data: existingPregnancy } = await supabase
          .from("pregnant")
          .select("*")
          .eq("userID", user.id)
          .single();
        if (pregnancy === "yes") {
          if (existingPregnancy) {
            await supabase
              .from("pregnant")
              .update({
                dueDate: dueDate,
                trimester: trimester,
              })
              .eq("userID", user.id);
          } else {
            const { data: pregnantData, error: pregnantError } = await supabase
              .from("pregnant")
              .insert({
                dueDate: dueDate,
                trimester: parseInt(trimester),
                userID: user.id,
              })
              .select();
            if (pregnantError) {
              console.error(
                "Error in inserting pregnant table: ",
                pregnantError
              );
            } else if (pregnantData && pregnantData.length > 0) {
              const { error } = await supabase
                .from("vulnerabilityList")
                .update({
                  pregnantID: pregnantData[0].id,
                })
                .eq("userID", user.id);

              if (error) {
                console.error("Error in updating vul pregnantID: ", error);
              }
            }
          }
        }
        const data = await fetchSex();
        // Update vulnerability table
        await supabase
          .from("vulnerabilityList")
          .update({
            elderly:
              differenceInYears(new Date(), new Date(data.dateOfBirth)) >= 60
                ? true
                : false,
            pregnantInfant: [
              data.sex === "Female"
                ? pregnancy === "yes"
                  ? "yes"
                  : "no"
                : "no",
              hasInfant || "no",
            ],
            physicalPWD: physicalDisability,
            psychPWD: psychologicalDisability,
            sensoryPWD: sensoryDisability,
            medDep: healthCondition,
          })
          .eq("userID", user.id);

        await supabase
          .from("vulStatus")
          .update({
            physicalStatus: isPDPermanent,
            psychStatus: isPSYPermament,
            sensoryStatus: isSDPermament,
            medDepStatus: isMDPermament,
          })
          .eq("userID", user.id);

        // Calculate Risk Scores
        const age = differenceInYears(new Date(), new Date(data.dateOfBirth));

        const { data: riskData, error: riskError } = await supabase
          .from("riskScore")
          .update({
            elderlyScore:
              age >= 90 ? 4 : age >= 80 ? 3 : age >= 70 ? 2 : age >= 60 ? 2 : 0,
            pregnantInfantScore:
              pregnancy === "yes" && hasInfant === "yes"
                ? 4
                : pregnancy === "yes" || hasInfant === "yes"
                ? 2
                : 0,
            physicalPWDScore:
              physicalDisability?.length > 2
                ? 4
                : physicalDisability?.length === 2
                ? 2
                : physicalDisability?.length === 1
                ? 1
                : 0,
            psychPWDScore:
              psychologicalDisability?.length > 2
                ? 4
                : psychologicalDisability?.length === 2
                ? 2
                : psychologicalDisability?.length === 1
                ? 1
                : 0,
            sensoryPWDScore:
              sensoryDisability?.length > 2
                ? 4
                : sensoryDisability?.length === 2
                ? 2
                : sensoryDisability?.length === 1
                ? 1
                : 0,
            medDepScore: healthCondition?.length > 0 ? 4 : 0,
          })
          .eq("userID", user.id)
          .select("*")
          .single();

        if (riskError) {
          console.error("Error creating riskscore list:", riskError);
          throw new Error("Failed to create riskscore list");
        }

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
                    locationRiskLevel: riskData.locationRiskLevel,
                  },
                }),
              }
            );

            const result = await response.json();
            return result.prediction;
          } catch (error) {
            console.error("error in getting prioritization: ", error);
          }
        };

        const priorityLevel = await getPrioritization();

        const { data: priorityData, error: prioError } = await supabase
          .from("priority")
          .update({
            prioLevel: parseFloat(priorityLevel),
            riskScoreID: riskData.id,
            userID: user.id,
          })
          .eq("riskScoreID", riskData.id);

        if (prioError) {
          console.error("Error creating priorty:", prioError);
          throw new Error("Failed to create priorty record");
        }

        Alert.alert(
          "Success",
          "Profile updated!",
          [
            {
              text: "Back to profile",
              onPress: () => router.replace("/(dashboard)/profile"),
            },
          ],
          { cancelable: false }
        );
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container} safe={true}>
          {/* Top part of the form */}
          <Spacer height={33} />
          <View style={styles.headerRow}>
            <Image source={Logo} style={styles.logo} />
            <View style={{ marginLeft: 11 }}>
              <TitleText type='title1' style={styles.title}>
                RESBAC
              </TitleText>
              <TitleText type='title3' style={{ marginLeft: 8 }}>
                Register to start your session
              </TitleText>
            </View>
          </View>
          <Spacer height={20} />
          <TitleText type='title3' style={{ textAlign: "center" }}>
            This will serve as your emergency details. {"\n"}Please fill-out all
            of the required details.
          </TitleText>
          <Spacer />
          {/* DEBUG: Show received data */}
          {existingUserData.name && (
            <TitleText
              type='title4'
              style={{ textAlign: "center", color: "green" }}
            >
              Data for: {existingUserData.name}
            </TitleText>
          )}
          {from === "register" && (
            <>
              <View style={styles.sectionHeader}>
                <TitleText type='title5'>Presence of Guardian</TitleText>
                <View style={styles.headerLine}></View>
              </View>

              {/* Guardian Inputs with Validation */}
              <>
                <ThemedTextInput
                  style={{ width: "95%", marginBottom: 10 }}
                  placeholder='Guardian Name'
                  value={guardianName}
                  onChangeText={(text) => {
                    setGuardianName(text);
                    clearFieldError("guardianName");
                  }}
                />
                {formErrors.guardianName && (
                  <Text style={styles.fieldError}>
                    {formErrors.guardianName}
                  </Text>
                )}

                <ThemedTextInput
                  style={{ width: "95%", marginBottom: 10 }}
                  placeholder='Guardian Contact Number'
                  value={guardianContact}
                  onChangeText={(text) => {
                    // Only allow up to 11 digits
                    const cleaned = text.replace(/[^0-9]/g, "");
                    if (cleaned.length <= 11) {
                      setGuardianContact(cleaned);
                      clearFieldError("guardianContact");
                    }
                  }}
                  keyboardType='phone-pad'
                  maxLength={11}
                />
                {formErrors.guardianContact && (
                  <Text style={styles.fieldError}>
                    {formErrors.guardianContact}
                  </Text>
                )}

                <ThemedTextInput
                  style={{ width: "95%", marginBottom: 10 }}
                  placeholder='Relationship'
                  value={guardianRelation}
                  onChangeText={(text) => {
                    setGuardianRelation(text);
                    clearFieldError("guardianRelation");
                  }}
                />
                {formErrors.guardianRelation && (
                  <Text style={styles.fieldError}>
                    {formErrors.guardianRelation}
                  </Text>
                )}

                <ThemedTextInput
                  style={{ width: "95%", marginBottom: 10 }}
                  placeholder='Guardian Address'
                  value={guardianAddress}
                  onChangeText={(text) => {
                    setGuardianAddress(text);
                    clearFieldError("guardianAddress");
                  }}
                />
                {formErrors.guardianAddress && (
                  <Text style={styles.fieldError}>
                    {formErrors.guardianAddress}
                  </Text>
                )}
              </>

              {/* Household count dropdown */}
              <View style={styles.dropdownContainer}>
                <TitleText type='title3' style={{ marginBottom: 5 }}>
                  How many people live in the same household?
                </TitleText>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  data={householdData}
                  maxHeight={200}
                  labelField='label'
                  valueField='value'
                  placeholder='Select count'
                  value={householdCount}
                  onChange={(item) => {
                    setHouseholdCount(item.value);
                    clearFieldError("householdCount");
                  }}
                />
                {formErrors.householdCount && (
                  <Text style={styles.fieldError}>
                    {formErrors.householdCount}
                  </Text>
                )}
              </View>
            </>
          )}
          {/* Pregnancy - should only appear if sex selected is female */}
          {(existingUserData.sex?.toLowerCase() === "female" ||
            userSex?.toLowerCase() === "female") && (
            <>
              <View style={styles.sectionHeader}>
                <TitleText type='title5'>Pregnancy and Infant</TitleText>
                <View style={styles.headerLine}></View>
              </View>
              <RadioGroup
                label='Are you currently pregnant?'
                options={pregnancyOptions}
                selectedValue={pregnancy}
                onValueChange={setPregnancy}
              />
              {pregnancy === "yes" && (
                <>
                  <DatePickerInput
                    value={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                    }}
                    minimumDate={new Date()}
                    maximumDate={new Date().setFullYear(
                      new Date().getFullYear() + 1
                    )}
                    placeholder='Due Date'
                  />
                  {dueDateError !== "" && (
                    <Text style={{ color: "red", marginTop: 2 }}>
                      {dueDateError}
                    </Text>
                  )}
                  <Picker
                    selectedValue={trimester}
                    onValueChange={(itemValue) => setTrimester(itemValue)}
                    style={{
                      width: "95%",
                      marginBottom: 10,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 8,
                      color: "#625f72",
                    }}
                    dropdownIconColor='#625f72'
                  >
                    <Picker.Item
                      label='Select trimester'
                      value=''
                      color='#625f72'
                    />
                    <Picker.Item
                      label='1st Trimester (Week 0 - Week 12)'
                      value='1'
                      color='#000'
                    />
                    <Picker.Item
                      label='2nd Trimester (Week 13 - Week 26)'
                      value='2'
                      color='#000'
                    />
                    <Picker.Item
                      label='3rd Trimester (Week 27 and up)'
                      value='3'
                      color='#000'
                    />
                  </Picker>
                  {trimesterError !== "" && (
                    <Text style={{ color: "red", marginBottom: 0 }}>
                      {trimesterError}
                    </Text>
                  )}
                </>
              )}
              <Spacer height={10} />
            </>
          )}
          <RadioGroup
            label='Do you have an infant? [0-60months old]?'
            options={infantOptions}
            selectedValue={hasInfant}
            onValueChange={setHasInfant}
          />
          {/* Physical Disabilities */}
          <View style={styles.sectionHeader}>
            <TitleText type='title5'>Physical Disability</TitleText>
            <View style={styles.headerLine}></View>
          </View>
          <CheckboxComponent
            label='Check if the individual has a Physical Disability'
            isChecked={showPhysicalDisabilityForm}
            onValueChange={setShowPhysicalDisabilityForm}
            style={styles.fullWidthCheckbox}
          />
          <Spacer height={5} />
          {showPhysicalDisabilityForm && (
            <View style={styles.vulnerabilityFormContainer}>
              <CheckboxComponent
                label='Is your Physical Disability permanent?'
                isChecked={isPDPermanent}
                onValueChange={setIsPDPermanent}
              />

              <Spacer height={10} />
              <TitleText type='title3' style={styles.categoryHeader}>
                Check all that may apply
              </TitleText>

              <CheckboxComponent
                label='Mobility Aid User'
                isChecked={physicalDisability.includes("Mobility Impaired")}
                onValueChange={() =>
                  togglePhysicalDisability("Mobility Impaired")
                }
              />
              <ThemedText style={styles.inputHint}>
                (e.g., uses wheelchair, saklay)
              </ThemedText>

              <View style={styles.checkboxColumns}>
                <CheckboxComponent
                  label='Amputee'
                  isChecked={physicalDisability.includes("Amputee")}
                  onValueChange={() => togglePhysicalDisability("Amputee")}
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Paralysis'
                  isChecked={physicalDisability.includes("Paralysis")}
                  onValueChange={() => togglePhysicalDisability("Paralysis")}
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Cerebral Palsy'
                  isChecked={physicalDisability.includes("Cerebral Palsy")}
                  onValueChange={() =>
                    togglePhysicalDisability("Cerebral Palsy")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Epilepsy'
                  isChecked={physicalDisability.includes("Epilepsy")}
                  onValueChange={() => togglePhysicalDisability("Epilepsy")}
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label="Parkinson's Disease"
                  isChecked={physicalDisability.includes("Parkinson's Disease")}
                  onValueChange={() =>
                    togglePhysicalDisability("Parkinson's Disease")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Muscle weakness'
                  isChecked={physicalDisability.includes("Muscle weakness")}
                  onValueChange={() =>
                    togglePhysicalDisability("Muscle weakness")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Scoliosis'
                  isChecked={physicalDisability.includes("Scoliosis")}
                  onValueChange={() => togglePhysicalDisability("Scoliosis")}
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Post-surgical Mobility Limitations'
                  isChecked={physicalDisability.includes(
                    "Post-surgical Mobility Limitations"
                  )}
                  onValueChange={() =>
                    togglePhysicalDisability(
                      "Post-surgical Mobility Limitations"
                    )
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Chronic pain conditions'
                  isChecked={physicalDisability.includes(
                    "Chronic pain conditions"
                  )}
                  onValueChange={() =>
                    togglePhysicalDisability("Chronic pain conditions")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label={"Others"}
                  isChecked={physicalTrigger}
                  onValueChange={() => setPhysicalTrigger((prev) => !prev)}
                  style={styles.halfWidthCheckbox}
                />
              </View>

              {physicalTrigger && (
                <ThemedTextInput
                  style={{ width: "100%", marginBottom: 10 }}
                  placeholder='Please specify'
                  value={otherPhysicalDisability}
                  onChangeText={(text) => {
                    setOtherPhysicalDisability(text);

                    setPhysicalDisability((prev) => {
                      const filtered = prev.filter(
                        (item) => item !== otherPhysicalDisability
                      );
                      return text.trim() ? [...filtered, text] : filtered;
                    });
                  }}
                />
              )}
            </View>
          )}
          {/* Psychological Disabilities */}
          <View style={styles.sectionHeader}>
            <TitleText type='title5'>Psychological Disability</TitleText>
            <View style={styles.headerLine}></View>
          </View>
          <CheckboxComponent
            label='Check if the individual has a Psychological Disability'
            isChecked={showPsychologicalDisabilityForm}
            onValueChange={setShowPsychologicalDisabilityForm}
            style={styles.fullWidthCheckbox}
          />
          <Spacer height={5} />
          {/* Show Psychological Disability Form*/}
          {showPsychologicalDisabilityForm && (
            <View style={styles.vulnerabilityFormContainer}>
              <CheckboxComponent
                label='Is your Psychological Disability permanent?'
                isChecked={isPSYPermament}
                onValueChange={setIsPSYPermament}
              />
              <Spacer height={10} />
              <TitleText type='title3' style={styles.categoryHeader}>
                Check all that may apply
              </TitleText>
              <CheckboxComponent
                label='Autism Spectrum Disorder'
                isChecked={psychologicalDisability.includes(
                  "Autism Spectrum Disorder"
                )}
                onValueChange={() =>
                  togglePsychologicalDisability("Autism Spectrum Disorder")
                }
              />
              <Spacer height={5} />
              <CheckboxComponent
                label='Post Traumatic Stress Disorder (PSTD)'
                isChecked={psychologicalDisability.includes(
                  "Post Traumatic Stress Disorder"
                )}
                onValueChange={() =>
                  togglePsychologicalDisability(
                    "Post Traumatic Stress Disorder"
                  )
                }
              />
              <View style={styles.checkboxColumns}>
                <CheckboxComponent
                  label='Down Syndrome'
                  isChecked={psychologicalDisability.includes("Down Syndrome")}
                  onValueChange={() =>
                    togglePsychologicalDisability("Down Syndrome")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Anxiety Disorder'
                  isChecked={psychologicalDisability.includes(
                    "Anxiety Disorder"
                  )}
                  onValueChange={() =>
                    togglePsychologicalDisability("Anxiety Disorder")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Dementia'
                  isChecked={psychologicalDisability.includes("Dementia")}
                  onValueChange={() =>
                    togglePsychologicalDisability("Dementia")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Schizophrenia'
                  isChecked={psychologicalDisability.includes("Schizophrenia")}
                  onValueChange={() =>
                    togglePsychologicalDisability("Schizophrenia")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Psychotic Disorders'
                  isChecked={psychologicalDisability.includes(
                    "Psychotic Disorders"
                  )}
                  onValueChange={() =>
                    togglePsychologicalDisability("Psychotic Disorders")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Others'
                  isChecked={psychTrigger}
                  onValueChange={() => setPsychTrigger((prev) => !prev)}
                  style={styles.halfWidthCheckbox}
                />
              </View>
              {psychTrigger && (
                <ThemedTextInput
                  style={{ width: "100%", marginBottom: 10 }}
                  placeholder='Please specify'
                  value={otherPsychologicalDisability}
                  onChangeText={(text) => {
                    setOtherPsychologicalDisability(text);

                    setPsychologicalDisability((prev) => {
                      const filtered = prev.filter(
                        (item) => item !== otherPsychologicalDisability
                      );
                      return text.trim() ? [...filtered, text] : filtered;
                    });
                  }}
                />
              )}
            </View>
          )}
          {/* Sensory Disabilities */}
          <View style={styles.sectionHeader}>
            <TitleText type='title5'>Sensory Disability</TitleText>
            <View style={styles.headerLine}></View>
          </View>
          <CheckboxComponent
            label='Check if the individual has a Sensory Disability'
            isChecked={showSensoryDisabilityForm}
            onValueChange={setShowSensoryDisabilityForm}
            style={styles.fullWidthCheckbox}
          />
          {/* Show Sensosry disability form*/}
          <Spacer height={5} />
          {showSensoryDisabilityForm && (
            <View style={styles.vulnerabilityFormContainer}>
              <CheckboxComponent
                label='Is your Sensory Disability permanent?'
                isChecked={isSDPermament}
                onValueChange={setIsSDPermanent}
              />
              <Spacer height={10} />
              <TitleText type='title3' style={styles.categoryHeader}>
                Check all that may apply
              </TitleText>
              <View style={styles.checkboxColumns}>
                <CheckboxComponent
                  label='Blind or Visually Impaired'
                  isChecked={sensoryDisability.includes(
                    "Blind or Visually Impaired"
                  )}
                  onValueChange={() =>
                    toggleSensoryDisability("Blind or Visually Impaired")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Deaf or Hearing Impaired'
                  isChecked={sensoryDisability.includes(
                    "Deaf or Hearing Impaired"
                  )}
                  onValueChange={() =>
                    toggleSensoryDisability("Deaf or Hearing Impaired")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Mute or Speech Impaired'
                  isChecked={sensoryDisability.includes(
                    "Mute or Speech Impaired"
                  )}
                  onValueChange={() =>
                    toggleSensoryDisability("Mute or Speech Impaired")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Severe Sensory Sensitivity'
                  isChecked={sensoryDisability.includes(
                    "Severe Sensory Sensitivity"
                  )}
                  onValueChange={() =>
                    toggleSensoryDisability("Severe Sensory Sensitivity")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Others (Please Specify)'
                  isChecked={sensoryTrigger}
                  onValueChange={() => setSensoryTrigger((prev) => !prev)}
                  style={styles.halfWidthCheckbox}
                />
              </View>
              {sensoryTrigger && (
                <ThemedTextInput
                  style={{ width: "100%", marginBottom: 10 }}
                  placeholder='Please specify'
                  value={otherSensoryDisability}
                  onChangeText={(text) => {
                    setOtherSensoryDisability(text);

                    setSensoryDisability((prev) => {
                      const filtered = prev.filter(
                        (item) => item !== otherSensoryDisability
                      );
                      return text.trim() ? [...filtered, text] : filtered;
                    });
                  }}
                />
              )}
            </View>
          )}
          {/* Health Conditions */}
          <View style={styles.sectionHeader}>
            <TitleText type='title5'>Medically Dependent</TitleText>
            <View style={styles.headerLine}></View>
          </View>
          <CheckboxComponent
            label='Check if the individual Medically Dependent'
            isChecked={showHealthConditionForm}
            onValueChange={setShowHealthConditionForm}
            style={styles.fullWidthCheckbox}
          />
          {/* Show health conditions form */}
          <Spacer height={5} />
          {showHealthConditionForm && (
            <View style={styles.vulnerabilityFormContainer}>
              <CheckboxComponent
                label='Is your medical dependence permanent?'
                isChecked={isMDPermament}
                onValueChange={setIsMDPermament}
              />
              <Spacer height={10} />
              <TitleText type='title3' style={styles.categoryHeader}>
                Check all that may apply
              </TitleText>
              <View style={styles.checkboxColumns}>
                <CheckboxComponent
                  label='Dependent on a medical device'
                  isChecked={healthCondition.includes("medicalDevice")}
                  onValueChange={() => toggleHealthCondition("medicalDevice")}
                />
                <ThemedText style={styles.inputHint}>
                  (e.g., oxygen tank)
                </ThemedText>
                <CheckboxComponent
                  label='Dependent on regular medications'
                  isChecked={healthCondition.includes("regularMedications")}
                  onValueChange={() =>
                    toggleHealthCondition("regularMedications")
                  }
                />
                <ThemedText style={styles.inputHint}>
                  (e.g., insulin, etc.)
                </ThemedText>
                <CheckboxComponent
                  label='Severe Liver Disease'
                  isChecked={healthCondition.includes("Severe Liver Disease")}
                  onValueChange={() =>
                    toggleHealthCondition("Severe Liver Disease")
                  }
                />
                <ThemedText style={styles.inputHint}>
                  (e.g., Cirrhosis, etc.)
                </ThemedText>
                <CheckboxComponent
                  label='Serious Heart Condition'
                  isChecked={healthCondition.includes(
                    "Serious Heart Condition"
                  )}
                  onValueChange={() =>
                    toggleHealthCondition("Serious Heart Condition")
                  }
                />
                <ThemedText style={styles.inputHint}>
                  (e.g., Heart Failure, etc.)
                </ThemedText>
                <CheckboxComponent
                  label='Serious Lung Condition'
                  isChecked={healthCondition.includes("Serious Lung Condition")}
                  onValueChange={() =>
                    toggleHealthCondition("Serious Lung Condition")
                  }
                />
                <ThemedText style={styles.inputHint}>
                  (e.g., COPD, Asthma, Pneumonia, etc.)
                </ThemedText>
                <CheckboxComponent
                  label='Post Surgery Wounds'
                  isChecked={healthCondition.includes("Post Surgery Wounds")}
                  onValueChange={() =>
                    toggleHealthCondition("Post Surgery Wounds")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Dependent on Caregiver'
                  isChecked={healthCondition.includes("Dependent on Caregiver")}
                  onValueChange={() =>
                    toggleHealthCondition("Dependent on Caregiver")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Hypertension'
                  isChecked={healthCondition.includes("Hypertension")}
                  onValueChange={() => toggleHealthCondition("Hypertension")}
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Chronic Kidney Disease'
                  isChecked={healthCondition.includes("Chronic Kidney Disease")}
                  onValueChange={() =>
                    toggleHealthCondition("Chronic Kidney Disease")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Stroke'
                  isChecked={healthCondition.includes("Stroke")}
                  onValueChange={() => toggleHealthCondition("Stroke")}
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Immunocompromised'
                  isChecked={healthCondition.includes("Immunocompromised")}
                  onValueChange={() =>
                    toggleHealthCondition("Immunocompromised")
                  }
                  style={styles.halfWidthCheckbox}
                />
                <CheckboxComponent
                  label='Others'
                  isChecked={medDepTrigger}
                  onValueChange={() => setMedDepTrigger((prev) => !prev)}
                  style={styles.halfWidthCheckbox}
                />
              </View>
              {medDepTrigger && (
                <ThemedTextInput
                  style={{ width: "100%", marginBottom: 10 }}
                  placeholder='Please specify'
                  value={otherHealthCondition}
                  onChangeText={(text) => {
                    setOtherHealthCondition(text);

                    setHealthCondition((prev) => {
                      const filtered = prev.filter(
                        (item) => item !== otherHealthCondition
                      );
                      return text.trim() ? [...filtered, text] : filtered;
                    });
                  }}
                />
              )}
            </View>
          )}

          {/* Back and Next navigation buttons */}
          <BackNextButtons
            onBack={() => router.back()}
            onNext={handleNext} // Use our handleNext function that passes data
          />
        </ThemedView>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default Vulnerable;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryHeader: {
    width: "95%",
    alignSelf: "center",
    fontSize: 15,
    marginBottom: 5,
    color: "red",
    fontStyle: "italic",
  },

  error: {
    color: Colors.warning,
    padding: 10,
    backgroundColor: "#f5c1c8",
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  fieldError: {
    color: Colors.warning,
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
    alignSelf: "flex-start",
    marginLeft: "10%",
  },
  dropdownContainer: {
    width: "95%",
    alignSelf: "center",
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F5F5F5",
  },
  dropdownPlaceholder: {
    fontSize: 14,
    marginLeft: 10,
    color: "#999",
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: "#000",
    marginLeft: 10,
  },
  inputHint: {
    width: "100%",
    textAlign: "right",
    fontStyle: "italic",
    marginTop: 0,
    marginBottom: 10,
    fontSize: 12,
  },
  vulnerabilityFormContainer: {
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 10,
    border: "clear",
    borderWidth: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20, // Add some padding to match your form
    marginVertical: 10,
  },
  headerLine: {
    flex: 1, // Takes up the remaining space
    height: 2, // Thickness of the line
    backgroundColor: Colors.primary, // Make sure to define a primary blue color in Colors.js
    marginLeft: 10,
  },
  checkboxColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  stackedItem: {
    width: "48%", // A good starting point for two columns
    marginBottom: 0,
    // Add any styling you need for the stacked view, e.g., padding or margin
  },
  halfWidthCheckbox: {
    width: "48%", // This style is still correct for the single items
    marginBottom: 10,
  },
  fullWidthCheckbox: {
    width: "95%",
    alignSelf: "center", // Centers the component on the screen
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
});
