import { ScrollView, StyleSheet, Image, View } from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

//goodshi imports
import EmergencyContactsPic from "../../assets/ECPic.png"
import DuringFlood from "../../assets/DuringFlood.png"
import DuringFire from "../../assets/DuringFire.png"
import Earthquake from "../../assets/Earthquake.png"

import Water from "../../assets/Water.png"
import Flashlight from "../../assets/Flashlight.png"
import Medications from "../../assets/Medications.png"
import Identification from "../../assets/Identification.png"
import Food from "../../assets/Food.png"
import Clothing from "../../assets/Clothing.png"
import Money from "../../assets/Money.png"
import Batteries from "../../assets/Batteries.png"

import HBES from "../../assets/HBES.png"
import PES from "../../assets/PES.png"
import CES from "../../assets/CES.png"
import CIS from "../../assets/CIS.png"
import GuestOnly from '../../components/auth/GuestOnly'

import { useState } from 'react'
import { useQuery,useQueryClient } from '@tanstack/react-query'
import supabase from '../../contexts/supabaseClient'

const EmergencyGuideContent = () => {

  // reads from supabase
  const fetchData = async () => {
    const {data,error} = await supabase
    .from('evacuationCenter')
    .select()

    if(error){
      console.error("Fetch error in supabase: ", error)
    }
    console.log("Successful fetch",  data);
    return data
  }
  // use data here to map the values and read
  const {data: evacData,isPending,isError,error, refetch} = useQuery({
    queryKey: ["evacuationCenter"],
    queryFn: fetchData,
  })

  return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.container}>

          <Image source={EmergencyContactsPic} />

          <ThemedText style={styles.textLeft}>
            Emergency Guides
          </ThemedText>

          <View style={styles.row}>
            <Image source={DuringFlood} />
            <Image source={DuringFire} />
            <Image source={Earthquake} />
          </View>

          <ThemedText style={styles.textBlue}>
            What to pack in a Go-Bag?
          </ThemedText>

          <View style={styles.row}>
            <Image source={Water} />
            <Image source={Flashlight} />
            <Image source={Medications} />
            <Image source={Identification} />
          </View>

          <View style={styles.row}>
            <Image source={Food} />
            <Image source={Clothing} />
            <Image source={Money} />
            <Image source={Batteries} />
          </View>

          <ThemedText style={styles.textLeft}>
            Evacuation Centers
          </ThemedText>

          {/* enclose this in the component */}
          {
            evacData?.map( evac => (
              <View key={evac.id}>
                <Image source={{uri:evac.evacImage}} style={{ width: 200, height: 200 }}/>
                <ThemedText style={styles.dateText}>
                  {evac.evacName}
                </ThemedText>
                <ThemedText style={styles.dateText}>
                  {evac.evacAddress}
                </ThemedText>
              </View>
            ))
          }

          {/* <Image source={HBES} style={styles.g1}/>
          <Image source={PES} style={styles.g1}/>
          <Image source={CIS} style={styles.g1}/>
          <Image source={CES} style={styles.g1}/> */}

        </ThemedView>
      </ScrollView>
  )
}

export default EmergencyGuideContent

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.0 }],
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  image: {
    resizeMode: 'contain',
    marginTop: 20,
  },
  row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 5,
  marginBottom: 5,
  },
  textLeft: {
  textAlign: 'left',
  alignSelf: 'stretch',
  marginLeft: 50,
  fontSize: 19,
  marginTop: 10,
  marginBottom: 5,
  },
  textBlue: {
  textAlign: 'left',
  alignSelf: 'stretch',
  marginLeft: 50,
  fontSize: 12,
  marginTop: 10,
  marginBottom: 5,
  color: '#0060ff',
  fontWeight: "bold",
  },
  g1: {
    marginBottom: 10,
  }
})