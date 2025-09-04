import React, { useState } from 'react'
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import supabase from '../contexts/supabaseClient'
import Spacer from './Spacer'

const PasswordChangeModal = ({ visible, onClose }) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState({})

  const validatePasswords = () => {
    const newErrors = {}

    // Current password validation
    if (!passwords.current.trim()) {
      newErrors.current = 'Current password is required'
    }

    // New password validation
    if (!passwords.new.trim()) {
      newErrors.new = 'New password is required'
    } else if (passwords.new.length < 6) {
      newErrors.new = 'Password must be at least 6 characters long'
    } else if (passwords.new === passwords.current) {
      newErrors.new = 'New password must be different from current password'
    }

    // Confirm password validation
    if (!passwords.confirm.trim()) {
      newErrors.confirm = 'Please confirm your new password'
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async () => {
    // Validate inputs
    if (!validatePasswords()) {
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting to change password...')

      // verify current password by attempting to sign in
      const currentUser = await supabase.auth.getUser()
      const userEmail = currentUser.data.user?.email

      if (!userEmail) {
        throw new Error('Unable to get current user email')
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: passwords.current
      })

      if (verifyError) {
        setErrors({ current: 'Current password is incorrect' })
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.new
      })

      if (updateError) {
        throw updateError
      }

      console.log('Password changed successfully')
      
      Alert.alert(
        'Success',
        'Your password has been changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setPasswords({ current: '', new: '', confirm: '' })
              setErrors({})
              onClose()
            }
          }
        ]
      )

    } catch (error) {
      console.error('Password change error:', error)
      
      if (error.message.includes('Invalid login credentials')) {
        setErrors({ current: 'Current password is incorrect' })
        return
      } else if (error.message.includes('Password should be at least 6 characters')) {
        setErrors({ new: 'Password must be at least 6 characters long' })
        return
      }
      
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPasswords({ current: '', new: '', confirm: '' })
    setErrors({})
    onClose()
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

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
            <Text style={styles.sectionTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Spacer height={20} />
          
          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                placeholder="Enter current password"
                style={[styles.passwordInput, errors.current && styles.inputError]}
                secureTextEntry={!showPasswords.current}
                value={passwords.current}
                onChangeText={(text) => {
                  setPasswords(p => ({ ...p, current: text }))
                  clearFieldError('current')
                }}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => togglePasswordVisibility('current')}
                style={styles.eyeButton}
              >
                <Feather 
                  name={showPasswords.current ? "eye-off" : "eye"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.current && <Text style={styles.errorText}>{errors.current}</Text>}
          </View>

          <Spacer height={15} />

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                placeholder="Enter new password"
                style={[styles.passwordInput, errors.new && styles.inputError]}
                secureTextEntry={!showPasswords.new}
                value={passwords.new}
                onChangeText={(text) => {
                  setPasswords(p => ({ ...p, new: text }))
                  clearFieldError('new')
                }}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => togglePasswordVisibility('new')}
                style={styles.eyeButton}
              >
                <Feather 
                  name={showPasswords.new ? "eye-off" : "eye"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.new && <Text style={styles.errorText}>{errors.new}</Text>}
          </View>

          <Spacer height={15} />

          {/* Confirm New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                placeholder="Confirm new password"
                style={[styles.passwordInput, errors.confirm && styles.inputError]}
                secureTextEntry={!showPasswords.confirm}
                value={passwords.confirm}
                onChangeText={(text) => {
                  setPasswords(p => ({ ...p, confirm: text }))
                  clearFieldError('confirm')
                }}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => togglePasswordVisibility('confirm')}
                style={styles.eyeButton}
              >
                <Feather 
                  name={showPasswords.confirm ? "eye-off" : "eye"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
          </View>

          <Spacer height={30} />

          {/* Action Buttons */}
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
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>

          <Spacer height={10} />
          
          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementText}>• At least 6 characters long</Text>
            <Text style={styles.requirementText}>• Different from your current password</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default PasswordChangeModal

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
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
  inputContainer: {
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  eyeButton: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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