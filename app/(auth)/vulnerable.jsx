import {Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, View} from 'react-native'
import React, {useState} from 'react'
import {useLocalSearchParams, useRouter} from "expo-router";
import BackNextButtons from "../../components/buttons/BackNextButtons";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import { Colors } from '../../constants/Colors'
import Spacer from "../../components/Spacer";
import ThemedLogo from "../../components/ThemedLogo";
import TitleText from "../../components/TitleText";
import RadioGroup from "../../components/RadioComponent";
import ThemedTextInput from "../../components/ThemedTextInput";
import { Dropdown } from 'react-native-element-dropdown';
import CheckboxComponent from "../../components/CheckboxComponent"; // Import Dropdown

const Vulnerable = () => {
    const router = useRouter()
    const { sex } = useLocalSearchParams();

    //form field state variables for guardian
    const [hasGuardian, setHasGuardian] = useState(null); //yes or no
    const [guardianName, setGuardianName] = useState('');
    const [guardianContact, setGuardianContact] = useState('');
    const [guardianRelation, setGuardianRelation] = useState('');
    const [guardianAddress, setGuardianAddress] = useState('');
    const [householdCount, setHouseholdCount] = useState('');

    //form field state variables for disabilities
    const [physicalDisability, setPhysicalDisability] = useState([]);
    const [otherphysicalDisability, setOtherPhysicalDisability] = useState('');
    const [psychologicalDisability, setPsychologicalDisability] = useState('');
    const [sensoryDisability, setSensoryDisability] = useState([]);
    const [otherSensoryDisability, setOtherSensoryDisability] = useState('');

    //new state for pregnancy
    const [pregnancy, setPregnancy] = useState(null);
    const [dueDate, setDueDate] = useState('');

    //new state for health conditions
    const [healthCondition, setHealthCondition] = useState([]);

    //new state for mobility status in terms of evacuation
    const [mobilityStatus, setMobilityStatus] = useState(null);

    //new data for pregnancy options
    const pregnancyOptions = [
        {label: 'Yes', value: 'yes'},
        {label: 'No', value: 'no'},
    ];

    // Data for the radio buttons
    const guardianOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
    ];

    //data for the household count dropdown
    const householdData = Array.from({length: 10}, (_, i) => ({
        label: (i + 1).toString(),
        value: (i + 1).toString(),
    }));

    //data for the mobility status
    const mobilityOptions = [
        {label: 'Can evacuate without assistance', value: 'canEvacuate'},
        {label: 'Requires evacuation with assistance', value: 'requiresAssistance'},
    ]

    // New function to handle selections for Physical disabilities
    const togglePhysicalDisability = (disability) => {
        if (physicalDisability.includes(disability)) {
            setPhysicalDisability(physicalDisability.filter(item => item !== disability));
        } else {
            setPhysicalDisability([...physicalDisability, disability]);
        }
    };

    // New function to handle selections for Sensory disabilities
    const toggleSensoryDisability = (disability) => {
        if (sensoryDisability.includes(disability)) {
            setSensoryDisability(sensoryDisability.filter(item => item !== disability));
        } else {
            setSensoryDisability([...sensoryDisability, disability]);
        }
    };

    // New function to handle selections for Health conditions
    const toggleHealthCondition = (condition) => {
        if (healthCondition.includes(condition)) {
            setHealthCondition(healthCondition.filter(item => item !== condition));
        } else {
            setHealthCondition([...healthCondition, condition]);
        }
    };


    const handleNext = () => {
        // Here you would add validation for this page's fields
        // Then navigate to the next page
        // For now, we'll just navigate
        router.push('./uploadID');
    };

    //renders vulnerability assessment form
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* TouchableWithoutFeedback dismisses keyboard when tapping outside inputs */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                {/* Main container with themed styling */}
                <ThemedView style={styles.container} safe={true}>
                    {/* Top spacing */}
                    <Spacer height={44} />
                    {/* App logo */}
                    <ThemedLogo/>
                    {/* App title */}
                    <TitleText type="title1">RESBAC</TitleText>
                    {/* Form header text */}
                    <TitleText type="title3">
                        Assessing your Vulnerability
                    </TitleText>
                    <TitleText type="title3" style={{textAlign: 'center'}}>
                        This will serve as your emergency details. {"\n"}Please fill-out all of the required details.
                    </TitleText>
                    <Spacer/>

                    {/*start of the form*/}
                    {/*Set guardian information*/}
                    <RadioGroup
                        label="Does this person have a guardian?"
                        options={guardianOptions}
                        selectedValue={hasGuardian}
                        onValueChange={setHasGuardian}
                    />

                    {/*Condition for asking the guardian information if the answer is yes*/}
                    {hasGuardian === 'yes' && (
                        <>
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Guardian Name"
                                value={guardianName}
                                onChangeText={text => {
                                    setGuardianName(text);
                                }}
                            />
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Guardian Contact Number"
                                value={guardianContact}
                                onChangeText={text => {
                                    setGuardianContact(text);
                                }}
                            />
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Guardian Relation"
                                value={guardianRelation}
                                onChangeText={text => {
                                    setGuardianRelation(text);
                                }}
                            />
                            <ThemedTextInput
                                style={{width: '80%', marginBottom: 5}}
                                placeholder="Relationship"
                                value={guardianRelation}
                                onChangeText={text => {
                                    setGuardianRelation(text);
                                }}
                            />
                            <ThemedTextInput
                                style={{width: '80%', marginBottom: 5}}
                                placeholder="Guardian Address"
                                value={guardianAddress}
                                onChangeText={text => {
                                    setGuardianAddress(text);
                                }}
                            />
                        </>
                    )}

                    {/* Household count dropdown */}
                    <View style={styles.dropdownContainer}>
                        <TitleText type="title3">How many people live in the same household?</TitleText>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            data={householdData}
                            maxHeight={200}
                            labelField="label"
                            valueField="value"
                            placeholder="Select count"
                            value={householdCount}
                            onChange={item => {
                                setHouseholdCount(item.value);
                            }}
                        />
                    </View>

                    {/* Physical Disabilities */}
                    <TitleText type="title3" style={styles.categoryHeader}>Does the individual have any disabilities</TitleText>
                    <TitleText type="title3" style={styles.categoryHeader}>(check all that apply)</TitleText>
                    <TitleText type="title3" style={styles.categoryHeader}>Physical</TitleText>
                    <CheckboxComponent
                        label="Mobility Impaired"
                        isChecked={physicalDisability.includes('Mobility Impaired')}
                        onValueChange={() => togglePhysicalDisability('Mobility Impaired')}
                    />
                    <ThemedText style={styles.inputHint}>
                        (e.g., uses wheelchair, saklay)
                    </ThemedText>
                    <CheckboxComponent
                        label={"Others"}
                        isChecked={physicalDisability.includes('Others')}
                        onValueChange={() => togglePhysicalDisability('Others')}
                    />
                    {physicalDisability.includes('Others') && (
                        <ThemedTextInput
                            style={{width: '80%', marginBottom: 5}}
                            placeholder="Please specify"
                            value={otherphysicalDisability}
                            onChangeText={setOtherPhysicalDisability}
                        />
                    )}

                    {/* Psychological Disabilities */}
                    <TitleText type="title3" style={styles.categoryHeader}>Psychological</TitleText>
                    <ThemedTextInput
                        style={{width: '80%', marginBottom: 5}}
                        placeholder="Please specify"
                        value={psychologicalDisability}
                        onChangeText={setPsychologicalDisability}
                    />

                    {/* Sensory Disabilities */}
                    <TitleText type="title3" style={styles.categoryHeader}>Sensory</TitleText>
                    <CheckboxComponent
                        label="Blind"
                        isChecked={sensoryDisability.includes('Blind')}
                        onValueChange={() => toggleSensoryDisability('Blind')}
                    />
                    <CheckboxComponent
                        label="Deaf"
                        isChecked={sensoryDisability.includes('Deaf')}
                        onValueChange={() => toggleSensoryDisability('Deaf')}
                    />
                    <CheckboxComponent
                        label="Non-verbal / Mute"
                        isChecked={sensoryDisability.includes('Non-verbal / Mute')}
                        onValueChange={() => toggleSensoryDisability('Non-verbal / Mute')}
                    />
                    <CheckboxComponent
                        label="Speech Impaired"
                        isChecked={sensoryDisability.includes('Speech Impaired')}
                        onValueChange={() => toggleSensoryDisability('Speech Impaired')}
                    />
                    <CheckboxComponent
                        label="Others"
                        isChecked={sensoryDisability.includes('Others')}
                        onValueChange={() => toggleSensoryDisability('Others')}
                    />
                    {sensoryDisability.includes('Others') && (
                        <ThemedTextInput
                            style={{width: '80%', marginBottom: 5}}
                            placeholder="Please specify"
                            value={otherSensoryDisability}
                            onChangeText={setOtherSensoryDisability}
                        />
                    )}


                    {/* Pregnancy - should only appear if sex selected is female */}
                    {sex === 'Female' && (
                        <View style={styles.pregnancyContainer}>
                            <RadioGroup
                                label="Is the individual pregnant?"
                                options={pregnancyOptions}
                                selectedValue={pregnancy}
                                onValueChange={setPregnancy}
                            />
                            {pregnancy === 'yes' && (
                                <ThemedTextInput
                                    style={{width: '80%', alignSelf: 'center'}}
                                    placeholder="Month Due Date"
                                    value={dueDate}
                                />
                            )}
                        </View>
                    )}

                    {/* Health Conditions */}
                    <TitleText type="title3" style={styles.categoryHeader}>Health Conditions</TitleText>
                    <CheckboxComponent
                        label="Chronic Illness (e.g., diabetes, asthma)"
                        isChecked={healthCondition.includes('chronicIllness')}
                        onValueChange={() => toggleHealthCondition('chronicIllness')}
                    />
                    <CheckboxComponent
                        label="Dependent on a medical device"
                        isChecked={healthCondition.includes('medicalDevice')}
                        onValueChange={() => toggleHealthCondition('medicalDevice')}
                    />
                    <ThemedText style={styles.inputHint}>
                        (e.g., oxygen tank)
                    </ThemedText>
                    <CheckboxComponent
                        label="Dependent on regular medications"
                        isChecked={healthCondition.includes('regularMedications')}
                        onValueChange={() => toggleHealthCondition('regularMedications')}
                    />

                    {/* mobility status */}
                    <View style={styles.pregnancyContainer}>
                        <RadioGroup
                            label="Mobility Status"
                            options={mobilityOptions}
                            selectedValue={mobilityStatus}
                            onValueChange={setMobilityStatus}
                        />
                    </View>


                    {/* Back and Next navigation buttons */}
                    <BackNextButtons
                        onBack={() => router.back()} // Go back
                        onNext= {() => router.push('./uploadID')} // Go to the vulnerable information
                    />
                </ThemedView>
            </TouchableWithoutFeedback>
        </ScrollView>
    )
}
export default Vulnerable

