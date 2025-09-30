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
      // Save edits
      console.log("Updating vulnerability info:", formData);
      router.replace("/dashboard/profile"); // go back to Profile
    } else {
      // Registration flow
      console.log("Registering vulnerability:", formData);
      router.push("/(auth)/nextStep"); // go to next registration step
    }
  };

  //NOTE - Added by raven
  const [userSex, setUserSex] = useState("");
  // Parse incoming data from register screen
  const existingUserData = userData ? JSON.parse(userData) : {};
  console.log("Received user data in vulnerable screen:", existingUserData);

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
    // if (disability === "Others"){
    //     if (sensoryDisability.some((item) => item.startsWith("Other: "))) {
    //         // remove "Others" if it's already there
    //         setSensoryDisability(
    //             sensoryDisability.filter((item) => !item.startsWith("Other: "))
    //         );
    //     } else {
    //     // add a placeholder first (or empty string if you want)
    //     setSensoryDisability([...sensoryDisability, `Other: ${otherSensoryDisability || ""}`]);
    //     }
    // }
    // else {
    if (sensoryDisability.includes(disability)) {
      setSensoryDisability(
        sensoryDisability.filter((item) => item !== disability)
      );
    } else {
      setSensoryDisability([...sensoryDisability, disability]);
    }
    // }
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
    console.log("Sex: ", userSex);

    return data;
  };

  useEffect(() => {
    if (from === "profile") {
      fetchSex();
    }
  }, [from]);

  const handleNext = async () => {
    console.log("Collecting vulnerability data...");

    // Get sex from userData (should be available from register screen)
    const userSex = existingUserData.sex;
    const userDob = existingUserData.dob;

    // Combine existing data with vulnerability data
    const completeUserData = {
      ...existingUserData,
      // Vulnerability data
      vulnerability: {
        hasGuardian,
        guardianInfo:
          hasGuardian === "yes"
            ? {
                name: guardianName,
                contact: guardianContact,
                relationship: guardianRelation,
                address: guardianAddress,
              }
            : null,
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

    console.log("Complete user data with vulnerability:", completeUserData);
    
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
            const {data:pregnantData, error: pregnantError} = await supabase
            .from('pregnant')
            .insert({
              dueDate: dueDate,
              trimester: parseInt(trimester),
              userID: user.id
            })
            .select()
            if(pregnantError){
              console.error("Error in inserting pregnant table: ", pregnantError); 
            } else if (pregnantData && pregnantData.length > 0) {
              const {error} = await supabase
              .from('vulnerabilityList')
              .update({
                pregnantID: pregnantData[0].id
              })
              .eq("userID", user.id)

              if(error){
                console.error("Error in updating vul pregnantID: ", error);
                
              } 
            } 
            else {
              console.log("Pregnant Data: ", pregnantData);
            }
          }
        }
        const data = await fetchSex();
        // Update vulnerability table ###################################
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
            // locationRiskLevel: userVul.locationRiskLevel,
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

        //ANCHOR - RISKSCORE
        // add values of the riskscore here
        // make new usestate for all the scores
        // if not, make conditionals
        const age = differenceInYears(new Date(), new Date(data.dateOfBirth));
        console.log({
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
            pregnantInfantScore:
              pregnancy === "yes" && hasInfant === "yes"
                ? 4
                : pregnancy === "yes" || hasInfant === "yes"
                ? 2
                : 0,
            physicalPWDScore:
              physicalDisability?.length >= 4
                ? 4
                : physicalDisability?.length === 2
                ? 2
                : physicalDisability?.length === 1
                ? 1
                : 0,
            psychPWDScore:
              psychologicalDisability?.length >= 4
                ? 4
                : psychologicalDisability?.length === 2
                ? 2
                : psychologicalDisability?.length === 1
                ? 1
                : 0,
            sensoryPWDScore:
              sensoryDisability?.length >= 4
                ? 4
                : sensoryDisability?.length === 2
                ? 2
                : sensoryDisability?.length === 1
                ? 1
                : 0,
            medDepScore:
              healthCondition?.length > 0
                ? 4
                : 0,
          locationRiskLevel: 1,
          userID: user.id,
        });

        const { data: riskData, error: riskError } = await supabase
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
            pregnantInfantScore:
              pregnancy === "yes" && hasInfant === "yes"
                ? 4
                : pregnancy === "yes" || hasInfant === "yes"
                ? 2
                : 0,
            physicalPWDScore:
              physicalDisability?.length >= 4
                ? 4
                : physicalDisability?.length === 2
                ? 2
                : physicalDisability?.length === 1
                ? 1
                : 0,
            psychPWDScore:
              psychologicalDisability?.length >= 4
                ? 4
                : psychologicalDisability?.length === 2
                ? 2
                : psychologicalDisability?.length === 1
                ? 1
                : 0,
            sensoryPWDScore:
              sensoryDisability?.length >= 4
                ? 4
                : sensoryDisability?.length === 2
                ? 2
                : sensoryDisability?.length === 1
                ? 1
                : 0,
            medDepScore:
              healthCondition?.length > 0
                ? 4
                : 0,
          })
          .eq("userID", user.id)
          .select("*")
          .single();
        if (riskError) {
          console.error("Error creating riskscore list:", riskError);
          throw new Error("Failed to create riskscore list");
        }
        console.log("riskscore list created:", riskData);

        //ANCHOR - PRIO API CONNECTION
        const getPrioritization = async () => {
          try {
            const response = await fetch(
              "https://xgprio.onrender.com/predict",
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
            console.log("Result: ", result.prediction);
            return result.prediction;
          } catch (error) {
            console.error("error in getting prioritization: ", error);
          }
        };

        const priorityLevel = await getPrioritization();
        // Create vulnerability record - with explicit userID
        const { data: priorityData, error: prioError } = await supabase
          .from("priority")
          .update({
            prioLevel: parseFloat(priorityLevel),
            riskScoreID: riskData.id,
            userID: user.id,
          })
          .eq("riskScoreID", riskData.id);

        console.log("priorty: ", priorityData);
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

  //renders vulnerability assessment form
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
          {
            //NOTE - not applicable if edit profile
            from === "register" && (
              <>
                <View style={styles.sectionHeader}>
                  <TitleText type='title5'>Presence of Guardian</TitleText>
                  <View style={styles.headerLine}></View>
                </View>

                {/*start of the form*/}
                {/*Set guardian information*/}
                <RadioGroup
                  label='Do you currently live with a guardian?'
                  options={guardianOptions}
                  selectedValue={hasGuardian}
                  onValueChange={setHasGuardian}
                />

                {/*Condition for asking the guardian information if the answer is yes*/}
                {hasGuardian === "yes" && (
                  <>
                    <ThemedTextInput
                      style={{ width: "95%", marginBottom: 10 }}
                      placeholder='Guardian Name'
                      value={guardianName}
                      onChangeText={setGuardianName}
                    />
                    <ThemedTextInput
                      style={{ width: "95%", marginBottom: 10 }}
                      placeholder='Guardian Contact Number'
                      value={guardianContact}
                      onChangeText={setGuardianContact}
                      keyboardType='phone-pad'
                    />
                    <ThemedTextInput
                      style={{ width: "95%", marginBottom: 10 }}
                      placeholder='Relationship'
                      value={guardianRelation}
                      onChangeText={setGuardianRelation}
                    />
                    <ThemedTextInput
                      style={{ width: "95%", marginBottom: 10 }}
                      placeholder='Guardian Address'
                      value={guardianAddress}
                      onChangeText={setGuardianAddress}
                    />
                  </>
                )}

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
                    }}
                  />
                </View>
              </>
            )
          }
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
                  {/* <ThemedTextInput
                    style={{ width: "95%", marginBottom: 10 }}
                    placeholder='Month Due Date'
                    value={dueDate}
                    onChangeText={setDueDate}
                  /> */}
                  <DatePickerInput
                    value={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                      // clearFieldError("duedate");
                    }}
                    minimumDate={new Date()}
                    maximumDate={new Date().setFullYear(
                      new Date().getFullYear() + 1
                    )}
                    placeholder='Due Date'
                    // disabled={!isAgreed}
                  />
                  <Picker
                    selectedValue={trimester}
                    onValueChange={(itemValue) => setTrimester(itemValue)}
                    style={{
                      width: "95%",
                      marginBottom: 10,
                      backgroundColor: "white",
                      borderRadius: 8,
                    }}
                  >
                    <Picker.Item label='Select trimester' value='' />
                    <Picker.Item
                      label='1st Trimester(Week 0 - Week 12)'
                      value='1'
                    />
                    <Picker.Item
                      label='2nd Trimester(Week 13 - Week 26)'
                      value='2'
                    />
                    <Picker.Item
                      label='3rd Trimester(Week 27 and up)'
                      value='3'
                    />
                  </Picker>
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
              {/* This checkbox should still be full width */}
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

              {/* The two-column wrapper that holds the vertical items */}
              <View style={styles.checkboxColumns}>
                {/* This is a single item in the two-column layout.
                                    Its children are stacked vertically.
                                */}

                {/* The rest of the checkboxes are also single items in the layout */}
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
                  label='Schizophrenia'
                  isChecked={psychologicalDisability.includes("Schizophrenia")}
                  onValueChange={() =>
                    togglePsychologicalDisability("Schizophrenia")
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
              <CheckboxComponent
                label='Chronic Illness (e.g., diabetes, asthma, heart disease, etc.)'
                isChecked={healthCondition.includes("chronicIllness")}
                onValueChange={() => toggleHealthCondition("chronicIllness")}
                style={{ width: "100%", marginBottom: 5 }}
              />
              <CheckboxComponent
                label='Dependent on a medical device'
                isChecked={healthCondition.includes("medicalDevice")}
                onValueChange={() => toggleHealthCondition("medicalDevice")}
                style={{ width: "100%" }}
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
                label='Others'
                isChecked={medDepTrigger}
                onValueChange={() => setMedDepTrigger((prev) => !prev)}
                style={{ width: "100%" }}
              />
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
          {/* mobility status */}
          {/* <View style={styles.sectionHeader}>
                        <TitleText type='title5'>Mobility Status</TitleText>
                        <View style={styles.headerLine}></View>
                    </View>
                    <View style={styles.pregnancyContainer}>
                        <RadioGroup
                            label='Is the individual capable of evacuation without assistance?'
                            options={mobilityOptions}
                            selectedValue={mobilityStatus}
                            onValueChange={setMobilityStatus}
                        />
                    </View> */}
          {/* //FIXME - add condition to go back to edit profile */}
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
