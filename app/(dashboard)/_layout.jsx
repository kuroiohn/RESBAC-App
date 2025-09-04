import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"
import TopBar from "../../components/TopBar"
import { Ionicons } from "@expo/vector-icons"
import UserOnly from "../../components/auth/UserOnly"

const DashboardLayout = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <UserOnly>
      <Tabs 
          initialRouteName="home" // dito magddirect after login
          screenOptions = {{
              header: () => <TopBar />, 
              tabBarStyle: {
              backgroundColor: theme.navBackground,
              paddingTop: 10,
              height: 90
          },
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor
      }}
      >

      <Tabs.Screen 
      name="home" 
      options={{title: 'Home', tabBarIcon: ({ focused }) => (
        <Ionicons
          size={24}
          name={focused ? 'home' : 'home-outline'}
          color={focused ? theme.iconColorFocused : theme.iconColor}
        />
      )}} 
      />

      <Tabs.Screen 
      name="emergencyGuide" 
      options={{title: 'Emergency Guide', tabBarIcon: ({ focused }) => (
        <Ionicons
          size={24}
          name={focused ? 'map' : 'map-outline'}
          color={focused ? theme.iconColorFocused : theme.iconColor}
        />
      )}} 
      />

      <Tabs.Screen 
      name="profile" 
      options={{title: 'Profile', tabBarIcon: ({ focused }) => (
        <Ionicons
          size={24}
          name={focused ? 'person' : 'person-outline'}
          color={focused ? theme.iconColorFocused : theme.iconColor}
        />
      )}} 
      />

      <Tabs.Screen 
      name="pickUpLocations" 
      options={{title: 'Locations', tabBarIcon: ({ focused }) => (
        <Ionicons
          size={24}
          name={focused ? 'location' : 'location-outline'}
          color={focused ? theme.iconColorFocused : theme.iconColor}
        />
      )}} 
      />

      </Tabs>
    </UserOnly>
  )
}

export default DashboardLayout