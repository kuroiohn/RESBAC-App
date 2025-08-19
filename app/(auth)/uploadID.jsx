import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useRouter, useLocalSearchParams } from 'expo-router'
import ThemedView from '../../components/ThemedView'
import ThemedLogo from '../../components/ThemedLogo'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import BackNextButtons from '../../components/buttons/BackNextButtons'
import { useUser } from '../../hooks/useUser'

export default function uploadID() {
  const [image, setImage] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { userData } = useLocalSearchParams()
  const { register } = useUser()

  // Parse all the collected user data
  const completeUserData = userData ? JSON.parse(userData) : {}
  console.log('Complete user data in uploadID:', completeUserData)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    })

    if (!result.canceled) {
      const file = result.assets[0]
      const isValid = validateFile(file)

      if (isValid) {
        setImage(file.uri)
      }
    }
  }

  const validateFile = (file) => {
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'heic', 'heif']
    const maxSizeMB = 5
    const sizeMB = file.fileSize ? file.fileSize / 1024 / 1024 : 0

    const uri = file.uri || ''
    const ext = uri.split('.').pop().toLowerCase()

    if (!allowedExtensions.includes(ext)) {
      Alert.alert('Invalid File', 'Only JPEG, PNG, and HEIC images are allowed.')
      return false
    }

    if (sizeMB > maxSizeMB) {
      Alert.alert('File Too Large', 'Maximum file size is 5MB.')
      return false
    }

    return true
  }

  const handleNext = async () => {
    if (!image) {
      Alert.alert('Missing ID', 'Please upload a valid ID before proceeding.')
      return
    }

    if (!completeUserData.email || !completeUserData.password) {
      Alert.alert('Error', 'Missing registration data. Please start over.')
      return
    }

    setIsCreating(true)

    try {
      console.log('Creating Supabase account...')
      
      // Create the Supabase account with email/password
      const cleanEmail = completeUserData.email.trim()
      await register(cleanEmail, completeUserData.password)
      
      console.log('Account created successfully!')
      
      // Add the uploaded ID to the complete user data
      const finalUserData = {
        ...completeUserData,
        uploadedID: image,
        step: 'complete',
        completedAt: new Date().toISOString()
      }
      
      console.log('Final user data:', finalUserData)
      
      // TODO: Save complete profile to your database here
      // You can add database saving logic here if needed
      
      // Skip completion screen and go to dashboard
      console.log('Registration complete! Redirecting to dashboard...')
      router.replace('/dashboard')
      
    } catch (error) {
      console.error('Registration error:', error)
      Alert.alert(
        'Registration Failed', 
        error.message || 'Failed to create account. Please try again.'
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container} safe={true}>
        <Spacer height={44}/>
        <ThemedLogo/>

        <ThemedText style={{ textAlign: 'center', fontSize: 27, fontWeight: '600' }}>
          Verification of {"\n"} Account
        </ThemedText>
        <Spacer/>

        {/* DEBUG: Show received data */}
        {completeUserData.name && (
          <Text style={{textAlign: 'center', color: 'green', marginBottom: 10}}>
            Final step for: {completeUserData.name}
          </Text>
        )}

        <View style={{ width: '100%', alignItems: 'flex-start' }}>
          <Text style={[styles.title, { textAlign: 'left', marginLeft: 15 }]}>
            Upload a photo of <Text style={styles.bold}>Valid ID</Text>
          </Text>
        </View>

        <View style={styles.uploadBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <Text style={styles.placeholderText}>No image selected</Text>
          )}
        </View>

        <TouchableOpacity style={styles.browseButton} onPress={pickImage}>
          <Text style={styles.browseText}>Browse Files</Text>
        </TouchableOpacity>

        <Text style={styles.supportedText}>
          Files supported: JPEG, PNG, HEIC{'\n'}
          Maximum Size: 5MB
        </Text>

        <View style={{ width: '100%', alignItems: 'flex-start' }}>
          <Text style={styles.idListHeader}>These can be any of the following:</Text>
          <Text style={styles.idList}>
            - Philippine National ID (PhilID){'\n'}
            - Passport{'\n'}
            - Driver's License{'\n'}
            - Social Security System (SSS){'\n'}
            - Unified Multi-Purpose ID (UMID){'\n'}
            - PhilHealth ID{'\n'}
            - Voter's ID{'\n'}
            - Professional Regulation Commission (PRC) ID{'\n'}
            - Postal ID
          </Text>
        </View>

        <BackNextButtons
          onBack={() => router.back()} 
          onNext={handleNext}
          nextDisabled={isCreating}
          nextText={isCreating ? "Creating Account..." : "Complete Registration"}
        />
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  uploadBox: {
    width: 340,
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 11,
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#888',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 11,
    resizeMode: 'cover',
  },
  browseButton: {
    borderWidth: 1.5,
    borderColor: '#0060ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  browseText: {
    color: '#0060ff',
    fontWeight: '600',
    fontSize: 16,
  },
  supportedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  idListHeader: {
    fontWeight: '600',
    marginBottom: 6,
  },
  idList: {
    fontSize: 14,
    color: '#444',
  },
})