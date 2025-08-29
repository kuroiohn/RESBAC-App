import { useRef,useEffect, useState } from 'react'
import LottieView from 'lottie-react-native'
import { TouchableWithoutFeedback, StyleSheet, View, Linking, Alert } from 'react-native'
import supabase from '../contexts/supabaseClient'
import { useUser } from '../hooks/useUser'

const CallButton = ({ onAnimationStart, onAnimationFinish }) => {
  const {user} = useUser()
  const animationRef = useRef(null)
  const phoneNumber = "09684319082"
  const [isDisabled,setIsDisabled] = useState(false)

  const handleDial = async () => {
    // const { data: { user }, error: userError } = await supabase.auth.getUser();
    // if (userError) {
    //   console.error("Error fetching auth user: ", userError);
    // }

    const {data,error} = await supabase
    .from('user')
    .update({pressedCallBtn: true})
    .eq("userID",user.id)
    .select()

    console.log("updated call btn:", data, error);

    if(error) {
      console.error("Error in updating call btn", error);
    }
  
    const url = `tel:${phoneNumber}`
    const supported = await Linking.canOpenURL(url)

    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert("Error", "Dialer not supported on this device!")
    }
  }

  console.log(isDisabled);
  
  return (
    <TouchableWithoutFeedback disabled={isDisabled}
      onPressIn={() => {
        // Tell Home to switch to "Help is on the way" UI
        if (onAnimationStart) onAnimationStart()
        //animationRef.current?.reset()
        setIsDisabled(true)
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
