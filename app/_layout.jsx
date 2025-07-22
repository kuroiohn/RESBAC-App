import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import { Stack } from 'expo-router'
import { Colors } from "../constants/Colors"
import { StatusBar } from 'expo-status-bar'

const RootLayout = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <>
    <StatusBar value="auto" />
    <Stack screenoptions={{
      headerStyle: { backgroundColor: theme.navBackground },
      headerTintColor: theme.title,
    }}>
      <Stack.Screen name="(auth)" options={{ headerShown: true }}/>
      <Stack.Screen name="(dashboard)" options={{ headerShown: true }}/>
      <Stack.Screen name="index" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="emergencyGuide" options={{ title: 'Emergency Guide' }} />
    </Stack>
    </>
  )
}

export default RootLayout

const styles = StyleSheet.create({})