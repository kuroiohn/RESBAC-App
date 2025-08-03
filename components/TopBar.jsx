import { View, Text, Image, StyleSheet } from 'react-native'
import Logo from '../assets/RESBACLogo.png'
import ProfilePic from '../assets/ProfilePic.png'

//themed components
import ThemedView from '../components/ThemedView'

const TopBar = () => {
  return (
    <ThemedView style={styles.container} safe = {true}>
      <View style={styles.left}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>RESBAC</Text>
      </View>
      <Image source={ProfilePic} style={styles.profile}/>
    </ThemedView>
  )
}

export default TopBar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fafafa',
    elevation: 4,
    zIndex: 999,
    height: 130,
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
    textAlignVertical: 'center',
    includeFontPadding: false, // Android only, prevents font baseline padding

  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 214,
  },
})
