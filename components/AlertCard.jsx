import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AlertCard = ({ alertLevel = 1 }) => {
  const [time, setTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const getWaterLevel = () => {
    switch (alertLevel) {
      case 1:
        return 15;
      case 2:
        return 17;
      case 3:
        return 18;
      default:
        return '--';
    }
  };

  const waterLevel = getWaterLevel();

  return (
    <LinearGradient
      colors={['#0060FF', 'rgba(0, 58, 153, 0)']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.borderWrapper}
    >
      <View style={styles.innerCard}>
        {/* Top right date + icon */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Ionicons name="calendar-outline" size={18} color="#333" style={{ marginLeft: 6 }} />
        </View>

        {/* Image + Info Row */}
        <View style={styles.topRow}>
          <Image
            source={require('../assets/storm-cloud.png')} // replace with your image
            style={styles.image}
          />
          <View style={styles.statusColumn}>
            <Text style={styles.alertLevel}>Alert Level {alertLevel}</Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
            <Text style={styles.meterText}>{waterLevel} meters</Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.message}>
          Water level has reached {waterLevel} meters. Please stay alert and prepare for possible
          evacuation. Monitor updates and secure important belongings.
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  borderWrapper: {
    width: '88%',
    padding: 2,
    borderRadius: 12,
  },
  innerCard: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 10,
    position: 'relative',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,

    // Shadow for Android
    elevation: 2,
  },

  dateRow: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#333',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    paddingTop: -10,
  },
  image: {
    width: 76,
    height: 67,
    marginRight: 16,
    borderRadius: 10,
  },
  statusColumn: {
    justifyContent: 'space-between',
  },
  alertLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#161616',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  meterText: {
    fontSize: 14,
    color: '#00796B',
    marginTop: 4,
  },
  message: {
    marginTop: 10,
    fontSize: 13,
    color: '#6b6b6b',
    lineHeight: 17,
  },
});

export default AlertCard;
