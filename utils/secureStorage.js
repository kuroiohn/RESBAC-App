import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SESSION_DATA: 'session_data',
  MPIN_HASH: 'mpin_hash',
  LAST_FULL_LOGIN: 'last_full_login',
  USER_EMAIL: 'user_email'
};

const simpleHash = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

const encode = (data) => {
  return btoa(JSON.stringify(data));
};

const decode = (encodedData) => {
  try {
    return JSON.parse(atob(encodedData));
  } catch (error) {
    console.error('Error decoding session data:', error);
    return null;
  }
};

export const SecureStorage = {
  // Store session after successful email/password login
  async storeSession(session, mpin, userEmail) {
    try {
      console.log('Storing session data...');
      
      // Store only the essential session data needed for restoration
      const sessionToStore = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user
      };
      
      const encodedSession = encode(sessionToStore);
      const mpinHash = simpleHash(mpin + userEmail);
      
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.SESSION_DATA, encodedSession],
        [STORAGE_KEYS.MPIN_HASH, mpinHash],
        [STORAGE_KEYS.LAST_FULL_LOGIN, new Date().toISOString()],
        [STORAGE_KEYS.USER_EMAIL, userEmail]
      ]);
      
      console.log('Session stored successfully');
      return true;
    } catch (error) {
      console.error('Error storing session:', error);
      return false;
    }
  },

  // Verify MPIN and return stored session
  async unlockWithMpin(mpin, userEmail) {
    try {
      const storedData = await AsyncStorage.multiGet([
        STORAGE_KEYS.SESSION_DATA,
        STORAGE_KEYS.MPIN_HASH,
        STORAGE_KEYS.LAST_FULL_LOGIN,
        STORAGE_KEYS.USER_EMAIL
      ]);

      const encodedSession = storedData[0][1];
      const storedMpinHash = storedData[1][1];
      const lastFullLogin = storedData[2][1];
      const storedEmail = storedData[3][1];

      if (!encodedSession || !storedMpinHash || !storedEmail) {
        throw new Error('No stored session found. Please log in with email and password.');
      }

      // Verify email matches
      if (storedEmail.toLowerCase() !== userEmail.toLowerCase()) {
        throw new Error('Email does not match stored session.');
      }

      // Verify MPIN
      const inputMpinHash = simpleHash(mpin + userEmail);
      if (inputMpinHash !== storedMpinHash) {
        throw new Error('Invalid MPIN.');
      }

      // Check if session needs refresh (older than 7 days)
      const lastLogin = new Date(lastFullLogin);
      const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLogin > 7) {
        throw new Error('Session expired. Please log in with email and password.');
      }

      // Decode and return session
      const sessionData = decode(encodedSession);
      
      if (!sessionData) {
        throw new Error('Unable to decode session. Please log in again.');
      }

      // Check if the stored session is still valid (not expired)
      if (sessionData.expires_at && sessionData.expires_at < Math.floor(Date.now() / 1000)) {
        throw new Error('Stored session has expired. Please log in with email and password.');
      }

      console.log('Session unlocked with MPIN');
      return sessionData;
    } catch (error) {
      console.error('MPIN unlock error:', error);
      throw error;
    }
  },

  // Check if stored session exists
  async hasStoredSession(userEmail) {
    try {
      const storedEmail = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      const encodedSession = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_DATA);
      
      return storedEmail && 
             encodedSession && 
             storedEmail.toLowerCase() === userEmail.toLowerCase();
    } catch (error) {
      console.error('Error checking stored session:', error);
      return false;
    }
  },

  // Clear stored session (logout)
  async clearSession() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSION_DATA,
        STORAGE_KEYS.MPIN_HASH,
        STORAGE_KEYS.LAST_FULL_LOGIN,
        STORAGE_KEYS.USER_EMAIL
      ]);
      console.log('Session cleared');
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  },

  // Get days since last full login
  async getDaysSinceLastLogin() {
    try {
      const lastFullLogin = await AsyncStorage.getItem(STORAGE_KEYS.LAST_FULL_LOGIN);
      if (!lastFullLogin) return Infinity;
      
      const lastLogin = new Date(lastFullLogin);
      return (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
    } catch (error) {
      return Infinity;
    }
  }
};