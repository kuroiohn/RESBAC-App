import React, { useRef } from 'react'
import {
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
  Image,
} from 'react-native'

import CallIcon from '../assets/call_white.png' // Replace with your icon

const CIRCLE_COLORS = ['#FFCECD', '#FDEAE8', '#FAA09F', '#EB6563'] // outer → inner
const CIRCLE_SIZES = [200, 150, 100, 60]

const CallButton = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 3.33, // 60 → 200 size
        duration: 1111,
        easing: t => Math.pow(1 - t, 3), // cubic-bezier(1,0,0,1)
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.4, // fade as it expands
        duration: 1111,
        easing: t => Math.pow(1 - t, 3),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Reset after animation
      scaleAnim.setValue(1)
      opacityAnim.setValue(1)
      onPress?.()
    })
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.wrapper}>
        {/* Static background layers */}
        {CIRCLE_COLORS.map((color, index) => {
          const size = CIRCLE_SIZES[index]
          return (
            <View
              key={index}
              style={[
                styles.circle,
                {
                  backgroundColor: color,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  zIndex: index,
                },
              ]}
            />
          )
        })}

        {/* Animated pulsing layer */}
        <Animated.View
          style={[
            styles.pulse,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />

        {/* Core call button */}
        <View style={styles.innerCircle}>
          <Image source={CallIcon} style={styles.icon} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default CallButton

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 220,
  },
  circle: {
    position: 'absolute',
  },
  pulse: {
    backgroundColor: '#EB6563',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    zIndex: 5,
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EB6563',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 5,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
})
