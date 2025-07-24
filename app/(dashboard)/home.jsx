import { StyleSheet, Image, View, ScrollView } from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

import CallButton from "../../assets/CallBtn.png"
import Evacuated from "../../assets/EvacuatedFrame.png"
import AlertLevel from "../../assets/AlertLevel.png"
import EvacCenters from "../../assets/EvacCenters.png"
import PickUpLocs from "../../assets/PickUpLocs.png"

const Home = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>

        <ThemedText title={true} style={styles.heading}>
          Request Rescue?
        </ThemedText>

        <ThemedText>
          Press the button below and help will
        </ThemedText>
        <ThemedText>
          reach you shortly.
        </ThemedText>

        <Spacer />
        <Image source={CallButton} />
        <Spacer />
        <Image source={Evacuated} />

        <ThemedText style={styles.textLeft}>
          Alerts
        </ThemedText>

        <Image source={AlertLevel} />

        <ThemedText style={styles.textLeft}>
          Emergency Guide
        </ThemedText>

        <View style={styles.row}>
          <Image source={EvacCenters} />
          <Image source={PickUpLocs} />
        </View>

      </ThemedView>
    </ScrollView>
  )
}

export default Home


const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 33,
    textAlign: "center",
  },
  textLeft: {
  textAlign: 'left',
  alignSelf: 'stretch',
  marginLeft: 50,
  fontSize: 19,
  marginTop: 10,
  marginBottom: 5,
  },
  row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 5,
  marginBottom: 5,
  },
})