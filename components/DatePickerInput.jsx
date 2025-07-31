import React, { useState } from 'react'
import {
  Modal,
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import ThemedTextInput from './ThemedTextInput'

const DatePickerInput = ({ value, onChange, placeholder = 'Select date', disabled}) => {
  const [showModal, setShowModal] = useState(false)
  const [tempDate, setTempDate] = useState(value || new Date())

  const handleConfirm = () => {
    onChange(tempDate)
    setShowModal(false)
  }

  const handleCancel = () => {
    setShowModal(false)
    setTempDate(value || new Date())
  }

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (selectedDate) {
        onChange(selectedDate)
      }
      setShowModal(false)
    } else {
      setTempDate(selectedDate || tempDate)
    }
  }

  return (
    <>
      <Pressable
          onPress={() => setShowModal(true)}
          disabled={disabled}
          style={[
            styles.inputWrapper,
            disabled && styles.disabledInputWrapper, // Correct conditional style
          ]}
      >
        <ThemedTextInput
          style={styles.input}
          placeholder={placeholder}
          value={value ? value.toLocaleDateString() : ''}
          editable={false}
          pointerEvents="none"
        />
      </Pressable>

      {/* iOS modal with confirm */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <TouchableWithoutFeedback onPress={handleCancel}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                    <View style={styles.datePickerWrapper}>
                        <DateTimePicker
                        mode="date"
                        display="spinner"
                        value={tempDate}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        style={{ width: '100%', height: 220 }} // match the wrapper
                        />
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity onPress={handleCancel} style={styles.btn}>
                        <Text style={styles.cancel}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirm} style={styles.btn}>
                        <Text style={styles.confirm}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>

              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Android inline picker */}
      {Platform.OS === 'android' && showModal && (
        <DateTimePicker
          mode="date"
          value={tempDate}
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  )
}

export default DatePickerInput

const styles = StyleSheet.create({
  inputWrapper: {
    width: '80%',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  padding: 16,
  alignItems: 'center',
  paddingBottom: 32,
},
datePickerWrapper: {
  width: '100%',
  maxWidth: 320,
  height: 220,
  justifyContent: 'center',
  alignItems: 'center',
},
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  cancel: {
    fontSize: 16,
    color: '#888',
  },
  confirm: {
    fontSize: 16,
    color: '#0060ff',
    fontWeight: 'bold',
  },
  disabledInputWrapper: {
    backgroundColor: '#eee',
  },
  disabledInput: {
    color: '#a0a0a0', // A lighter text color
  },
})
