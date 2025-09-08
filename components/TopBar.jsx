import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Logo from "../assets/RESBACLogo.png";
import ProfilePic from "../assets/ProfilePic.png";

//themed components
import ThemedView from "../components/ThemedView";
import { useNavigation } from "@react-navigation/native"; // import navigation hook
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useUser } from "../hooks/useUser";
import supabase from "../contexts/supabaseClient";

const TopBar = () => {
  const navigation = useNavigation(); // initialize navigation
  const {user} = useUser()
  
  const queryClient = useQueryClient();
  // reads from supabase
  const fetchUserData = async () => {
    const { data, error } = await supabase
    .from("user")
    .select('*')
    .eq("userID",user.id)
    .single()

    if (error) {
      console.error("Fetch error in supabase pickup: ", error);
    }
    console.log("Successful fetch", data);
    return data;
  };
  // use data here to map the values and read
  const { data: userData, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUserData,
  });

  // subscribe to realtime
  useEffect(() => {
    const userChannel = supabase
      .channel("user-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user", filter: `userID=eq.${user.id}` },
        (payload) => {
          console.log("Realtime change received:", payload);

          // Ask react-query to refetch alerts when a row is inserted/updated/deleted
          queryClient.invalidateQueries(["user"]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [queryClient]);

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
        <Image source={
          userData?.profilepPic !== null ?
          { uri: userData?.profilePic } : 
          ProfilePic} style={styles.profile} />
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
