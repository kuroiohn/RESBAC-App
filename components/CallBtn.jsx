import { useRef } from 'react'
import LottieView from 'lottie-react-native'
import { TouchableWithoutFeedback, StyleSheet, View } from 'react-native'

const CallButton = () => {
  const animationRef = useRef(null)

  return (
    <TouchableWithoutFeedback
      onPressIn={() => animationRef.current?.play()}
    >
      <View style={styles.container}>
        <LottieView
          ref={animationRef}
          source={require('../assets/animations/rippleBtn.json')}
          style={styles.animation}
          autoPlay={false}
          loop={false}
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
