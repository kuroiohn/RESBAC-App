import { createClient } from '@supabase/supabase-js';
import { API_URL,API_ANONKEY } from '@env'
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = API_URL
const supabaseAnonKey = API_ANONKEY

const supabase = createClient(supabaseUrl,supabaseAnonKey, {
    auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
export default supabase