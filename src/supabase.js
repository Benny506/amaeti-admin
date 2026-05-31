import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://dobroapvyfllagbecnss.supabase.co';
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYnJvYXB2eWZsbGFnYmVjbnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NjQzODYsImV4cCI6MjA5NTQ0MDM4Nn0.xj4wJHQrFH2fcFppCO3iAZLd7RO4YrvbH-EsYAu8Q9g"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_STORAGE_URL = SUPABASE_URL + '/storage/v1/object/public/';
