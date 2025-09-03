import { View, Text, ImageBackground, Image, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Phone, MessageCircle } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import supabase from '../contexts/supabaseClient'

export default function RescuerCard() {
  const queryClient = useQueryClient()

  // reads from supabase
  const fetchContact = async () => {
    const {data,error} = await supabase
    .from('emergencyPersons')
    .select()

    if(error){
      console.error("Fetch error in supabase emerP: ", error)
    }
    console.log("Successful fetch",  data);
    return data
  }
  // use data here to map the values and read
  const {data: emerPData,error: emerPError} = useQuery({
    queryKey: ["emergencyPersons"],
    queryFn: fetchContact,
  })
  if (emerPError) {
    console.error("Error in query of emergency persons table: ", emerPError);
    
  }

  // subscribe to realtime
  useEffect(() => {
    const emerPChannnel = supabase
      .channel('emerP-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergencyPersons' },
        (payload) => {
          console.log("Realtime change received:", payload);

          // Ask react-query to refetch alerts when a row is inserted/updated/deleted
          queryClient.invalidateQueries(["emergencyPersons"]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(emerPChannnel);
    };
  }, [queryClient]);

  const handleContactBtn = async (number) => {
    const url = `tel:${number}`
      const supported = await Linking.canOpenURL(url)
  
      if (supported) {
        await Linking.openURL(url)
      } else {
        Alert.alert("Error in Rescuer Card", "Dialer not supported on this device!")
      }
  }

  const handleMsgBtn = async (link) => {
    const splitLink = link.split('/')
    const username = splitLink.slice(3).join('/')
    console.log("Username:", username);
    

      const supported = await Linking.canOpenURL(`https://m.me/${username}`)
  
      if (supported) {
        await Linking.openURL(`https://m.me/${username}`)
      } else {
        Alert.alert("Error in Rescuer Card", "Device cannot open link")
      }
  }

  return (
    <>
      {
        emerPData?.map(
          emerP => (
            <LinearGradient
            key={emerP.id}
              colors={["#0060FF", "rgba(0, 58, 153, 0)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.borderWrapper}
              >
              <ImageBackground source={require("../assets/hbesbg.png")} style={styles.card} imageStyle={styles.backgroundImage}>
                <View style={styles.contentRow}>
                  
                  {/* Rescuer Profile */}
                  <Image source={{uri: emerP.emerPImage}} style={styles.profileImage} />

                  {/* Rescuer Details */}
                  <View style={styles.infoWrapper}>
                    <Text style={styles.name}>{emerP.emerPName}</Text>
                    <Text style={styles.position}>{emerP.emerPRole}</Text>
                    <Text style={styles.barangay}>{emerP.emerPBrgy}</Text>
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.button, styles.callButton]} activeOpacity={0.7} onPress={() =>  handleContactBtn(emerP.emerPNumber)}>
                    <Phone color="#0060ff" size={18} style={{ marginRight: 6 }} />
                    <Text style={styles.callText}>Call {emerP.emerPNumber}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.button, styles.messageButton]} activeOpacity={0.7} onPress={() => handleMsgBtn(emerP.emerPMessLink)}>
                    <MessageCircle color="#0060FF" size={18} style={{ marginRight: 6 }} />
                    <Text style={styles.messageText}>Click here to message </Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </LinearGradient>
          )
        )
      } 
    </>
  );
}

const styles = StyleSheet.create({
  borderWrapper: {
    borderRadius: 16,
    padding: 2,
    margin: 8,
    width: "95%",
    marginBottom: 5,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
  },
  backgroundImage: {
    borderRadius: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },
  infoWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  position: {
    fontSize: 14,
    color: "white",
  },
  barangay: {
    fontSize: 14,
    color: "white",
  },
  buttonRow: {
    flexDirection: "column",
    gap: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 0,
  },
  callButton: {
    backgroundColor: "white",
  },
  callText: {
    color: "#0060ff",
    fontSize: 14,
    fontWeight: "600",
  },
  messageButton: {
    borderWidth: 1,
    borderColor: "#0060FF",
    backgroundColor: "#fff",
  },
  messageText: {
    color: "#0060FF",
    fontSize: 14,
    fontWeight: "600",
  },
});