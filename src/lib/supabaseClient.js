import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dobroapvyfllagbecnss.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYnJvYXB2eWZsbGFnYmVjbnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NjQzODYsImV4cCI6MjA5NTQ0MDM4Nn0.xj4wJHQrFH2fcFppCO3iAZLd7RO4YrvbH-EsYAu8Q9g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
