import { StyleSheet, Text } from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import ThemedButton from "../../components/ThemedButton"
import { useUser } from '../../hooks/useUser'

const Profile = () => {
  const { logout, user } = useUser()
  
  return (
    <ThemedView style={styles.container}>

      <ThemedText title={true} style = {styles.heading}>
        {user.email}
      </ThemedText>

      <ThemedButton onPress={logout}>
        <Text style= {{ color: '#f2f2f2 '}}> logout </Text>
      </ThemedButton>
      <Spacer />

      <ThemedText>Time to start reading some books...</ThemedText>
      <Spacer />

    </ThemedView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
})