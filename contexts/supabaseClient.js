import { createClient } from '@supabase/supabase-js';
import { API_URL,API_ANONKEY } from '@env'

const supabaseUrl = API_URL
const supabaseAnonKey = API_ANONKEY

const supabase = createClient(supabaseUrl,supabaseAnonKey);
export default supabase