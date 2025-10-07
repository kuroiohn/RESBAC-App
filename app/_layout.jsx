import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Stack } from "expo-router";
import { Colors } from "../constants/Colors";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "../contexts/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RealtimeProvider } from "../contexts/RealtimeProvider";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const queryClient = new QueryClient();

export default function RootLayout() {
  const theme = Colors.light;

  useEffect(() => {
    // hide nav bar on Android
    const setNavBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      } catch (e) {
        console.warn("NavigationBar not supported in Expo Go:", e);
      }
    };
    setNavBar();

    // register for push notifications
    const registerForPushNotifications = async () => {
      if (!Constants.isDevice) {
        console.log("Push notifications require a physical device");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("📱 Expo push token:", token);

      // 🚧 later: save this token to Supabase (per user)
    };

    registerForPushNotifications();

    // how notifications behave while app is foregrounded
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
        <UserProvider>
      <RealtimeProvider>
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
            <Stack.Screen
              name='emergencyGuideGuest'
              options={{ headerShown: false }}
            />
          </Stack>
      </RealtimeProvider>
        </UserProvider>
    </QueryClientProvider>
  );
}
