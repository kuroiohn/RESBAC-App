import { StyleSheet, Text } from "react-native"
import { Link } from 'expo-router'

// themed components
import ThemedView from '../components/ThemedView'
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
                <Text style={{ color: '#f2f2f2', fontWeight: '600' }}>Login</Text>
              </ThemedButton>
            </Link>

            <Link href="/register" asChild>
              <ThemedButton>
                <Text style={{ color: '#f2f2f2', fontWeight: '600' }}>Register</Text>
              </ThemedButton>
            </Link>

            <Spacer height={10} />
            <Link href="/emergencyGuideGuest" asChild>
                <ImageButton />
            </Link>

            <ThemedText style={styles.title3} >
                Click here to go to the Emergency Guide Section
            </ThemedText>

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
        fontSize: 11,
        color: '#959595',
        textAlign: 'left',
        marginRight: 70,
    }
})
