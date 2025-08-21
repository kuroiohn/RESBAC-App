import { useRef } from 'react'
import LottieView from 'lottie-react-native'
import { TouchableWithoutFeedback, StyleSheet, View, Linking, Alert } from 'react-native'

const CallButton = ({ onAnimationStart, onAnimationFinish }) => {
  const animationRef = useRef(null)
  const phoneNumber = "09684319082"

  const handleDial = async () => {
    const url = `tel:${phoneNumber}`
    const supported = await Linking.canOpenURL(url)

    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert("Error", "Dialer not supported on this device!")
    }
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={() => {
        // Tell Home to switch to "Help is on the way" UI
        if (onAnimationStart) onAnimationStart()
        animationRef.current?.reset()
        animationRef.current?.play()
      }}
    >
      <View style={styles.container}>
        <LottieView
          ref={animationRef}
          source={require('../assets/animations/rippleBtn.json')}
          style={styles.animation}
          autoPlay={false}
          loop={false}
          onAnimationFinish={() => {
            // After animation, open dialer
            handleDial()
            if (onAnimationFinish) onAnimationFinish()
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  )
}

export default CallButton

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
})
