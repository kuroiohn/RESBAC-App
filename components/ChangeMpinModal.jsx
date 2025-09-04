import React, { useState } from 'react'
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import supabase from '../contexts/supabaseClient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Spacer from './Spacer'

const ChangeMpinModal = ({ visible, onClose }) => {
  const [currentMpin, setCurrentMpin] = useState('')
  const [newMpin, setNewMpin] = useState('')
  const [confirmMpin, setConfirmMpin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1) // 1: current, 2: new, 3: confirm
  const [isVerifyingCurrent, setIsVerifyingCurrent] = useState(false)

  const resetForm = () => {
    setCurrentMpin('')
    setNewMpin('')
    setConfirmMpin('')
    setErrors({})
    setStep(1)
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  const handleKeyPress = (val) => {
    if (step === 1 && currentMpin.length < 4) {
      setCurrentMpin(prev => prev + val)
      clearFieldError('current')
    } else if (step === 2 && newMpin.length < 4) {
      setNewMpin(prev => prev + val)
      clearFieldError('new')
    } else if (step === 3 && confirmMpin.length < 4) {
      setConfirmMpin(prev => prev + val)
      clearFieldError('confirm')
    }
  }

  const handleDelete = () => {
    if (step === 1) {
      setCurrentMpin(prev => prev.slice(0, -1))
    } else if (step === 2) {
      setNewMpin(prev => prev.slice(0, -1))
    } else if (step === 3) {
      setConfirmMpin(prev => prev.slice(0, -1))
    }
  }

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Verify current MPIN and move to next step
  const verifyCurrentMpin = async () => {
    if (currentMpin.length !== 4) {
      setErrors({ current: 'Please enter your 4-digit MPIN' })
      return
    }

    setIsVerifyingCurrent(true)

    try {
      console.log('Verifying current MPIN...')

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Unable to get current user')
      }

      // Get current MPIN from database
      const { data: userData, error: fetchError } = await supabase
        .from('user')
        .select('mpin')
        .eq('userID', user.id)
        .single()

      if (fetchError) {
        throw new Error('Unable to verify current MPIN')
      }

      console.log('Database MPIN:', userData.mpin, 'Entered MPIN:', currentMpin)

      // Verify current MPIN
      if (userData.mpin !== currentMpin) {
        setErrors({ current: 'Current MPIN is incorrect' })
        return
      }

      // Move to next step
      console.log('Current MPIN verified successfully')
      setErrors({})
      setStep(2)

    } catch (error) {
      console.error('MPIN verification error:', error)
      setErrors({ current: error.message || 'Failed to verify MPIN' })
    } finally {
      setIsVerifyingCurrent(false)
    }
  }

  // Move to confirm step
  const proceedToConfirm = () => {
    if (newMpin.length !== 4) {
      setErrors({ new: 'New MPIN must be 4 digits' })
      return
    }

    if (!/^\d{4}$/.test(newMpin)) {
      setErrors({ new: 'MPIN must contain only numbers' })
      return
    }

    if (newMpin === currentMpin) {
      setErrors({ new: 'New MPIN must be different from current MPIN' })
      return
    }

    setErrors({})
    setStep(3)
  }

  // Final MPIN change
  const handleChangeMpin = async () => {
    if (confirmMpin.length !== 4) {
      setErrors({ confirm: 'Please confirm your new MPIN' })
      return
    }

    if (newMpin !== confirmMpin) {
      setErrors({ confirm: 'MPINs do not match' })
      return
    }

    setIsLoading(true)

    try {
      console.log('Changing MPIN...')

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Unable to get current user')
      }

      console.log('Updating MPIN in database for user:', user.id)

      // Update MPIN in database
      const { error: updateError } = await supabase
        .from('user')
        .update({ mpin: newMpin })
        .eq('userID', user.id)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw updateError
      }

      console.log('Database updated successfully')

      // Update local storage for all stored MPIN sessions
      const keys = await AsyncStorage.getAllKeys()
      const mpinKeys = keys.filter(key => key.startsWith('user_mpin_'))
      
      for (const mpinKey of mpinKeys) {
        const email = mpinKey.replace('user_mpin_', '')
        if (email === user.email) {
          const storedData = await AsyncStorage.getItem(mpinKey)
          if (storedData) {
            const parsed = JSON.parse(storedData)
            parsed.mpin = newMpin
            parsed.lastUpdated = new Date().toISOString()
            await AsyncStorage.setItem(mpinKey, JSON.stringify(parsed))
            console.log('Local storage updated for:', email)
          }
        }
      }

      console.log('MPIN changed successfully')
      
      Alert.alert(
        'Success',
        'Your MPIN has been changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm()
              onClose()
            }
          }
        ]
      )

    } catch (error) {
      console.error('MPIN change error:', error)
      Alert.alert('Error', error.message || 'Failed to change MPIN. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-verify when current MPIN is 4 digits
  React.useEffect(() => {
    if (step === 1 && currentMpin.length === 4 && !isVerifyingCurrent) {
      verifyCurrentMpin()
    }
  }, [currentMpin, step])

  // Auto-proceed when new MPIN is 4 digits
  React.useEffect(() => {
    if (step === 2 && newMpin.length === 4) {
      setTimeout(() => proceedToConfirm(), 500) 
    }
  }, [newMpin, step])

  const getCurrentMpin = () => {
    if (step === 1) return currentMpin
    if (step === 2) return newMpin
    if (step === 3) return confirmMpin
    return ''
  }

  const renderMpinBoxes = (value) => (
    <View style={styles.mpinContainer}>
      {Array.from({ length: 4 }, (_, i) => (
        <View 
          key={i} 
          style={[
            styles.mpinBox,
            value.length > i && styles.mpinBoxFilled
          ]}
        >
          <Text style={styles.mpinText}>
            {value.length > i ? value[i] : ''}
          </Text>
        </View>
      ))}
    </View>
  )

  const renderKeypad = () => (
    <View style={styles.keypad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
        <TouchableOpacity
          key={num}
          style={styles.key}
          onPress={() => handleKeyPress(num.toString())}
          disabled={isLoading || isVerifyingCurrent}
        >
          <Text style={styles.keyText}>{num}</Text>
        </TouchableOpacity>
      ))}
      
      {/* Empty space */}
      <View style={styles.key} />
      
      {/* Zero */}
      <TouchableOpacity
        style={styles.key}
        onPress={() => handleKeyPress('0')}
        disabled={isLoading || isVerifyingCurrent}
      >
        <Text style={styles.keyText}>0</Text>
      </TouchableOpacity>
      
      {/* Delete */}
      <TouchableOpacity
        style={[styles.key, styles.specialKey]}
        onPress={handleDelete}
        disabled={isLoading || isVerifyingCurrent}
      >
        <Feather name="delete" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  )

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Change MPIN</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Spacer height={20} />
          
          {/* Step Instructions */}
          <Text style={styles.instructionText}>
            {step === 1 && 'Enter your current 4-digit MPIN'}
            {step === 2 && 'Enter your new 4-digit MPIN'}
            {step === 3 && 'Confirm your new MPIN'}
          </Text>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotComplete]} />
            <View style={styles.progressLine} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotComplete]} />
            <View style={styles.progressLine} />
            <View style={[styles.progressDot, step >= 3 && styles.progressDotComplete]} />
          </View>

          <Spacer height={30} />

          {/* MPIN Input Boxes */}
          {renderMpinBoxes(getCurrentMpin())}

          {/* Loading indicator for current MPIN verification */}
          {isVerifyingCurrent && (
            <View style={styles.verifyingContainer}>
              <ActivityIndicator color="#007bff" size="small" />
              <Text style={styles.verifyingText}>Verifying MPIN...</Text>
            </View>
          )}

          {/* Error Messages */}
          {errors.current && <Text style={styles.errorText}>{errors.current}</Text>}
          {errors.new && <Text style={styles.errorText}>{errors.new}</Text>}
          {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}

          <Spacer height={30} />

          {/* Keypad */}
          {renderKeypad()}

          <Spacer height={20} />

          {/* Action Buttons - Only show when at confirm step */}
          {step === 3 && confirmMpin.length === 4 && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton, isLoading && styles.disabledButton]} 
                onPress={handleChangeMpin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Change MPIN</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Spacer height={10} />
          
          {/* MPIN Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>MPIN Requirements:</Text>
            <Text style={styles.requirementText}>• Must be exactly 4 digits</Text>
            <Text style={styles.requirementText}>• Must be different from current MPIN</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ChangeMpinModal

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxWidth: 450,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },
  progressDotComplete: {
    backgroundColor: '#007bff',
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  mpinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginVertical: 20,
  },
  mpinBox: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  mpinBoxFilled: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  mpinText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  verifyingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#007bff',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 20,
  },
  key: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  specialKey: {
    backgroundColor: '#007bff',
  },
  keyText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
})