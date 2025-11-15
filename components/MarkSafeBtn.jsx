import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../hooks/useUser";

import supabase from "../contexts/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const EvacuationStatusCard = ({ style, ...props }) => {
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [mark, setMark] = useState(false);

  useEffect(() => {
    const userid = user.id;
    // reads from supabase
    const fetchData = async () => {
      // Get the current logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error fetching auth user:", userError);
        throw new Error("No active session / user");
      }

      const { data, error } = await supabase
        .from("user")
        .select("markAsSafe")
        .eq("userID", user.id)
        .maybeSingle();

      if (error) {
        console.error("Fetch error in supabase markassafe: ", error);
      }
      console.log("Successful fetch", data);
      if (data) {
        setMark(data.markAsSafe !== null ? true : false);
        if (data.markAsSafe) setStep(2);
      } else {
        console.warn("No row found in markAsSafe for userID", user.id);
        setMark(false);
      }
      return data;
    };

    fetchData();

    const markChannel = supabase
      .channel("markAsSafe-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user",
          filter: `userID=eq.${userid}`,
        },
        (payload) => {
          console.log("Change received!", payload);

          if (payload.new?.markAsSafe !== undefined) {
            setMark(payload.new.markAsSafe !== null ? true : false);
            console.log("Realtime Mark: ", mark);

            if (payload.new.markAsSafe !== null) {
              setStep(2);
            } else {
              setStep(0);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(markChannel);
    };
  }, [user?.id]);

  const updateMarkAsSafe = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching auth user: ", userError);
    }

    const { data, error } = await supabase
      .from("user")
      .update({ markAsSafe: new Date() })
      .eq("userID", user.id)
      .select();

    console.log("Row(s) found:", data, error);

    if (error) {
      console.error("Error in updating mark as safe", error);
    }

    const { data: vul } = await supabase
      .from("vulnerability")
      .select(
        `
          id,
          vulnerabilityList (
              id,
              elderly,
              pregnantInfant,
              physicalPWD,
              psychPWD,
              sensoryPWD,
              medDep,
              locationRiskLevel
          )
        `
      )
      .eq("userID", user.id)
      .single()

    const {data: address} = await supabase
      .from('address')
      .select('streetName')
      .eq("userID", user.id)
      .single()

    const { error: logError } = await supabase
      .from('activityLogs')
      .insert({
        activityType: "markSafe",
        userType: "user",
        log: {
          active: new Date(),
          streetName: address?.streetName ?? "Unknown",
          vulData: {
            elderly: vul?.vulnerabilityList?.elderly ?? "Unknown",
            pregnant: vul?.vulnerabilityList?.pregnantInfant[0] ?? "Unknown",
            infant: vul?.vulnerabilityList?.pregnantInfant[1] ?? "Unknown",
            physicalPWD: !!vul?.vulnerabilityList?.physicalPWD ? true : false,
            psychPWD: !!vul?.vulnerabilityList?.psychPWD ? true : false,
            sensoryPWD: !!vul?.vulnerabilityList?.sensoryPWD ? true : false,
            medDep: !!vul?.vulnerabilityList?.medDep ? true : false,
          }
        },
      })
      if(logError){
        console.error("Error in logging activity in idinfo: ", logError);        
      } 
  };

  const revertMarkAsSafe = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching auth user: ", userError);
      return;
    }

    const { data, error } = await supabase
      .from("user")
      .update({ markAsSafe: null })
      .eq("userID", user.id)
      .select();

    if (error) {
      console.error("Error reverting mark as safe", error);
    } else {
      console.log("Mark as Safe reverted:", data);
      setMark(false);
      setStep(0);
    }
  };

  // ##########################################
  console.log("markAsSafe:", mark, "Step: ", step);

  const handlePress = () => {
    if (step === 1) {
      // when the user confirms
      setMark(true); // or setMark(!mark) if you want toggle behavior
      console.log("Hello", mark);
      updateMarkAsSafe();
    }

    if (step < 2) setStep(step + 1);
  };

  const getButtonLabel = () => {
    if (step !== 1 && mark === false) return "Mark yourself as Safe";
    if (step === 1) return "Yes, I am sure";
    if (mark) return "Marked as Safe";
  };

  const renderText = () => {
    if (step === 0 && mark === false) {
      return (
        <Text style={styles.step0Text} numberOfLines={1}>
          Have you already evacuated?
        </Text>
      );
    }
    if (mark === false && step === 1) {
      return (
        <Text style={[styles.stepText, styles.bold]}>
          Are you sure you have already evacuated?
        </Text>
      );
    }
    return (
      <Text style={styles.step2Text}>
        Good to know! Stay in your evacuation area and wait for further
        announcements.
      </Text>
    );
  };

  const renderImage = () => {
    return (
      <Image
        source={
          mark === false
            ? require("../assets/bell.png")
            : require("../assets/shield.png")
        }
        style={styles.image}
        resizeMode='contain'
      />
    );
  };

  const renderButton = () => {
    const label = getButtonLabel();

    // Step 2 (final): green button with check icon + revert option
    if (mark === true) {
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {/* <View style={styles.finalButton}>
            <Text style={styles.buttonTextCentered}>Marked as Safe</Text>
            <Ionicons
              name='checkmark'
              size={18}
              color='white'
              style={styles.iconRight}
            />
          </View> */}

          <TouchableOpacity onPress={revertMarkAsSafe}>
            <View
              style={[styles.finalButton, { backgroundColor: "#e3637aff" }]}
            >
              <Text style={styles.buttonTextCentered}>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    // Step 1: solid button with gradient only on press
    if (mark === true) {
      return (
        <Pressable
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => {
            setIsPressed(false);
            handlePress();
          }}
          onPress={() => handlePress()}
        >
          {isPressed ? (
            <LinearGradient
              colors={["#409A7A", "#163429"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{label}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.button, { backgroundColor: "#409A7A" }]}>
              <Text style={styles.buttonText}>{label}</Text>
            </View>
          )}
        </Pressable>
      );
    }

    // Step 0: default green gradient button
    return (
      <TouchableOpacity onPress={handlePress}>
        <LinearGradient
          colors={["#409A7A", "#409A7A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#0060FF", "rgba(0, 58, 153, 0)"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.borderWrapper}
    >
      <View style={styles.innerCard}>
        <View style={styles.contentRow}>
          <View style={styles.textArea}>
            {renderText()}
            {renderButton()}
          </View>
          <View style={styles.imageWrapper}>{renderImage()}</View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  borderWrapper: {
    width: "95%",
    padding: 1.5,
    borderRadius: 12,
  },
  innerCard: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,

    // Shadow for Android
    elevation: 2,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  textArea: {
    flex: 1,
    paddingRight: 24, // more space from the image
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: "#000",
  },
  step0Text: {
    fontSize: 14,
    marginBottom: 5,
    color: "#000",
  },
  stepText: {
    fontSize: 16,
    marginBottom: 5, // <-- smaller margin for step 1
    color: "#000",
  },
  step2Text: {
    fontSize: 13, // <-- smaller text size
    lineHeight: 17, // <-- tighter vertical padding
    marginBottom: 5, // <-- smaller spacing below
    color: "#000",
  },
  bold: {
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  buttonTextCentered: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    marginRight: 6,
  },
  finalButton: {
    backgroundColor: "#409A7A",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  iconRight: {
    marginLeft: 4,
  },
  imageWrapper: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default EvacuationStatusCard;
