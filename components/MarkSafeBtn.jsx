import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function EvacuationStatusCard() {
  const [step, setStep] = useState('initial');

  const handlePress = () => {
    if (step === 'initial') setStep('confirm');
    else if (step === 'confirm') setStep('final');
  };

  const getText = () => {
    if (step === 'initial') return 'Have you already evacuated?';
    if (step === 'confirm') return 'Are you sure you have already evacuated?';
    return 'Good to know! Stay in your evacuation area and wait for further announcements.';
  };

  const getButtonText = () => {
    if (step === 'initial') return 'Mark yourself as Safe';
    if (step === 'confirm') return 'Yes, I am sure';
    return 'Marked as Safe ✓';
  };

  const getImage = () => {
    if (step === 'final') return require('../assets/shield.png');
    return require('../assets/bell.png');
  };

  return (
    <LinearGradient colors={['#0060FF', '#003A99']} style={styles.border}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, step === 'confirm' && styles.bold]}>
            {getText()}
          </Text>

          <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            {step === 'confirm' ? (
              <LinearGradient colors={['green', '#163429']} style={styles.button}>
                <Text style={styles.buttonText}>{getButtonText()}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.buttonStatic}>
                <Text style={styles.buttonText}>{getButtonText()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Image source={getImage()} style={styles.image} resizeMode="contain" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  border: {
    width: '85%',
    borderRadius: 10,
    padding: 2,
  },
  container: {
    backgroundColor: '#FAFAFA',
    height: 95,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 0, // no padding on right
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
    color: '#000',
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonStatic: {
    backgroundColor: '#409A7A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  image: {
    width: 80,
    height: 80,
  },
});
