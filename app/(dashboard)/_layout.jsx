import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"
import TopBar from "../../components/TopBar"

const DashboardLayout = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <Tabs 
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
    options={{title: 'Home'}} 
    />

    <Tabs.Screen 
    name="emergencyGuide" 
    options={{title: 'Emergency Guide'}} 
    />

    <Tabs.Screen 
    name="profile" 
    options={{title: 'Profile'}} 
    />

    <Tabs.Screen 
    name="pickUpLocations" 
    options={{title: 'Pickup'}} 
    />

    </Tabs>
  )
}

export default DashboardLayout