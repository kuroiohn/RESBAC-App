import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import {Link} from 'expo-router'

import { Colors } from "../constants/Colors"
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'

const EmergencyGuide = () => {

  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText>Emergency Guide Page</ThemedText>

      <Link href="/" style={styles.link}>
        <ThemedText>
          Back
        </ThemedText>
      </Link>

    </ThemedView>
  )
}

export default EmergencyGuide

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fffff',
    },
    title: {
        fontSize: 33,
    },
    title2: {
        color: '#0060ff',
        marginBottom: 19,
        fontSize: 33,
        fontWeight: 'bold',
    },
    title3: {
        color: '#959595',
    },
    img: {
        marginVertical: 0,
    }
})