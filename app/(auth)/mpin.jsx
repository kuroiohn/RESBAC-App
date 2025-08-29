import { StyleSheet, Text, View, Animated, Easing, Pressable, Alert } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { useUser } from '../../hooks/useUser'
import { SecureStorage } from '../../utils/secureStorage'
import supabase from '../../contexts/supabaseClient'
import AsyncStorage from '@react-native-async-storage/async-storage'

// themed components
import ThemedLogo from '../../components/ThemedLogo'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'

const MPin = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { setUser, login } = useUser()
  const [mpin, setMpin] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const userEmail = params.userEmail || params.email || ''

  console.log('MPIN screen loaded')
  console.log('All params:', params)
  console.log('Extracted email:', userEmail)

  const dotAnimations = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current

  useEffect(() => {
    mpin.split('').forEach((_, i) => {
      Animated.timing(dotAnimations[i], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start()
    })

    for (const i of Array.from({ length: 4 - mpin.length }, (_, index) => mpin.length + index)) {
      dotAnimations[i].setValue(0)
    }
  }, [mpin])

  // If no email provided, redirect back to login
  useEffect(() => {
    if (!userEmail) {
      console.log('No email found, redirecting to login')
      Alert.alert(
        'Email Required',
        'Please select MPIN option from the login screen.',
        [
          { text: 'Go to Login', onPress: () => router.replace('/login') }
        ]
      )
    }
  }, [userEmail])

  const handleKeyPress = (val) => {
    if (mpin.length < 4) {
      setMpin((prev) => prev + val)
    }
  }

  const handleDelete = () => {
    setMpin((prev) => prev.slice(0, -1))
  }

  const handleMpinSubmit = async () => {
    if (mpin.length !== 4) {
      Alert.alert('Invalid MPIN', 'Please enter a 4-digit MPIN.')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting MPIN unlock for:', userEmail)
      
      // Check local MPIN storage first (from registration or previous login)
      const localMpinData = await AsyncStorage.getItem(`user_mpin_${userEmail}`)
      
      if (localMpinData) {
        const { mpin: storedMpin, password, email } = JSON.parse(localMpinData)
        
        console.log(`Async: ${email} ${password} ${storedMpin}`);
        
        if (mpin === storedMpin) {
          console.log('Local MPIN verified - performing automatic login')
          
          // if may password stored, do automatic login
          if (password) {
            try {
              const result = await login(userEmail, password)
              console.log('Auto-login successful via MPIN')
              
              setUser(result.user)
              
              setTimeout(() => {
                router.replace('/(dashboard)/home')
              }, 100)
              return
            } catch (loginError) {
              console.error('Auto-login failed:', loginError)
              Alert.alert(
                'Login Failed',
                'MPIN verified but login failed. Please try email/password login.',
                [
                  { 
                    text: 'Go to Email Login', 
                    onPress: () => router.replace('/(auth)/login') 
                  }
                ]
              )
              return
            }
          } else {
            Alert.alert(
              'MPIN Verified!',
              'Your MPIN is correct, but you need to log in with email/password once to enable automatic login.',
              [
                { 
                  text: 'Go to Email Login', 
                  onPress: () => router.replace('/(auth)/login') 
                }
              ]
            )
            return
          }
        } else {
          throw new Error('Invalid MPIN. Please try again.')
        }
      }
      
      // Fallback: Check database MPIN
      console.log('Checking database MPIN...')
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('mpin')
        .eq('userID', userEmail)
        .single()
        
      if (userError || !userData) {
        throw new Error('No MPIN found for this email. Please log in with email/password first.')
      }
      
      if (mpin === userData.mpin) {
        console.log('Database MPIN verified - need password for login')
        Alert.alert(
          'MPIN Verified!', 
          'Your MPIN is correct, but you need to log in with email/password to enable automatic access.',
          [
            { 
              text: 'Go to Email Login', 
              onPress: () => router.replace('/(auth)/login') 
            }
          ]
        )
      } else {
        throw new Error('Invalid MPIN. Please try again.')
      }
      
    } catch (error) {
      console.error('MPIN unlock error:', error)
      Alert.alert('Authentication Failed', error.message || 'Invalid MPIN. Please try again.')
      setMpin('')
    } finally {
      setIsLoading(false)
    }
  }

  const renderKey = (label, onPress, isSpecial = false) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        isSpecial && styles.specialKey,
        pressed && { opacity: 0.6 },
      ]}
      disabled={isLoading}
    >
      <Text style={styles.keyText}>{label}</Text>
    </Pressable>
  )

  return (
    <ThemedView style={styles.container}>
      <ThemedLogo />
      <Spacer height={20} />

      <ThemedText style={styles.title2}>Enter MPIN</ThemedText>
      <ThemedText style={styles.title3}>
        Quick access for {userEmail}
      </ThemedText>



      {userEmail ? (
        <>
          {/* Dot Display */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2, 3].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    transform: [
                      {
                        scale: dotAnimations[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                    opacity: dotAnimations[i],
                  },
                ]}
              />
            ))}
          </View>

          {/* Custom Keypad */}
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) =>
              renderKey(num, () => handleKeyPress(num))
            )}
            {renderKey('⌫', handleDelete, true)}
            {renderKey('0', () => handleKeyPress('0'))}
            {renderKey(isLoading ? '⏳' : '✓', handleMpinSubmit, true)}
          </View>

          <Spacer height={20} />
          
          <ThemedText style={styles.backToLogin} onPress={() => router.replace('/login')}>
            ← Use Email Login Instead
          </ThemedText>
        </>
      ) : (
        <View style={{alignItems: 'center', marginTop: 50}}>
          <ThemedText>No email provided</ThemedText>
          <ThemedText style={styles.backToLogin} onPress={() => router.replace('/login')}>
            ← Back to Login
          </ThemedText>
        </View>
      )}
    </ThemedView>
  )
}

export default MPin

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title2: {
    color: '#161616',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title3: {
    color: '#919191',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 30,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  keypad: {
    width: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e4e4e4',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  specialKey: {
    backgroundColor: Colors.primary,
  },
  keyText: {
    fontSize: 24,
    color: '#161616',
  },
  backToLogin: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
})