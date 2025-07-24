import { StyleSheet, Text } from "react-native"
import { Link } from 'expo-router'

// themed components
import ThemedView from '../components/ThemedView'
import ThemedLogo from '../components/ThemedLogo'
import Spacer from "../components/Spacer"
import ThemedText from "../components/ThemedText"

const Home = () => {

    return(
        <ThemedView style={styles.container}>

            <ThemedLogo />
            <Spacer height = {20} />

            <ThemedText style={styles.title}>Welcome to</ThemedText>
            <ThemedText style={styles.title2}>RESBAC</ThemedText>
            <Text style={styles.title3}>Your safety is our priority</Text>

            <Spacer />
            <Link href="/login">
                <ThemedText>Login</ThemedText>
            </Link>

            <Spacer />
            <Link href="/emergencyGuide">
                <ThemedText>Emergency Guide</ThemedText>
            </Link>

            <Spacer />
            <Link href="/home">
                <ThemedText>Go to Dashboard</ThemedText>
            </Link>

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
