import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const BackNextButtons = ({ onBack, onNext, backLabel = 'Back', nextLabel = 'Next' }) => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>{backLabel}</Text>
      </TouchableOpacity>

      {/* Spacer between buttons */}
      <View style={{ width: 15 }} />

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextText}>{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default BackNextButtons

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#0060ff',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backText: {
    color: '#0060ff',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#0060ff',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextText: {
    color: '#ffffff',
    fontWeight: '600',
  },
})
