import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import { Stack } from 'expo-router'
import { Colors } from "../constants/Colors"
import { StatusBar } from 'expo-status-bar'
import { UserProvider } from '../contexts/UserContext'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <UserProvider>
      <StatusBar value="auto" />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.title,
      }}>
        <Stack.Screen name="(auth)" options={{ headerShown: true }}/>
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }}/>
        <Stack.Screen name="index" options={{ title: 'Onboarding' }} />
        <Stack.Screen name="emergencyGuide" options={{ title: 'Emergency Guide' }} />
        <Stack.Screen name="emergencyGuideGuest" options={{ headerShown: false }} />
        
      </Stack>
    </UserProvider>
  )
}