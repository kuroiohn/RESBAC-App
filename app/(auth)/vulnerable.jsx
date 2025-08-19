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
import CheckboxComponent from "../../components/CheckboxComponent";

const Vulnerable = () => {
    const router = useRouter()
    const { userData } = useLocalSearchParams();

    // Parse incoming data from register screen
    const existingUserData = userData ? JSON.parse(userData) : {}
    console.log('Received user data in vulnerable screen:', existingUserData)

    //form field state variables for guardian
    const [hasGuardian, setHasGuardian] = useState(null);
    const [guardianName, setGuardianName] = useState('');
    const [guardianContact, setGuardianContact] = useState('');
    const [guardianRelation, setGuardianRelation] = useState('');
    const [guardianAddress, setGuardianAddress] = useState('');
    const [householdCount, setHouseholdCount] = useState('');

    //form field state variables for disabilities
    const [physicalDisability, setPhysicalDisability] = useState([]);
    const [otherPhysicalDisability, setOtherPhysicalDisability] = useState('');
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

    // Function to handle selections for Physical disabilities
    const togglePhysicalDisability = (disability) => {
        if (physicalDisability.includes(disability)) {
            setPhysicalDisability(physicalDisability.filter(item => item !== disability));
        } else {
            setPhysicalDisability([...physicalDisability, disability]);
        }
    };

    // Function to handle selections for Sensory disabilities
    const toggleSensoryDisability = (disability) => {
        if (sensoryDisability.includes(disability)) {
            setSensoryDisability(sensoryDisability.filter(item => item !== disability));
        } else {
            setSensoryDisability([...sensoryDisability, disability]);
        }
    };

    // Function to handle selections for Health conditions
    const toggleHealthCondition = (condition) => {
        if (healthCondition.includes(condition)) {
            setHealthCondition(healthCondition.filter(item => item !== condition));
        } else {
            setHealthCondition([...healthCondition, condition]);
        }
    };

    const handleNext = () => {
        console.log('Collecting vulnerability data...')

        // Get sex from userData (should be available from register screen)
        const userSex = existingUserData.sex

        // Combine existing data with vulnerability data
        const completeUserData = {
            ...existingUserData,
            // Vulnerability data
            vulnerability: {
                hasGuardian,
                guardianInfo: hasGuardian === 'yes' ? {
                    name: guardianName,
                    contact: guardianContact,
                    relationship: guardianRelation,
                    address: guardianAddress
                } : null,
                householdCount,
                physicalDisability,
                otherPhysicalDisability,
                psychologicalDisability,
                sensoryDisability,
                otherSensoryDisability,
                pregnancy: userSex === 'Female' ? pregnancy : null,
                dueDate: pregnancy === 'yes' ? dueDate : null,
                healthCondition,
                mobilityStatus
            },
            step: 'vulnerability'
        }
        
        console.log('Complete user data with vulnerability:', completeUserData)
        
        // Navigate to upload screen with all data
        router.push({
            pathname: './uploadID',
            params: {
                userData: JSON.stringify(completeUserData)
            }
        });
    };

    //renders vulnerability assessment form
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ThemedView style={styles.container} safe={true}>
                    <Spacer height={44} />
                    <ThemedLogo/>
                    <TitleText type="title1">RESBAC</TitleText>
                    <TitleText type="title3">
                        Assessing your Vulnerability
                    </TitleText>
                    <TitleText type="title3" style={{textAlign: 'center'}}>
                        This will serve as your emergency details. {"\n"}Please fill-out all of the required details.
                    </TitleText>
                    <Spacer/>

                     {/* DEBUG: Show received data */}
                    {existingUserData.name && (
                        <TitleText type="title4" style={{textAlign: 'center', color: 'green'}}>
                            Data for: {existingUserData.name}
                        </TitleText>
                    )}

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
                                onChangeText={setGuardianName}
                            />
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Guardian Contact Number"
                                value={guardianContact}
                                onChangeText={setGuardianContact}
                            />
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Relationship"
                                value={guardianRelation}
                                onChangeText={setGuardianRelation}
                            />
                            <ThemedTextInput
                                style={{width: '80%', marginBottom: 5}}
                                placeholder="Guardian Address"
                                value={guardianAddress}
                                onChangeText={setGuardianAddress}
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
                            value={otherPhysicalDisability}
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
                    {existingUserData.sex === 'Female' && (
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
                                    onChangeText={setDueDate}
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
                        onBack={() => router.back()}
                        onNext={handleNext} // Use our handleNext function that passes data
                    />
                </ThemedView>
            </TouchableWithoutFeedback>
        </ScrollView>
    )
}
export default Vulnerable

const styles = StyleSheet.create({
    scrollContainer: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fafafa',
        overflow: 'hidden',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pregnancyContainer: {
        width: '100%',
        alignSelf: 'center',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    categoryHeader: {
        width: '80%',
        alignSelf: 'center',
        fontSize: 15,
        marginBottom: 5,
    },
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
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
        alignSelf: 'flex-start',
        marginLeft: '10%',
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