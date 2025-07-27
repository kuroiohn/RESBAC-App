import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'
import ThemedLogo from './ThemedLogo'
import Spacer from './Spacer'
import ThemedText from './ThemedText'

const WelcomeHeader = () => {
    const logoAnim = useRef(new Animated.Value(0)).current
    const textAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.sequence([
            Animated.timing(logoAnim, {
                toValue: 1,
                duration: 333,
                useNativeDriver: true,
            }),
            Animated.timing(textAnim, {
                toValue: 1,
                duration: 444,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const logoTranslateY = logoAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0],
    })

    return (
        <>
            <Animated.View style={{ opacity: logoAnim, transform: [{ translateY: logoTranslateY }] }}>
                <ThemedLogo />
            </Animated.View>

            <Spacer height={20} />

            <Animated.View style={{ opacity: textAnim }}>
                <ThemedText style={styles.title}>Welcome to</ThemedText>
                <ThemedText style={styles.title2}>RESBAC</ThemedText>
                <Text style={styles.title3}>Your safety is our priority</Text>
            </Animated.View>
        </>
    )
}

export default WelcomeHeader

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        textAlign: 'center',
    },
    title2: {
        color: '#0060ff',
        marginBottom: 0,
        fontSize: 44,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    title3: {
        color: '#959595',
        textAlign: 'center',
    }
})