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
import supabase from '../../contexts/supabaseClient'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function uploadID() {
  const [image, setImage] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { userData } = useLocalSearchParams()
  const { register } = useUser()

  // Parse all the collected user data
  const completeUserData = userData ? JSON.parse(userData) : {}
  console.log('Complete user data in uploadID:', completeUserData)

  // Clean location data before saving to database
  // Both manual address and GPS verification are now required
  const getCleanLocationData = (userData) => {
    const streetName = userData.address || 'Unknown Street';
    const defaultCityName = 'Unknown City';
    const defaultBrgyName = 'Unknown Barangay';
    const defaultCoordinates = '0,0';

    // Extract city from manual address as fallback
    const addressParts = userData.address ? userData.address.split(',') : [];
    const parsedCityName = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : defaultCityName;

    // Get GPS data
    const gpsCoordinates = userData.location && userData.location.coordinates 
      ? `${userData.location.coordinates.latitude},${userData.location.coordinates.longitude}`
      : defaultCoordinates;

    const gpsCityName = userData.location?.address?.city || parsedCityName;
    const gpsBrgyName = userData.location?.address?.barangay ||
    userData.location?.address?.subLocality ||
    userData.location?.address?.village ||
    userData.location?.address?.neighborhood ||
    defaultBrgyName;

    const gpsStreetName =
    userData.location?.address?.road ||
    userData.location?.address?.street ||
    userData.location?.address?.route ||
    userData.location?.address?.address_line ||
    defaultStreetName;

    return { 
      streetName: gpsStreetName, 
      cityName: gpsCityName, 
      brgyName: gpsBrgyName, 
      coordinates: gpsCoordinates 
    };
  };

  const pickImage = async () => {
    //FIXME - make it use document picker instead of image picker, or both but make it conditional, but it will still upload on the same bucket
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
      const authResult = await register(cleanEmail, completeUserData.password)
      
      console.log('Account created successfully!')
      console.log('User ID:', authResult.user.id)
      
      // Verify authentication session is properly established
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session check after registration:', session?.user?.id)
      
      if (!session?.user?.id) {
        throw new Error('User not properly authenticated')
      }
      
      console.log('Saving profile data to database...')
      
      // Get clean location data
      const locationData = getCleanLocationData(completeUserData);
      console.log('Clean location data:', locationData);
      
      // Create address record
      const { data: addressData, error: addressError } = await supabase
        .from('address')
        .insert({
          streetName: locationData.streetName,
          brgyName: locationData.brgyName,
          cityName: locationData.cityName,
          geolocationCoords: locationData.coordinates,
          userID: authResult.user.id
        })
        .select('*')
        .single()

      if (addressError) {
        console.error('Error creating address:', addressError)
        throw new Error('Failed to create address record')
      }

      console.log('Address created:', addressData)

      // Create guardian record if guardian exists - with explicit userID
      const guardianData = completeUserData.vulnerability?.hasGuardian === 'yes' && completeUserData.vulnerability?.guardianInfo 
        ? await (async () => {
            const guardian = completeUserData.vulnerability.guardianInfo
            const { data: guardianResult, error: guardianError } = await supabase
              .from('guardian')
              .insert({
                fullName: guardian.name || 'Unknown Guardian',
                relationship: guardian.relationship || 'Unknown',
                guardianContact: guardian.contact || '0000000000',
                guardianAddress: guardian.address || 'Unknown Address',
                userID: authResult.user.id
              })
              .select('*')
              .single()

            if (guardianError) {
              console.error('Error creating guardian:', guardianError)
              return null
            } else {
              console.log('Guardian created:', guardianResult)
              return guardianResult
            }
          })()
        : null

      // Create vulnerability list record - with explicit userID
      const { data: vulnerabilityListData, error: vulListError } = await supabase
        .from('vulnerabilityList')
        .insert({
          elderly: false,
          pregnantInfant: completeUserData.vulnerability?.pregnancy === 'yes' ? ['pregnant'] : [],
          physicalPWD: completeUserData.vulnerability?.physicalDisability || [],
          psychPWD: completeUserData.vulnerability?.psychologicalDisability ? [completeUserData.vulnerability.psychologicalDisability] : [],
          sensoryPWD: completeUserData.vulnerability?.sensoryDisability || [],
          medDep: completeUserData.vulnerability?.healthCondition || [],
          locationRiskLevel: 'Low',
          userID: authResult.user.id
        })
        .select('*')
        .single()

      if (vulListError) {
        console.error('Error creating vulnerability list:', vulListError)
        throw new Error('Failed to create vulnerability list')
      }

      console.log('Vulnerability list created:', vulnerabilityListData)

      console.log(authResult.user.id);
      // Create vulnerability record - with explicit userID
      const {data:{user},error} = await supabase.auth.getUser()
      const { data: vulnerabilityData, error: vulError } = await supabase
        .from('vulnerability')
        .insert({
          vulListID: vulnerabilityListData.id,
          userID: user.id
        })
        .select('*')
        .single()

      if (vulError) {
        console.error('Error creating vulnerability:', vulError)
        throw new Error('Failed to create vulnerability record')
      }

      //TODO - add verification table insert somewhere here
      const { data: verifData, error: verifError } = await supabase
        .from('verification')
        .insert({
          isVerified: false, // will turn true after admin
          proofFile: image,
          userID: authResult.user.id
        })
        .select('*')
        .single()

      if (verifError) {
        console.error('Error creating verification:', verifError)
        throw new Error('Failed to create verification record')
      }

      console.log('Verification created:', verifData)

      //NOTE - not used
      const nameParts = (completeUserData.name || '').split(' ')
      const tempMpin = `temp${Date.now().toString().slice(-4)}`
      
      //NOTE - apparently redundant since verifData already contains the inserted row
      // //TODO - fetch the verification table and update the insert of the user
      // const { data:fetchVerifData, error: fetchVerifError } = await supabase
      // .from('verification')
      // .select('*')
      // .eq("userID",authResult.user.id)
      // .single()

      // if(fetchVerifError){
      //   console.error("Error in fetching verification id for user table:", fetchVerifError);
      // }

      const { error: userError } = await supabase
        .from('user')
        .insert({
          userID: authResult.user.id,
          firstName: completeUserData.firstName || 'Unknown',
          middleName: completeUserData.middleName || '',
          surname: completeUserData.surname || 'User',
          dateOfBirth: completeUserData.dob || new Date('2025-01-01'),
          age: completeUserData.age || 0, 
          mpin: Math.floor(1000 + Math.random() * 9000).toString(),
          userNumber: completeUserData.contactNumber || '0000000000',
          householdSize: parseInt(completeUserData.vulnerability?.householdCount) || 1,
          addressID: addressData.id,
          hasGuardian: completeUserData.vulnerability?.hasGuardian === 'yes',
          guardianID: guardianData?.id || null,
          vulnerabilityID: vulnerabilityData.id,
          verificationID: verifData.id
        })
        .select('*')

      if (userError) {
        console.error('Error creating user:', userError)
        throw new Error('Failed to create user record: ' + userError.message)
      }

      console.log('User profile saved successfully!')
      
      // Add the uploaded ID to the complete user data
      const finalUserData = {
        ...completeUserData,
        uploadedID: image,
        step: 'complete',
        completedAt: new Date().toISOString(),
      }

      const { data: loginData, error:loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: completeUserData.password
      }) 
      if(loginError) {
        console.error("Error in login after registration: ",loginError);
      }
      const currentUser = loginData.user
      
      console.log("Current user: ",currentUser);      
      console.log('Final user data:', finalUserData)
      
      // Navigate to MPIN setup instead of dashboard
      console.log('Redirecting to MPIN setup...')
      console.log('Final user data being passed:', JSON.stringify(finalUserData).substring(0, 200) + '...')
      
      router.replace({
        pathname: '/mpinSetup',
        params: {
          userData: JSON.stringify({...finalUserData,
            userID:currentUser.id,
          })
        }
      })
      
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
            Almost done for: {completeUserData.name}
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
          nextText={isCreating ? "Creating Account..." : "Next: Set MPIN"}
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