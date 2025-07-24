import { View, Text, Image, StyleSheet } from 'react-native'
import Logo from '../assets/RESBACLogo.png'
import ProfilePic from '../assets/ProfilePic.png'

const TopBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>RESBAC</Text>
      </View>
      <Image source={ProfilePic} style={styles.profile}/>
    </View>
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
    elevation: 4, // for shadow on Android
    zIndex: 999,
    marginTop: 0,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 33,
    marginRight: 8,
    marginLeft: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 214,
  },
})
