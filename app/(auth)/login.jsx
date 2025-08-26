import { ActivityIndicator, Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { Link, useRouter } from 'expo-router'
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
import TitleText from '../../components/TitleText'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useUser()
  const router = useRouter()

  const handleSubmit = async () => {
    // Clear any previous errors
    setError(null)

    // Validate input fields
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!password.trim()) {
      setError("Password is required")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting login with:', email)
      const result = await login(email.trim(), password)
      console.log('Login result:', result)
      console.log('Login successful, redirecting to dashboard')
      router.replace({ pathname: '/(dashboard)/home' })
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed. Please check your credentials.')
    } 
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container} safe={true}>
        <ThemedLogo />
        <Spacer height={20} />

        <TitleText type="title1">RESBAC</TitleText>

        <TitleText type="title3">
          Sign in to start your session
        </TitleText>

        <Spacer />
        
        <ThemedTextInput 
          style={{ width: '80%', marginBottom: 20 }}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(text) => {
            setEmail(text)
            if (error) setError(null) // Clear error when user starts typing
          }}
          value={email}
          editable={!isLoading}
        />

        <ThemedTextInput 
          style={{ width: '80%', marginBottom: 20 }}
          placeholder="Password"
          onChangeText={(text) => {
            setPassword(text)
            if (error) setError(null) // Clear error when user starts typing
          }}
          value={password}
          secureTextEntry
          editable={!isLoading}
        />

        <ThemedButton 
          onPress={handleSubmit}
          disabled={isLoading}
          style={isLoading ? styles.disabledButton : null}
        >
          {isLoading ? (
            <ActivityIndicator color="#f2f2f2" size="small" />
          ) : (
            <Text style={{ color: '#f2f2f2' }}>Login</Text>
          )}
        </ThemedButton>

        <TitleText type="title4" style={{ marginRight: 111 }}>
          Don't have an Account?{' '}
          <Link href="/register" asChild>
            <Text style={{ color: '#0060ff', fontWeight: '600' }}>
              Register instead
            </Text>
          </Link>
        </TitleText>

        <Spacer />
        {error && <Text style={styles.error}>{error}</Text>}

        <Link href="/mpin" asChild>
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
  btn: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
  },
  pressed: {
    opacity: 0.8
  },
  disabledButton: {
    opacity: 0.6
  },
  error: {
    color: Colors.warning,
    padding: 10,
    backgroundColor: '#f5c1c8',
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 10,
    textAlign: 'center',
  }
})