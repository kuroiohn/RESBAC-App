import { Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { Link } from 'expo-router'
import { useState } from 'react'
import { Colors } from '../../constants/Colors'
import DatePickerInput from '../../components/DatePickerInput'
import { useRouter } from 'expo-router'


//themed components
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'
import Spacer from '../../components/Spacer'
import { useUser } from '../../hooks/useUser'
import ThemedLogo from '../../components/ThemedLogo'
import BackNextButtons from '../../components/buttons/BackNextButtons'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const [dob, setDob] = useState(null)

  const { user, register } = useUser()

  //iinclude sa actual register page na may button.
  const handleSubmit = async () => {
    setError(null)

    try {
        await register(email, password)
        console.log('current user is: ', user)
    } catch (error) {
        setError(error.message)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style = {styles.container}>

                <Spacer height={44} />
                <ThemedLogo/>

                <ThemedText style={styles.title2}>RESBAC</ThemedText>

                <ThemedText style={styles.title3}>
                    Sign in to start your session
                </ThemedText>

                <Spacer/>

                <ThemedTextInput 
                    style = {{ width: '80%', }}
                    placeholder="Name"
                    //value={name}
                />

                <Text style = {styles.title4}>
                    (First Name, Middle Name, Last Name)
                </Text>

                    <DatePickerInput
                        value={dob}
                        onChange={setDob}
                        placeholder="Date of Birth"
                    />

                <ThemedTextInput 
                    style = {{ width: '80%', marginBottom: 20 }}
                    placeholder="Email"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                />

                <ThemedTextInput 
                    style = {{ width: '80%', marginBottom: 20 }}
                    placeholder="Contact Number"
                    //value={name}
                />

                <ThemedTextInput 
                    style = {{ width: '80%', marginBottom: 20 }}
                    placeholder="Address"
                    //value={name}
                />

                <ThemedTextInput 
                    style = {{ width: '80%', marginBottom: 20 }}
                    placeholder="Confirm your Location"
                    //value={name}
                />

                <ThemedTextInput 
                    style = {{ width: '80%', marginBottom: 20 }}
                    placeholder="Sex"
                    //value={name}
                />

                <ThemedTextInput 
                    style = {{ width: '80%', marginBottom: 20 }}
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                />

                <BackNextButtons
                    onBack={() => router.push('/')}
                    onNext={() => router.push('./upload-id')}
                />

                <Spacer />
                {error && <Text style={styles.error}>{error}</Text>}

                <Link href='/login'>
                    <ThemedText style = {{textAlign: 'center'}}>
                        Login instead
                    </ThemedText>
                </Link>

            </ThemedView>
        </TouchableWithoutFeedback>
    </ScrollView>
  )
}

export default Register

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
    title: {
        textAlign: 'center',
        fontSize: 19,
        marginBottom: 30
    },
    title2: {
        color: '#161616',
        fontSize: 50,
        fontWeight: 'bold',
    },
    title3: {
        color: '#919191',
        fontSize: 15,
    },
    title4: {
        color: '#6e7477',
        fontSize: 11,
        marginLeft: 111,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    error: {
            color: Colors.warning,
            padding: 10,
            backgroundColor: '#f5c1c8',
            borderColor: Colors.warning,
            borderWidth: 1,
            borderRadius: 5,
            marginHorizontal: 10,
        }
})