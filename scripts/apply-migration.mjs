import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Checking if agentic_tones table exists via PostgREST introspection...');
  const { data, error } = await supabase.from('agentic_tones').select('id').limit(1);
  
  if (error && error.code === 'PGRST205') {
    console.log('Table does not exist. This script cannot apply DDL directly via PostgREST.');
    console.log('Attempting to use a known existing table to verify connection...');
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('id').limit(1);
    if (profileError) {
        console.error('Even profiles table is missing or unreachable:', profileError);
    } else {
        console.log('Profiles table found. Connection is valid.');
    }
  } else if (!error) {
    console.log('Table agentic_tones already exists.');
    process.exit(0);
  } else {
    console.error('Unexpected error checking table:', error);
  }
  
  console.log('Since direct DDL is restricted, please ensure the CAMTHEMANBLAMEIT1! password is used for manual DB access if MCP fails.');
}

run();
