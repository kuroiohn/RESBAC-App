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
import TitleText from '../../components/TitleText'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const [dob, setDob] = useState(null)

  const { user, register } = useUser()

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
            <ThemedView style = {styles.container} safe={true}>

                <Spacer height={44} />
                <ThemedLogo/>

                <TitleText type="title1">RESBAC</TitleText>

                <TitleText type="title3">
                    Sign in to start your session
                </TitleText>

                <Spacer/>

                <ThemedTextInput 
                    style = {{ width: '80%', }}
                    placeholder="Name"
                    //value={name}
                />

                <TitleText type="title4">
                    (First Name, Middle Name, Last Name)
                </TitleText>

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
                    onNext={() => router.push('./uploadID')}
                />

                <Spacer />
                {error && <Text style={styles.error}>{error}</Text>}

                <Link href='/login' asChild>
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