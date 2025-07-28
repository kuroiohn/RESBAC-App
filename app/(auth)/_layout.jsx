// for layout ng files under auth folder (login, mpin, register, etc.)

import { Stack } from "expo-router"
import { StatusBar } from "react-native"
import { useUser } from "../../hooks/useUser"
import GuestOnly from "../../components/auth/GuestOnly"

export default function AuthLayout() {

  const { user } = useUser()
  console.log(user)
  
  return (
    <GuestOnly> {/* comes from GuestOnly component */}
      <StatusBar style="auto" />
      <Stack 
        screenOptions={{ headerShown: false, animation: "none" }} 
      />
    </GuestOnly>
  )
}