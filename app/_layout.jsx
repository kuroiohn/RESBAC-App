import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Stack } from "expo-router";
import { Colors } from "../constants/Colors";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "../contexts/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RealtimeProvider } from "../contexts/RealtimeProvider";
import * as NavigationBar from "expo-navigation-bar";

const queryClient = new QueryClient();

export default function RootLayout() {
  // const colorScheme = useColorScheme();
  const theme = Colors.light;

  useEffect(() => {
    const setNavBar = async () => {
      try {
        // Hide navigation bar
        await NavigationBar.setVisibilityAsync("hidden");
        // Keep immersive sticky behavior
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      } catch (e) {
        console.warn("NavigationBar not supported in Expo Go:", e);
      }
    };

    setNavBar();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <UserProvider>
          <StatusBar style='dark' />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.navBackground },
              headerTintColor: theme.title,
            }}
          >
            <Stack.Screen
              name='index'
              options={{ headerShown: false, title: "Onboarding" }}
            />
            <Stack.Screen name='(auth)' options={{ headerShown: false }} />
            <Stack.Screen name='(dashboard)' options={{ headerShown: false }} />
            {/* <Stack.Screen name="emergencyGuide" options={{ title: 'Emergency Guide' }} /> */}
            <Stack.Screen
              name='emergencyGuideGuest'
              options={{ headerShown: false }}
            />
          </Stack>
        </UserProvider>
      </RealtimeProvider>
    </QueryClientProvider>
  );
}
