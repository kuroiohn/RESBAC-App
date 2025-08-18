import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubjzyfxedngrsewkaccy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVianp5ZnhlZG5ncnNld2thY2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjQyMDAsImV4cCI6MjA3MDE0MDIwMH0.L7TMJniq7Qs7vygmCpxQRp5NDMh5x7a3a1wPK_LHyOs'

export const supabase = createClient(supabaseUrl, supabaseKey)