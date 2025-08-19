import { StyleSheet, Text, View, Animated, Easing, Pressable, Alert, } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'

// themed components
import ThemedLogo from '../../components/ThemedLogo'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'

const MPin = () => {
  const router = useRouter()
  const [mpin, setMpin] = useState('')

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

    for (let i = mpin.length; i < 4; i++) {
      dotAnimations[i].setValue(0)
    }
  }, [mpin])

  const handleKeyPress = (val) => {
    if (mpin.length < 4) {
      setMpin((prev) => prev + val)
    }
  }

  const handleDelete = () => {
    setMpin((prev) => prev.slice(0, -1))
  }

  const handleSubmit = () => {
    if (mpin.length === 4) {
      console.log('MPIN submitted:', mpin)
      router.push('/home') // Adjust route as needed
    } else {
      Alert.alert('Invalid MPIN', 'Please enter a 4-digit MPIN.')
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
    >
      <Text style={styles.keyText}>{label}</Text>
    </Pressable>
  )

  return (
    <ThemedView style={styles.container}>
      
      <ThemedLogo />
      <Spacer height={20} />

      <ThemedText style={styles.title2}>Enter MPIN</ThemedText>
      <ThemedText style={styles.title3}>Use your 4-digit code</ThemedText>

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
        {renderKey('❌', handleDelete, true)}
        {renderKey('0', () => handleKeyPress('0'))}
        {renderKey('✔️', handleSubmit, true)}
      </View>
        
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
    fontSize: 40,
    fontWeight: 'bold',
  },
  title3: {
    color: '#919191',
    fontSize: 15,
    marginBottom: 20,
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
})