/**
 * Styles for the registration form components
 */
const styles = StyleSheet.create({
    // Styles for the ScrollView container
    scrollContainer: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fafafa', // Light background color
        overflow: 'hidden', // Prevent content from overflowing
    },

    // Styles for the main container view
    container: {
        flex: 1, // Take up all available space
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },

    pregnancyContainer: {
        width: '100%',
        alignSelf: 'center',
        marginBottom: 5,
        fontWeight: 'bold',
    },

    // Style for the category headers (e.g., Physical, Psychological)
    categoryHeader: {
        width: '80%',
        alignSelf: 'center',
        fontSize: 15,
        //fontWeight: 'bold',
        marginBottom: 5,
    },

    // Styles for the general error message
    error: {
        color: Colors.warning, // Red text for error
        padding: 10,
        backgroundColor: '#f5c1c8', // Light red background
        borderColor: Colors.warning, // Red border
        borderWidth: 1,
        borderRadius: 5, // Rounded corners
        marginHorizontal: 10, // Horizontal margin
    },

    // Styles for individual field error messages
    fieldError: {
        color: Colors.warning, // Red text for error
        fontSize: 12, // Smaller font size
        marginBottom: 10,
        marginTop: -5, // Negative top margin to position closer to field
        alignSelf: 'flex-start', // Align to the left
        marginLeft: '10%', // Match the left alignment of input fields
    },
    dropdownContainer: {
        width: '80%',
        alignSelf: 'center',
        marginBottom: 20,
    },
    dropdown: {
        height: 50,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: '#F5F5F5',
    },
    dropdownPlaceholder: {
        fontSize: 14,
        marginLeft: 10,
        color: '#999',
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: '#000',
        marginLeft: 10,
    },
    inputHint: {
        width: '80%',
        textAlign: 'right',
        fontStyle: 'italic',
        marginTop: -15,
        marginBottom: 10,
        fontSize: 12,
    }
})