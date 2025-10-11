import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useEffect } from "react";
import supabase from "../../contexts/supabaseClient";
import { useSQLiteContext } from "expo-sqlite";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const db = useSQLiteContext()

  useEffect(() => {
    const testDB = async() => {
      const tables = await db.execAsync(
        "SELECT name FROM sqlite_master WHERE type='table';"
      );
      console.log("Existing tables:", tables);
    }
    testDB()
  },[db])

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.title,
      }}
    >
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='register' options={{ headerShown: false }} />
      <Stack.Screen name='mpin' options={{ headerShown: false }} />
      <Stack.Screen
        name='mpinSetup'
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back
          animation: "none",
          title: "Setup MPIN",
        }}
      />
      <Stack.Screen name='regisComplete' options={{ headerShown: false }} />
      <Stack.Screen name='uploadID' options={{ headerShown: false }} />
      <Stack.Screen name='vulnerable' options={{ headerShown: false }} />
    </Stack>
  );
}
