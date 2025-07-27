import { Image, useColorScheme } from 'react-native'

//images
import DarkLogo from '../assets/RESBACLogo.png'
import LightLogo from '../assets/RESBACLogo.png'

const ThemedLogo = ({ style, ...props }) => {
    const ColorScheme = useColorScheme()

    const logo = ColorScheme === 'dark' ? DarkLogo : LightLogo

    return (
        <Image source={logo} style={[{ width: 122, height: 133 }, style]} {...props} />
    )
    
}

export default ThemedLogo