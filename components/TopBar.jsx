import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Logo from "../assets/RESBACLogo.png";
import ProfilePic from "../assets/ProfilePic.png";

//themed components
import ThemedView from "../components/ThemedView";
import { useNavigation } from "@react-navigation/native"; // import navigation hook

const TopBar = () => {
  const navigation = useNavigation(); // initialize navigation

  const goToProfile = () => {
    navigation.navigate("profile"); // navigate to Profile tab
  };

  return (
    <ThemedView style={styles.container} safe={true}>
      <View style={styles.left}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>RESBAC</Text>
      </View>
      <TouchableOpacity onPress={goToProfile}>
        <Image source={ProfilePic} style={styles.profile} />
      </TouchableOpacity>
    </ThemedView>
  );
};

export default TopBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40, // add space at the top
    paddingBottom: 0, // remove extra space at the bottom
    backgroundColor: "#fafafa",
    elevation: 4,
    zIndex: 999,
    height: 100,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 33,
    marginRight: 8,
    marginLeft: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    textAlignVertical: "center",
    includeFontPadding: false, // removes extra font padding
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
