import { StyleSheet, Text, View, Animated, Easing, Pressable, Alert } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { useUser } from '../../hooks/useUser'
import AsyncStorage from '@react-native-async-storage/async-storage'
import supabase from '../../contexts/supabaseClient'

// themed components
import ThemedLogo from '../../components/ThemedLogo'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'

const MpinSetup = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { user } = useUser()
  const [mpin, setMpin] = useState('')
  const [confirmMpin, setConfirmMpin] = useState('')
  const [step, setStep] = useState('create')
  const [isCreating, setIsCreating] = useState(false)

  // Parse user data from registration
  const completeUserData = params.userData ? JSON.parse(params.userData) : {}

  const dotAnimations = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current

  const confirmDotAnimations = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current

  useEffect(() => {
    const currentMpin = step === 'create' ? mpin : confirmMpin
    const currentAnimations = step === 'create' ? dotAnimations : confirmDotAnimations

    currentMpin.split('').forEach((_, i) => {
      Animated.timing(currentAnimations[i], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start()
    })

    for (const i of Array.from({ length: 4 - currentMpin.length }, (_, index) => currentMpin.length + index)) {
      currentAnimations[i].setValue(0)
    }
  }, [mpin, confirmMpin, step])

  const handleKeyPress = (val) => {
    if (step === 'create' && mpin.length < 4) {
      setMpin(prev => prev + val)
    } else if (step === 'confirm' && confirmMpin.length < 4) {
      setConfirmMpin(prev => prev + val)
    }
  }

  const handleDelete = () => {
    if (step === 'create') {
      setMpin(prev => prev.slice(0, -1))
    } else {
      setConfirmMpin(prev => prev.slice(0, -1))
    }
  }

  const handleNext = () => {
    if (step === 'create' && mpin.length === 4) {
      setStep('confirm')
    } else if (step === 'confirm' && confirmMpin.length === 4) {
      if (mpin === confirmMpin) {
        completeRegistrationFlow()
      } else {
        Alert.alert('MPIN Mismatch', 'Your MPIN codes do not match. Please try again.', [
          {
            text: 'OK',
            onPress: () => {
              setConfirmMpin('')
              setStep('create')
              setMpin('')
            }
          }
        ])
      }
    } else {
      Alert.alert('Incomplete MPIN', 'Please enter a 4-digit MPIN.')
    }
  }

  const completeRegistrationFlow = async () => {
    setIsCreating(true)
    try {
      console.log('Completing registration with MPIN storage...')
      
      // Store MPIN locally for quick access
      await AsyncStorage.setItem(
        `user_mpin_${completeUserData.email}`, 
        JSON.stringify({
          mpin: mpin,
          email: completeUserData.email,
          password: completeUserData.password,
          createdAt: new Date().toISOString()
        })
      )
      
      console.log('MPIN stored locally for:', completeUserData.email)
      
      const userid = completeUserData.userID
      // update the database MPIN
      if (userid) {
        const { error: updateError } = await supabase
          .from('user')
          .update({ mpin: mpin })
          .eq('userID', userid)

        if (updateError) {
          console.log('Database MPIN update failed, but local storage succeeded:', updateError)
        } else {
          console.log('MPIN also saved to database')
        }
      }
      
      Alert.alert(
        'Registration Complete!', 
        'Your account is ready!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(dashboard)/home')
          }
        ]
      )
      
    } catch (error) {
      console.error('Error completing registration:', error)
      Alert.alert('Error', 'Failed to complete registration. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  //NOTE - this is not being called at all
  const saveMpinAndCompleteRegistration = async () => {
    setIsCreating(true)
    try {
      console.log('Completing registration with local MPIN storage...')
      
      console.log('Registration completed! MPIN will be stored locally when user first logs in.')
      
      Alert.alert(
        'Registration Complete!', 
        'Your account has been created successfully. Please log in with your email and password to enable MPIN quick access.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/login')
          }
        ]
      )
      
    } catch (error) {
      console.error('Error completing registration:', error)
      Alert.alert('Error', 'Failed to complete registration. Please try again.')
    } finally {
      setIsCreating(false)
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
      disabled={isCreating}
    >
      <Text style={styles.keyText}>{label}</Text>
    </Pressable>
  )

  const currentAnimations = step === 'create' ? dotAnimations : confirmDotAnimations

  return (
    <ThemedView style={styles.container}>
      <ThemedLogo />
      <Spacer height={20} />

      <ThemedText style={styles.title2}>
        {step === 'create' ? 'Create Your MPIN' : 'Confirm Your MPIN'}
      </ThemedText>
      <ThemedText style={styles.title3}>
        {step === 'create' 
          ? 'Choose a 4-digit code for quick access' 
          : 'Enter your MPIN again to confirm'
        }
      </ThemedText>

      {/* Debug info */}
      {completeUserData.name && (
        <Text style={{textAlign: 'center', color: 'green', marginBottom: 10, fontSize: 12}}>
          Setting up MPIN for: {completeUserData.name}
        </Text>
      )}

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
                    scale: currentAnimations[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
                opacity: currentAnimations[i],
              },
            ]}
          />
        ))}
      </View>

      {/* Show created MPIN when confirming */}
      {step === 'confirm' && (
        <>
          <ThemedText style={styles.createdMpinLabel}>Created MPIN:</ThemedText>
          <View style={styles.dotsContainer}>
            {[0, 1, 2, 3].map((i) => (
              <Animated.View
                key={`created-${i}`}
                style={[
                  styles.dot,
                  { opacity: i < mpin.length ? 1 : 0.3 }
                ]}
              />
            ))}
          </View>
        </>
      )}

      {/* Custom Keypad */}
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) =>
          renderKey(num, () => handleKeyPress(num))
        )}
        {renderKey('⌫', handleDelete, true)}
        {renderKey('0', () => handleKeyPress('0'))}
        {renderKey(
          isCreating ? '⏳' : (step === 'create' ? '→' : '✓'), 
          handleNext, 
          true
        )}
      </View>

      {isCreating && (
        <ThemedText style={styles.creatingText}>
          Completing registration...
        </ThemedText>
      )}
    </ThemedView>
  )
}

export default MpinSetup

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title2: {
    color: '#161616',
    fontSize: 28,
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
  createdMpinLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 20,
    marginBottom: -10,
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
  creatingText: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
})