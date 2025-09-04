import { StyleSheet, Text, Image } from "react-native";
import blueCheck from "../../assets/blueCheck.png";
import ThemedView from "../../components/ThemedView";
import { Link } from "expo-router";
import TitleText from "../../components/TitleText";
import Spacer from "../../components/Spacer";
import ThemedButton from "../../components/ThemedButton";

const regisComplete = () => {
  return (
    <ThemedView style={styles.container}>
      <Image source={blueCheck} />
      <Spacer height={10} />

      <TitleText type='title2'>Registration Completed</TitleText>
      <Spacer height={10} />
      <TitleText type='title3' style={{ alignItems: "center" }}>
        Thank you for completing our registration {"\n"}
        process. This will help us provide assistance {"\n"}
        to you in time of disaster. Verification of {"\n"}
        account may take up to [N - N] days.
      </TitleText>

      <Spacer />

      <Link href='/' asChild>
        <ThemedButton>
          <Text style={{ color: "white" }}>Go to Dashboard</Text>
        </ThemedButton>
      </Link>
    </ThemedView>
  );
};

export default regisComplete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
