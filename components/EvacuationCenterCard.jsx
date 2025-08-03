import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const EvacuationCenterCard = () => {
  return (
    <LinearGradient
      colors={['#0060FF', 'rgba(0, 58, 153, 0)']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.borderWrapper}
    >
      <View style={styles.innerCard}>
        {/* Image */}
        <Image
          source={require('../assets/evac-center-card.png')}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Text and icon row */}
        <View style={styles.contentRow}>
          <View style={styles.textSection}>
            <Text style={styles.header}>Evacuation Centers</Text>
            <Text style={styles.subtext}>
              Available evacuation centers {"\n"}around your barangay.
            </Text>
          </View>

          <Ionicons
            name="map-outline"
            size={44}
            color="#0060FF"
            style={styles.icon}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default EvacuationCenterCard;

const styles = StyleSheet.create({
  borderWrapper: {
    width: '88%',
    padding: 2,
    borderRadius: 12,
  },
  innerCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingBottom: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
    paddingRight: 12,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: '#919191',
    lineHeight: 18,
  },
  icon: {
    marginTop: 12,
    marginRight: 8,
  },
});
