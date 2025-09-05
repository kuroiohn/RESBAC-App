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
} from "react-native";
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

const Vulnerable = () => {
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
    const [otherPsychologicalDisability, setOtherPsychologicalDisability] = useState("");
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
    const [showPhysicalDisabilityForm, setShowPhysicalDisabilityForm] = useState(false);
    const [showPsychologicalDisabilityForm, setShowPsychologicalDisabilityForm] = useState(false);
    const [showSensoryDisabilityForm, setShowSensoryDisabilityForm] = useState(false);
    const [showHealthConditionForm, setShowHealthConditionForm] = useState(false);

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
        { label: "No", value: "requiresAssistance"},
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

    const handleNext = async () => {
        console.log("Collecting vulnerability data...");

        // Get sex from userData (should be available from register screen)
        const userSex = existingUserData.sex;

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
                physicalDisability,
                otherPhysicalDisability,
                psychologicalDisability,
                sensoryDisability,
                otherSensoryDisability,
                pregnancy: userSex === "Female" ? pregnancy : null,
                dueDate: pregnancy === "yes" ? dueDate : null,
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
                const {data, error} = await supabase
                .from('user')
                .select('*')
                .eq("userID", user.id)
                .single();
                
                if(error){
                    console.error("Error in fetching dateOfBirth in edit profile: ",  error);
                }
                
                // Update vulnerability table ###################################
                    await supabase
                    .from("vulnerabilityList")
                    .update({
                        elderly: (differenceInYears(new Date(), new Date(data.dateOfBirth)) >= 60 ? true : false),
                        pregnantInfant: data.sex === "Female" ? [pregnancy || "no", hasInfant || "no"] :
                        ["no","no"],
                        physicalPWD: physicalDisability,
                        psychPWD: psychologicalDisability,
                        sensoryPWD: sensoryDisability,
                        medDep: healthCondition,
                        // locationRiskLevel: userVul.locationRiskLevel,
                    })
                    .eq("userID", user.id);
            
                    Alert.alert("Success", "Profile updated!");                
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
                    <Spacer height={44} />
                    <ThemedLogo />
                    <TitleText type='title1'>RESBAC</TitleText>
                    <TitleText type='title3'>Assessing your Vulnerability</TitleText>
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
                                style={{ width: "80%", marginBottom: 5 }}
                                placeholder='Guardian Name'
                                value={guardianName}
                                onChangeText={setGuardianName}
                            />
                            <ThemedTextInput
                                style={{ width: "80%", marginBottom: 5 }}
                                placeholder='Guardian Contact Number'
                                value={guardianContact}
                                onChangeText={setGuardianContact}
                                keyboardType='phone-pad'
                            />
                            <ThemedTextInput
                                style={{ width: "80%", marginBottom: 5 }}
                                placeholder='Relationship'
                                value={guardianRelation}
                                onChangeText={setGuardianRelation}
                            />
                            <ThemedTextInput
                                style={{ width: "80%", marginBottom: 5 }}
                                placeholder='Guardian Address'
                                value={guardianAddress}
                                onChangeText={setGuardianAddress}
                            />
                        </>
                    )}

                    {/* Household count dropdown */}
                    <View style={styles.dropdownContainer}>
                        <TitleText type='title3'>
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

                    <View style={styles.sectionHeader}>
                        <TitleText type='title5'>Pregnancy and Infant</TitleText>
                        <View style={styles.headerLine}></View>
                    </View>

                    {/* Pregnancy - should only appear if sex selected is female */}
                    {existingUserData.sex === "Female" && (
                        <>
                            <RadioGroup
                                label='Are you currently pregnant?'
                                options={pregnancyOptions}
                                selectedValue={pregnancy}
                                onValueChange={setPregnancy}
                            />
                            {pregnancy === "yes" && (
                                <>
                                    <ThemedTextInput
                                        style={{ width: "80%", alignSelf: "center" }}
                                        placeholder='Month Due Date'
                                        value={dueDate}
                                        onChangeText={setDueDate}
                                    />
                                    <ThemedTextInput
                                        style={{ width: "80%", alignSelf: "center" }}
                                        placeholder='Current trimester'
                                        value={trimester}
                                        onChangeText={setTrimester}
                                    />
                                </>
                            )}

                            <RadioGroup
                                label='Do you have an infant? [0-60months old]?'
                                options={infantOptions}
                                selectedValue={hasInfant}
                                onValueChange={setHasInfant}
                            />
                        </>
                    )}

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
                    {showPhysicalDisabilityForm && (
                        <View style={styles.vulnerabilityFormContainer}>
                            {/* This checkbox should still be full width */}
                            <CheckboxComponent
                                label='Is your Physical Disability permanent?'
                                isChecked={isPDPermanent}
                                onValueChange={setIsPDPermanent}
                            />

                            <TitleText type='title3' style={styles.categoryHeader}>
                                Check all that may apply
                            </TitleText>

                            {/* The two-column wrapper that holds the vertical items */}
                            <View style={styles.checkboxColumns}>
                                {/* This is a single item in the two-column layout.
                                    Its children are stacked vertically.
                                */}
                                <View style={styles.stackedItem}>
                                    <CheckboxComponent
                                        label='Mobility Aid User'
                                        isChecked={physicalDisability.includes("Mobility Impaired")}
                                        onValueChange={() => togglePhysicalDisability("Mobility Impaired")}
                                    />
                                    <ThemedText style={styles.inputHint}>
                                        (e.g., uses wheelchair, saklay)
                                    </ThemedText>
                                </View>

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
                                    onValueChange={() => togglePhysicalDisability("Cerebral Palsy")}
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
                                    isChecked={physicalDisability.includes("Others")}
                                    onValueChange={() => togglePhysicalDisability("Others")}
                                    style={styles.halfWidthCheckbox}
                                />
                            </View>
                            {physicalDisability.includes("Others") && (
                                <ThemedTextInput
                                    style={{ width: "80%", marginBottom: 5 }}
                                    placeholder='Please specify'
                                    value={otherPhysicalDisability}
                                    onChangeText={setOtherPhysicalDisability}
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
                    {/* Show Psychological Disability Form*/}
                    {showPsychologicalDisabilityForm && (
                        <View style={styles.vulnerabilityFormContainer}>
                            <CheckboxComponent
                                label='Is your Psychological Disability permanent?'
                                isChecked={isPSYPermament}
                                onValueChange={setIsPSYPermament}
                            />
                            <TitleText type='title3' style={styles.categoryHeader}>
                                Check all that may apply
                            </TitleText>
                            <View style={styles.checkboxColumns}>
                                <CheckboxComponent
                                    label='Autism Spectrum Disorder'
                                    isChecked={psychologicalDisability.includes(
                                        "Autism Spectrum Disorder"
                                    )}
                                    onValueChange={() =>
                                        togglePsychologicalDisability("Autism Spectrum Disorder")
                                    }
                                    style={styles.halfWidthCheckbox}
                                />
                                <CheckboxComponent
                                    label='Down Syndrome'
                                    isChecked={psychologicalDisability.includes("Down Syndrome")}
                                    onValueChange={() => togglePsychologicalDisability("Down Syndrome")}
                                    style={styles.halfWidthCheckbox}
                                />
                                <CheckboxComponent
                                    label='Anxiety Disorder'
                                    isChecked={psychologicalDisability.includes("Anxiety Disorder")}
                                    onValueChange={() =>
                                        togglePsychologicalDisability("Anxiety Disorder")
                                    }
                                    style={styles.halfWidthCheckbox}
                                />
                                <CheckboxComponent
                                    label='Schizophrenia'
                                    isChecked={psychologicalDisability.includes("Schizophrenia")}
                                    onValueChange={() => togglePsychologicalDisability("Schizophrenia")}
                                    style={styles.halfWidthCheckbox}
                                />
                                <CheckboxComponent
                                    label='Post Traumatic Stress Disorder (PSTD)'
                                    isChecked={psychologicalDisability.includes(
                                        "Post Traumatic Stress Disorder"
                                    )}
                                    onValueChange={() =>
                                        togglePsychologicalDisability("Post Traumatic Stress Disorder")
                                    }
                                    style={styles.halfWidthCheckbox}
                                />
                                <CheckboxComponent
                                    label='Other'
                                    isChecked={psychologicalDisability.includes("Other")}
                                    onValueChange={() => togglePsychologicalDisability("Other")}
                                    style={styles.halfWidthCheckbox}
                                />
                            </View>
                            {psychologicalDisability.includes("Other") && (
                                <ThemedTextInput
                                    style={{ width: "80%", marginBottom: 5 }}
                                    placeholder='Please specify'
                                    value={otherPsychologicalDisability}
                                    onChangeText={setOtherPsychologicalDisability}
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
                    {showSensoryDisabilityForm && (
                        <View style={styles.vulnerabilityFormContainer}>
                            <CheckboxComponent
                                label='Is your Sensory Disability permanent?'
                                isChecked={isSDPermament}
                                onValueChange={setIsSDPermanent}
                            />
                            <TitleText type='title3' style={styles.categoryHeader}>
                                Check all that may apply
                            </TitleText>
                            <View style={styles.checkboxColumns}>
                                <CheckboxComponent
                                    label='Blind or Visually Impaired'
                                    isChecked={sensoryDisability.includes("Blind or Visually Impaired")}
                                    onValueChange={() =>
                                        toggleSensoryDisability("Blind or Visually Impaired")
                                    }
                                    style={styles.halfWidthCheckbox}
                                />
                                <CheckboxComponent
                                    label='Deaf or Hearing Impaired'
                                    isChecked={sensoryDisability.includes("Deaf or Hearing Impaired")}
                                    onValueChange={() =>
                                        toggleSensoryDisability("Deaf or Hearing Impaired")
                                    }
                                    style={styles.halfWidthCheckbox}
                                />
                                <CheckboxComponent
                                    label='Mute or Speech Impaired'
                                    isChecked={sensoryDisability.includes("Mute or Speech Impaired")}
                                    onValueChange={() =>
                                        toggleSensoryDisability("Mute or Speech Impaired")
                                    }
                                    style={styles.halfWidthCheckbox}
                                />
                                <CheckboxComponent
                                    label='Others'
                                    isChecked={sensoryDisability.includes("Others")}
                                    onValueChange={() => toggleSensoryDisability("Others")}
                                    style={styles.halfWidthCheckbox}
                                />
                            </View>
                            {sensoryDisability.includes("Others") && (
                                <ThemedTextInput
                                    style={{ width: "80%", marginBottom: 5 }}
                                    placeholder='Please specify'
                                    value={otherSensoryDisability}
                                    onChangeText={setOtherSensoryDisability}
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
                    {showHealthConditionForm && (
                        <View style={styles.vulnerabilityFormContainer}>
                            <CheckboxComponent
                                label='Is your medical dependence permanent?'
                                isChecked={isMDPermament}
                                onValueChange={setIsMDPermament}
                            />
                            <TitleText type='title3' style={styles.categoryHeader}>
                                Check all that may apply
                            </TitleText>
                            <View style={styles.checkboxColumns}>
                                <CheckboxComponent
                                    label='Chronic Illness (e.g., diabetes, asthma, heart disease, etc.)'
                                    isChecked={healthCondition.includes("chronicIllness")}
                                    onValueChange={() => toggleHealthCondition("chronicIllness")}
                                    style={styles.halfWidthCheckbox}
                                />
                                <View style={styles.stackedItem}>
                                    <CheckboxComponent
                                        label='Dependent on a medical device'
                                        isChecked={healthCondition.includes("medicalDevice")}
                                        onValueChange={() => toggleHealthCondition("medicalDevice")}
                                    />
                                    <ThemedText style={styles.inputHint}>(e.g., oxygen tank)</ThemedText>
                                </View>
                                <View style={styles.stackedItem}>
                                    <CheckboxComponent
                                        label='Dependent on regular medications'
                                        isChecked={healthCondition.includes("regularMedications")}
                                        onValueChange={() => toggleHealthCondition("regularMedications")}
                                    />
                                    <ThemedText style={styles.inputHint}>
                                        (e.g., insulin, etc.)
                                    </ThemedText>
                                </View>
                                <CheckboxComponent
                                    label='others'
                                    isChecked={healthCondition.includes("others")}
                                    onValueChange={() => toggleHealthCondition("others")}
                                    style={styles.halfWidthCheckbox}
                                />
                            </View>
                            {healthCondition.includes("others") && (
                                <ThemedTextInput
                                    style={{ width: "80%", marginBottom: 5 }}
                                    placeholder='Please specify'
                                    value={otherHealthCondition}
                                    onChangeText={setOtherHealthCondition()}
                                />
                            )}
                        </View>
                    )}

                    {/* mobility status */}
                    <View style={styles.sectionHeader}>
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
                    </View>

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
        width: "80%",
        alignSelf: "center",
        fontSize: 15,
        marginBottom: 5,
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
        width: "80%",
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
        width: "80%",
        textAlign: "right",
        fontStyle: "italic",
        marginTop: -15,
        marginBottom: 10,
        fontSize: 12,
    },
    vulnerabilityFormContainer: {
        width: "80%",
        backgroundColor: "#f5f5f5", // A light gray background
        borderRadius: 10,
        padding: 10,
        borderColor: "#ccc",
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    stackedItem: {
        width: '48%', // A good starting point for two columns
        marginBottom: 0,
        // Add any styling you need for the stacked view, e.g., padding or margin
    },
    halfWidthCheckbox: {
        width: '48%', // This style is still correct for the single items
        marginBottom: 0,
    },
    fullWidthCheckbox: {
        width: '80%',
        alignSelf: 'center', // Centers the component on the screen
    },
});