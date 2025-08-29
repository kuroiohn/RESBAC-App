// React Native core components for UI layout and interaction
import { Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, View } from 'react-native'
// Navigation components from Expo
import { Link } from 'expo-router'
import { useRouter } from 'expo-router'
// App constants and custom components
import { Colors } from '../../constants/Colors'
import DatePickerInput from '../../components/DatePickerInput'
import LocationPermissionInput from '../../components/LocationPermissionInput'
//adding checkbox
import { Checkbox } from 'react-native-paper';
import { useState, useEffect } from 'react'

// Custom themed components for consistent UI appearance
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedTextInput from '../../components/ThemedTextInput'
import Spacer from '../../components/Spacer'
import ThemedLogo from '../../components/ThemedLogo'
import TitleText from '../../components/TitleText'
import BackNextButtons from '../../components/buttons/BackNextButtons'
// Custom hook for user authentication
import { useUser } from '../../hooks/useUser'
import GenderSelector from "../../components/GenderSelector";
import supabase from '../../contexts/supabaseClient'
import { differenceInYears } from "date-fns";


/**
 * Registration component that handles user registration form
 * Collects user information, validates inputs, and submits to backend
 */
const Register = () => {
    // Form field state variables
    const { user:checkUser, logout } = useUser()
    
    // Force clear any existing session when registration screen loads
    useEffect(() => {
        const forceLogout = async () => {
            try {
                console.log('Forcing logout on registration screen')
                // Clear from UserContext
                await logout()
                
                // Force clear from Supabase directly with global scope
                await supabase.auth.signOut({ scope: 'global' })
                
                console.log('Forced logout complete')
            } catch (error) {
                console.log('Error during forced logout:', error)
                // Even if logout fails, continue with registration
            }
        }
        if (checkUser) {

            forceLogout()
        }
    }, [])
    
    const [firstName, setFirstName] = useState('') // User's full name
    const [middleName, setMiddleName] = useState('') // User's full name
    const [surname, setSurname] = useState('') // User's full name
    const [age, setAge] = useState(0) // set age
    const [email, setEmail] = useState('') // User's email address (used for authentication)
    const [contactNumber, setContactNumber] = useState('') // User's contact phone number
    const [address, setAddress] = useState('') // User's physical address
    const [locationData, setLocationData] = useState(null) // GPS location data
    const [sex, setSex] = useState('') // User's sex/gender
    const [password, setPassword] = useState('') // User's account password
    const [dob, setDob] = useState(null) // User's date of birth
    // Error handling state variables
    const [error, setError] = useState(null) // General form error message
    const [formErrors, setFormErrors] = useState({}) // Field-specific validation errors
    // Navigation
    const router = useRouter() // Router for navigating between screens
    // Authentication hook
    const { user, register } = useUser() // Custom hook for user registration functionality
    // state for checkbox
    const [isAgreed, setIsAgreed] = useState(false);

    /**
     * Validates all form fields and returns whether the form is valid
     * Populates formErrors state with validation error messages
     * @returns {boolean} True if form is valid, false otherwise
     */
    const validateForm = () => {
        const errors = {}

        // Name validation
        if (!firstName || firstName.trim() === '') {
            errors.firstName = "Name is required"
        }
        // if (!middleName || middleName.trim() === '') {
        //     errors.middleName = "Name is required"
        // }
        if (!surname || surname.trim() === '') {
            errors.surname = "Name is required"
        }

        // Date of Birth validation
        if (!dob) {
            errors.dob = "Date of Birth is required"
        }

        // Email validation
        if (!email || email.trim() === '') {
            errors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Email is invalid"
        }

        // Contact Number validation
        if (!contactNumber || contactNumber.trim() === '') {
            errors.contactNumber = "Contact Number is required"
        } else if (!/^\d{10,11}$/.test(contactNumber.replace(/[^0-9]/g, ''))) {
            errors.contactNumber = "Contact Number is invalid"
        }

        // Address validation
        if (!address || address.trim() === '') {
            errors.address = "Address is required"
        }

        // Location verification
        if (!locationData || !locationData.coordinates) {
            errors.location = "Location verification is required - please allow GPS access"
        }

        // Sex validation
        if (!sex) {
            errors.sex = "Sex is required"
        }

        // Password validation
        if (!password || password.trim() === '') {
            errors.password = "Password is required"
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    //handles the removal of error message if the state is corrected
    const clearFieldError = (fieldName) => {
        // Create a copy of the current errors
        const newErrors = { ...formErrors }
        // Delete the error for the specified field
        delete newErrors[fieldName]
        // Update the state
        setFormErrors(newErrors)
    }
    
    // handles the logic for the user agreement if agreed ot not
    const handleNext = () => {
        console.log('handleNext called with data:', { firstName, email, password })
        
        // Validation logic
        if (!isAgreed) {
            setError("Please agree to the terms and conditions to proceed.");
            return;
        }

        if (!validateForm()) {
            setError("Please fix the errors in the form");
            return;
        }

        // DON'T create account yet - just collect and pass data
        console.log('Collecting basic registration data...')

        const basicUserData = {
            // Basic info
            firstName,
            middleName,
            surname,
            age,
            email,
            password,
            contactNumber,
            address, // User's manually typed address
            location: locationData ? {
                coordinates: locationData.coordinates, // GPS coordinates
                address: locationData.address,
                formattedAddress: locationData.formattedAddress,
                manualAddress: address // Keep both manual and GPS data
            } : { manualAddress: address }, // Only manual address if GPS not used
            sex,
            dob,
            // Metadata
            step: 'basic',
            timestamp: new Date().toISOString()
        };

        console.log('Basic user data collected:', basicUserData)

        // Navigate to vulnerable screen with data
        router.push({
            pathname: './vulnerable',
            params: { 
                userData: JSON.stringify(basicUserData)
            }
        });
    }

    /**
     * Renders the registration form UI
     */
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ThemedView style={styles.container} safe={true}>
                    {/* Top part of the form */}
                    <Spacer height={44} />
                    <ThemedLogo/>
                    <TitleText type="title1">RESBAC</TitleText>
                    <TitleText type="title3">Sign in to start your session</TitleText>
                    <Spacer/>

                    {/* THE USER AGREEMENT SECTION */}
                    <View style={styles.agreementContainer}>
                        <Checkbox
                            status={isAgreed ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setIsAgreed(!isAgreed);
                                setError(null);
                            }}
                            color={Colors.primary} // Adjust color to match your theme
                        />
                        <Text style={styles.agreementText}>
                            I agree to the {' '}
                            <Text style={styles.linkText} onPress={() => { /* Navigate to T&C page */ }}>
                                Terms and Conditions
                            </Text>
                        </Text>
                    </View>

                        <>
                            {/* Name input field */}
                            <ThemedTextInput
                                style={{ width: '80%' }}
                                placeholder="First Name"
                                value={firstName}
                                onChangeText={text => {
                                    setFirstName(text);
                                    clearFieldError('firstName');
                                }}
                                editable={isAgreed}
                            />
                            <ThemedTextInput
                                style={{ width: '80%' }}
                                placeholder="Middle Name"
                                value={middleName}
                                onChangeText={text => {
                                    setMiddleName(text);
                                    clearFieldError('middleName');
                                }}
                                editable={isAgreed}
                            />
                            <ThemedTextInput
                                style={{ width: '80%' }}
                                placeholder="Surname"
                                value={surname}
                                onChangeText={text => {
                                    setSurname(text);
                                    clearFieldError('surname');
                                }}
                                editable={isAgreed}
                            />
                            {formErrors.name && <Text style={styles.fieldError}>{formErrors.name}</Text>}
                            {/* <TitleText type="title4" style={styles.inputHint}>
                                (First Name, Middle Name, Last Name)
                            </TitleText> */}

                            {/* Date of Birth picker */}
                            <DatePickerInput
                                value={dob}
                                onChange={date => {
                                    setDob(date);
                                    clearFieldError('dob');
                                    
                                    if(date){
                                        const age = differenceInYears(new Date(), new Date(date))
                                        setAge(age)
                                        console.log("Age: ",age); 
                                    }
                                }}
                                minimumDate={new Date(1900, 1, 1)}
                                maximumDate={new Date()} 
                                placeholder="Date of Birth"
                                disabled={!isAgreed}
                            />
                            {formErrors.dob && <Text style={styles.fieldError}>{formErrors.dob}</Text>}

                            {/* Email input field */}
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Email"
                                keyboardType="email-address"
                                onChangeText= {text => {
                                    setEmail(text.trim()); // Remove spaces automatically
                                    clearFieldError('email');
                                }}
                                value={email}
                                editable={isAgreed}
                            />
                            {formErrors.email && <Text style={styles.fieldError}>{formErrors.email}</Text>}

                            {/* Contact Number input field */}
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Contact Number"
                                value={contactNumber}
                                onChangeText={text => {
                                    setContactNumber(text);
                                    clearFieldError('contactNumber');
                                }}
                                keyboardType="phone-pad"
                                editable={isAgreed}
                            />
                            {formErrors.contactNumber && <Text style={styles.fieldError}>{formErrors.contactNumber}</Text>}

                            {/* Address input field - ALWAYS REQUIRED */}
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Address"
                                value={address}
                                onChangeText={text => {
                                    setAddress(text);
                                    clearFieldError('address');
                                }}
                                editable={isAgreed}
                            />
                            {formErrors.address && <Text style={styles.fieldError}>{formErrors.address}</Text>}

                            {/* Location Permission Component */}
                            <Text style={styles.locationLabel}>Verify your location for emergency services (Required):</Text>
                            <LocationPermissionInput
                                value={locationData}
                                onChange={data => {
                                    setLocationData(data);
                                    clearFieldError('location');
                                }}
                                placeholder="Allow location access"
                                disabled={!isAgreed}
                            />
                            {formErrors.location && <Text style={styles.fieldError}>{formErrors.location}</Text>}

                            {/* Sex input field */}
                            <GenderSelector
                                value={sex}
                                onChange={item => {
                                    setSex(item);
                                    clearFieldError('sex');
                                }}
                                placeholder="Select Sex"
                                disable={!isAgreed}
                            />
                            {formErrors.sex && <Text style={styles.fieldError}>{formErrors.sex}</Text>}

                            <TitleText type="title4" style={styles.inputHint}>
                                (Please select sex assigned at birth)
                            </TitleText>

                            {/* Password input field */}
                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 5 }}
                                placeholder="Password"
                                onChangeText={text => {
                                    setPassword(text);
                                    clearFieldError('password');
                                }}
                                value={password}
                                secureTextEntry
                                editable={isAgreed}
                            />
                                {formErrors.password && <Text style={styles.fieldError}>{formErrors.password}</Text>}
                            </>


                            {/* Back and Next navigation buttons */}
                            <BackNextButtons
                                onBack={() => router.push('/')}
                                onNext={handleNext} // Use our new handler
                                nextDisabled={!isAgreed} // Disable if checkbox is not checked
                            />

                            <Spacer />

                                {/* Display general form error if any */}
                                {error && <Text style={styles.error}>{error}</Text>}

                            {/* Link to login page */}
                            <Link href='/login' asChild>
                                <ThemedText style={{textAlign: 'center'}}>
                                    Login instead
                                </ThemedText>
                            </Link>
                </ThemedView>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
}

export default Register

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
    agreementContainer: {
        flexDirection: 'row',
        alignItems: 'center', // This correctly aligns the checkbox and text vertically
        marginBottom: 20,
        width: '80%', // The container width
    },
    agreementText: {
        fontSize: 14,
        color: '#555',
    },
    linkText: {
        color: Colors.link || 'blue',
        textDecorationLine: 'underline',
    },
    inputHint: {
        marginLeft: 111,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    locationLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        alignSelf: 'flex-start',
        marginLeft: '10%',
    }
})
