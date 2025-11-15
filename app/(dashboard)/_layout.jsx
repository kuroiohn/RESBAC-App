import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";
import TopBar from "../../components/TopBar";
import { Ionicons } from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";
import { useRealtime } from "../../contexts/RealtimeProvider";

const DashboardLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const { alertsData } = useRealtime(); // get realtime alerts from context

  // compute active alerts count
  const activeAlertsCount = alertsData
    ? alertsData.filter((a) => a.isActive === true).length
    : 0;

  return (
    <UserOnly>
      <Tabs
        initialRouteName='home' // dito magddirect after login
        screenOptions={{
          header: () => <TopBar />,
          tabBarStyle: {
            backgroundColor: theme.navBackground,
            paddingTop: 10,
            height: 90,
          },
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
        }}
      >
        <Tabs.Screen
          name='home'
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "home" : "home-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />

        {/* Alerts tab */}
        <Tabs.Screen
          name='alerts'
          options={{
            title: "Alerts",
            tabBarBadge: activeAlertsCount > 0 ? activeAlertsCount : undefined, // show badge only if > 0
            tabBarBadgeStyle: {
              backgroundColor: "red",
              position: "absolute",
              right: 0, // move right
              top: 0,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              fontSize: 11,
              textAlign: "center",
              fontWeight: "bold",
            },
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "alert" : "alert-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />

        <Tabs.Screen
          name='emergencyGuide'
          options={{
            title: "Emergency Guide",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "map" : "map-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />

        <Tabs.Screen
          name='profile'
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "person" : "person-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />

        <Tabs.Screen
          name='pickUpLocations'
          options={{
            title: "Locations",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "location" : "location-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
      </Tabs>
    </UserOnly>
  );
};

export default DashboardLayout;
