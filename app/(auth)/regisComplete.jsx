import { StyleSheet, Text, View, Image } from 'react-native'
import blueCheck from "../../assets/blueCheck.png"
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'

const regisComplete = () => {
  return (
    <ThemedView style={styles.container}>

      <Image source={blueCheck}/>

      <ThemedText>Registration Completed</ThemedText>
    </ThemedView>
  )
}

export default regisComplete

const styles = StyleSheet.create({
  container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
