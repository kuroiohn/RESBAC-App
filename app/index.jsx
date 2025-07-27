import { StyleSheet, Text } from "react-native"
import { Link } from 'expo-router'

// themed components
import ThemedView from '../components/ThemedView'
import ThemedLogo from '../components/ThemedLogo'
import Spacer from "../components/Spacer"
import ThemedText from "../components/ThemedText"
import WelcomeHeader from '../components/WelcomeHeader'
import ThemedButton from "../components/ThemedButton"
import ImageButton from "../components/ImageButton"

const Home = () => {

    return(
        <ThemedView style={styles.container}>
            <WelcomeHeader/>

            <Spacer height = {20} />

            <Spacer />
            <Link href="/login" asChild>
                <ThemedButton>
                <Text style={{ color: '#f2f2f2' }}>Login</Text>
            </ThemedButton>
            </Link>

            <Link href="/register" asChild>
                <ThemedButton>
                <Text style={{ color: '#f2f2f2' }}>Register</Text>
            </ThemedButton>
            </Link>

            <Spacer height={10} />
            <Link href="/emergencyGuide" asChild>
                <ImageButton />
            </Link>
            <Spacer height={10} />

        </ThemedView>
    )
}
export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 33,
    },
    title2: {
        color: '#0060ff',
        marginBottom: 19,
        fontSize: 33,
        fontWeight: 'bold',
    },
    title3: {
        color: '#959595',
    }
})
