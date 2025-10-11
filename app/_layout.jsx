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
import {SQLiteProvider} from 'expo-sqlite'
import * as FileSystem from 'expo-file-system/legacy'

const queryClient = new QueryClient();

export default function RootLayout() {
  const theme = Colors.light;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId; // fallback for some builds

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
    // 1️⃣ Check existing permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      // 2️⃣ Ask the user
      finalStatus = await new Promise((resolve) => {
        Alert.alert(
          "Enable Notifications",
          "RESBAC needs notification permission to send you important disaster alerts and emergency updates.",
          [
            {
              text: "Enable",
              onPress: async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                resolve(status);
              },
            },
            {
              text: "Not Now",
              style: "cancel",
              onPress: () => resolve("denied"),
            },
          ]
        );
      });
    }

    // 3️⃣ Only proceed if granted
    if (finalStatus !== "granted") return;

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo push token:", token);

      const { data: { session } } = await supabase.auth.getSession();
      const deviceInfo = { platform: Platform.OS };

      const { error } = await supabase.from("push_tokens").upsert(
        {
          user_id: session?.user?.id || null,
          push_token: token,
          device_info: deviceInfo,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "push_token" }
      );

      if (error) console.error("Error saving push token:", error);
      else console.log(session?.user ? "Token saved for user" : "Token saved for guest");
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
    <SQLiteProvider
    databaseName="userDatabase.db"
    onInit={async(db) => {
      try{            
        await db.execAsync(`PRAGMA journal_mode=WAL;`);

        await db.execAsync(`
        create table if not exists hotlines(
          id integer primary key autoincrement,
          created_at text null,
          emerHName text null,
          emerHNumber text null,
          emerHDescription text null);
          
        create table if not exists rescuers(
          id integer primary key autoincrement,
          created_at text null,
          emerPName text null,
          emerPNumber text null,
          emerPMessLink text null,
          emerPImage text null,
          emerPRole text null,
          emerPBrgy text null);
          

          `)

      const dbPath = `${FileSystem.documentDirectory}SQLite/userDatabase.db`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      console.log(`DB exists in ${dbPath}?`, fileInfo.exists);

      console.log("Creating sqlite...");

      } catch(error){
        console.error("Error in initializing db: ", error);
      }
      
    }}
    options={{useNewConnection: false}}
  >
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
    </SQLiteProvider>
  );
}
