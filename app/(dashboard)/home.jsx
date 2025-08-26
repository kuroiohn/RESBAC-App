import { ScrollView, Animated, TouchableOpacity, Text, StyleSheet } from "react-native"
import React, { useState, useRef } from "react"

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import CallButton from '../../components/CallBtn'
import MarkSafeBtn from '../../components/MarkSafeBtn'
import AlertCard from '../../components/AlertCard'
import EvacuationCenterCard from '../../components/EvacuationCenterCard'

const Home = () => {
  const [animating, setAnimating] = useState(false)
  const [callRequested, setCallRequested] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  // pang animate
  const handleAnimationStart = () => {
    setAnimating(true)
    setCallRequested(false)
    fadeAnim.setValue(0) // reset fade each time
  }

  // pang animate
  const handleAnimationFinish = () => {
    setAnimating(false)
    setCallRequested(true)

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  const handleCancel = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setAnimating(false)
      setCallRequested(false)
    })
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText title={true} style={styles.heading}>
          {callRequested ? "Help is on the way" : "Request Rescue?"}
        </ThemedText>

        {/* Initial state */}
        {!animating && !callRequested && (
          <>
            <ThemedText>Press the button below and help will</ThemedText>
            <ThemedText>reach you shortly.</ThemedText>

            <Spacer/>
            <CallButton
              onAnimationStart={handleAnimationStart}
              onAnimationFinish={handleAnimationFinish}
            />
            <Spacer/>

            <MarkSafeBtn />

            {/* Alerts + Guide only in initial state */}
            <ThemedText style={styles.textLeft}>Alerts</ThemedText>
            <AlertCard />

            {/* Evacuation Centers horizontal scroll */}
            <ThemedText style={styles.textLeft}>Evacuation Centers</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              <EvacuationCenterCard style={{ marginRight: 16 }} />
              <EvacuationCenterCard style={{ marginRight: 16 }} />
              <EvacuationCenterCard />
            </ScrollView>

            <ThemedText style={styles.textLeft}>Pickup Locations</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              <EvacuationCenterCard style={{ marginRight: 16 }} />
              <EvacuationCenterCard style={{ marginRight: 16 }} />
              <EvacuationCenterCard />
            </ScrollView>
          </>
        )}

        {/* Animating state */}
        {animating && !callRequested && (
          <>
            <ThemedText style={{ marginTop: 20, fontWeight: "bold" }}>
              Calling for help...
            </ThemedText>
            <Spacer/>
            <CallButton
              onAnimationStart={handleAnimationStart}
              onAnimationFinish={handleAnimationFinish}
            />
          </>
        )}

        {/* After request */}
        {callRequested && !animating && (
          <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
            <ThemedText style={{ marginVertical: 10, textAlign: "center" }}>
              Please stand by, or look for a safe {"\n"}
              place to stay until rescue has arrived.
            </ThemedText>
            <Spacer/>
            <CallButton 
              onAnimationStart={handleAnimationStart} 
              onAnimationFinish={handleAnimationFinish} 
            /> 
            <Spacer/>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            </TouchableOpacity>
            <Spacer/>
          </Animated.View>
        )}
        {!animating && callRequested && (
          <MarkSafeBtn />
        )}
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
    flexGrow: 1,
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
    marginLeft: 19,
    fontSize: 19,
    marginTop: 10,
    marginBottom: 5,
  },
  cancelBtn: {
    backgroundColor: "#0060ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: 200,
    height: 40,
  },
  cancelBtnText: {
    color: "white",
    fontWeight: "bold"
  },
})
