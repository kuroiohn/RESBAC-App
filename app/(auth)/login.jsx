import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}> {/* if the user clicks anywhere, mawawala yung keeb */}
      <ThemedView style = {styles.container} safe = {true}> {/* safe means nasa safe view sha so hindi mag-ooverflow sa top */}
        
        <ThemedLogo />
        <Spacer height = {20} />
            
        <ThemedText style={styles.title2}>
          RESBAC
        </ThemedText>

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
          <Text style={{ color: '#f2f2f2' }}>
            Login
          </Text>
        </ThemedButton>

        <Text style={styles.title4} >
          Don't have an Account?{' '}
            <Link href="/register" asChild>
              <Text style={{ color: '#0060ff', fontWeight: '600' }}>
                Register instead
              </Text>
            </Link>
        </Text>

        <Spacer />
          {error && <Text style={styles.error}>{error}</Text>}

        <Link href="/mpin">
          <ThemedText>MPIN</ThemedText>
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
    title4: {
      color: '#161616',
      fontSize: 11,
      marginRight: 111,
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