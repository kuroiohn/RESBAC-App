import { ActivityIndicator, Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { Link } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'

//themed components
import ThemedLogo from '../../components/ThemedLogo'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'
import Spacer from '../../components/Spacer'
import ThemedLoader from '../../components/ThemedLoader'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const { login } = useUser()

  const handleSubmit = async () => {
    setError(null)

    try {
        await login(email, password)
    } catch (error) {
        setError(error.message)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style = {styles.container} safe = {true}>

            <ThemedLogo />
            <Spacer height = {20} />

            <ThemedText style={styles.title2}>RESBAC</ThemedText>

            <ThemedText style={styles.title3}>
                Sign in to start your session
            </ThemedText>

            <Spacer />
            <ThemedTextInput 
            style = {{ width: '80%', marginBottom: 20 }}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
            />

            <ThemedTextInput 
            style = {{ width: '80%', marginBottom: 20 }}
            placeholder="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            />

            <ThemedButton onPress={handleSubmit}>
                <Text style={{ color: '#f2f2f2' }}>Login</Text>
            </ThemedButton>

            <Spacer />
            {error && <Text style={styles.error}>{error}</Text>}

            <Link href="/mpin">
                    <ThemedText>MPIN</ThemedText>
                </Link>

            <Link href='/register'>
                <ThemedText style = {{textAlign: 'center'}}>
                    Register instead
                </ThemedText>
            </Link>

        </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Login

const styles = StyleSheet.create({
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
    btn: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 5,
    },
    pressed: {
        opacity: 0.8
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