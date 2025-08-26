import { ScrollView, StyleSheet, Image, View } from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

import { useQuery,useQueryClient } from '@tanstack/react-query'
import supabase from '../../contexts/supabaseClient'

const PickUpLocation = () => {
  // reads from supabase
  const fetchData = async () => {
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
  const {data: evacData,isPending,isError,error, refetch} = useQuery({
    queryKey: ["evacuationCenter"],
    queryFn: fetchData,
  })

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>

    <ThemedView style={styles.container}>

      <ThemedText title={true} style={styles.heading}>
        Pickup Locations
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