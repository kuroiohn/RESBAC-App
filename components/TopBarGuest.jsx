import { View, Text, Image, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Logo from '../assets/RESBACLogo.png'

// themed components
import ThemedView from '../components/ThemedView'

const TopBar = () => {
  const router = useRouter()

  return (
    <ThemedView style={styles.container} safe={true}>
      {/* Left Section: Back + Logo + Title */}
      <View style={styles.left}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>RESBAC</Text>
      </View>

      {/* Right Section: Guest Access */}
      <Text style={styles.guest}>Guest Access</Text>
    </ThemedView>
  )
}

export default TopBar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    elevation: 4,
    zIndex: 999,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    fontSize: 17,
    marginRight: 12,
    color: '#0060ff',
    fontWeight: '600',
  },
  logo: {
    width: 30,
    height: 33,
    marginRight: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  guest: {
    fontSize: 14,
    color: '#0060ff',
    fontWeight: '600',
    marginRight: 17,
  },
})
