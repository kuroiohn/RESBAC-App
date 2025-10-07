import { StyleSheet, Text, useColorScheme, View, Platform, Alert } from "react-native";
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
import supabase from "../contexts/supabaseClient";

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

    // register for push notifications and save token to Supabase
    const registerForPushNotifications = async () => {
      // Device check temporarily disabled - Constants.isDevice returns false in some dev clients
      // if (!Constants.isDevice) {
      //   console.log("Push notifications require a physical device");
      //   return;
      // }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        // Show allow notifications
        const requestPermission = () =>
          new Promise((resolve) => {
            Alert.alert(
              "Enable Notifications",
              "RESBAC needs notification permission to send you important disaster alerts and emergency updates.",
              [
                {
                  text: "Enable",
                  onPress: async () => {
                    const { status } =
                      await Notifications.requestPermissionsAsync();
                    resolve(status);
                  },
                },
                {
                  text: "Not Now",
                  style: "cancel",
                  onPress: () => {
                    console.log("Push notification permission denied by user");
                    resolve("denied");
                  },
                },
              ]
            );
          });

        finalStatus = await requestPermission();

        if (finalStatus !== "granted") {
          if (finalStatus === "denied") {
            Alert.alert(
              "Notifications Disabled",
              "You won't receive emergency alerts. You can enable notifications later in your device settings.",
              [{ text: "OK" }]
            );
          }
          return;
        }
      }

      try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("Expo push token:", token);

        // Get current user session (can be null for guests)
        const { data: { session } } = await supabase.auth.getSession();

        const deviceInfo = {
          platform: Platform.OS,
        };

        // Save token for both logged-in users and guests
        const { error } = await supabase
          .from("push_tokens")
          .upsert(
            {
              user_id: session?.user?.id || null,
              push_token: token,
              device_info: deviceInfo,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "push_token" }
          );

        if (error) {
          console.error("Error saving push token:", error);
        } else {
          console.log(
            session?.user
              ? "Push token saved for logged-in user"
              : "Push token saved for guest user"
          );
        }
      } catch (error) {
        console.error("Error registering for push notifications:", error);
      }
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
