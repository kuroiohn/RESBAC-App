import { Image, useColorScheme } from 'react-native'

//images
import DarkLogo from '../assets/RESBACLogo.png'
import LightLogo from '../assets/RESBACLogo.png'

const ThemedLogo = ({ ...props }) => {
    const ColorScheme = useColorScheme()

    const logo = ColorScheme === 'dark' ? DarkLogo : LightLogo

    return (
        <Image source={logo} {...props} />
    )
    
}

export default ThemedLogo