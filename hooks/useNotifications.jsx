// mobile/hooks/useNotifications.js
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useEffect } from "react";

export default function useNotifications(onNotification) {
  useEffect(() => {
    // Configure foreground behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Ask permission + get token
    async function register() {
      if (!Constants.isDevice) {
        alert("Push notifications only work on a real device");
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
        alert("Failed to get push token!");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("📱 Expo push token:", token);

      // TODO: send token to Supabase later
      return token;
    }

    register();

    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener(
      onNotification || (() => {})
    );

    return () => subscription.remove();
  }, []);
}
