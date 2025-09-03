import { ScrollView, StyleSheet, Image, View } from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

import { useQuery,useQueryClient } from '@tanstack/react-query'
import supabase from '../../contexts/supabaseClient'
import { useEffect } from 'react'

const PickUpLocation = () => {
  const queryClient = useQueryClient();
  // reads from supabase
  const fetchEvacData = async () => {
    const {data,error} = await supabase
    .from('evacuationCenter')
    .select()

    if(error){
      console.error("Fetch error in supabase pickup: ", error)
    }
    console.log("Successful fetch",  data);
    return data
  }
  // use data here to map the values and read
  const {data: evacData,error: evacError} = useQuery({
    queryKey: ["evacuationCenter"],
    queryFn: fetchEvacData,
  })
  
  // reads from supabase
  const fetchPickupData = async () => {
    const {data,error} = await supabase
    .from('pickupLocations')
    .select()

    if(error){
      console.error("Fetch error in supabase pickup: ", error)
    }
    console.log("Successful fetch",  data);
    return data
  }
  // use data here to map the values and read
  const {data: pickupData,error: pickupError} = useQuery({
    queryKey: ["pickupLocations"],
    queryFn: fetchPickupData,
  })

  // subscribe to realtime
  useEffect(() => {
    const evacChannel = supabase
      .channel('evac-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'evacuationCenter' },
        (payload) => {
          console.log("Realtime change received:", payload);

          // Ask react-query to refetch alerts when a row is inserted/updated/deleted
          queryClient.invalidateQueries(["evacuationCenter"]);
        }
      )
      .subscribe();

    const pickupChannel = supabase
      .channel('pickup-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickupLocations' },
        (payload) => {
          console.log("Realtime change received:", payload);

          // Ask react-query to refetch alerts when a row is inserted/updated/deleted
          queryClient.invalidateQueries(["pickupLocations"]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(evacChannel);
      supabase.removeChannel(pickupChannel);
    };
  }, [queryClient]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>

    <ThemedView style={styles.container}>

      <Spacer />
      <ThemedText title={true} style={styles.heading}>
        Evacuation Centers
      </ThemedText>
      <Spacer />

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

          <Spacer/>
          <ThemedText title={true} style={styles.heading}>
            Pickup Locations
          </ThemedText> 
          {
            pickupData?.map( pickup => (
              <View key={pickup.id}>
                <Image source={{uri:pickup.pickupImage}} style={{ width: 200, height: 200 }}/>
                <ThemedText style={styles.dateText}>
                  {pickup.pickupName}
                </ThemedText>
                <ThemedText style={styles.dateText}>
                  {pickup.pickupAddress}
                </ThemedText>
              </View>
            ))
          }
    </ThemedView>
  </ScrollView>
  )
}

export default PickUpLocation

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