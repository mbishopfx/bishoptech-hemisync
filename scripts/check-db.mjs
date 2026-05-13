import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Checking for tables...');
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    console.error('Error selecting from profiles:', error);
  } else {
    console.log('Successfully connected and queried profiles table.');
  }

  console.log('Checking for agentic_tones table...');
  const { data: tones, error: tonesError } = await supabase.from('agentic_tones').select('id').limit(1);
  if (tonesError) {
    console.error('Error selecting from agentic_tones:', tonesError);
  } else {
    console.log('Successfully found agentic_tones table.');
  }
}

run();
