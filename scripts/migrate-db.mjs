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
  console.log('Attempting to create table agentic_tones via RPC...');
  
  // We'll try to use a generic exec_sql if it exists, or just check the connection
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.agentic_tones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT now(),
        name TEXT NOT NULL,
        state TEXT NOT NULL,
        base_freq_hz FLOAT NOT NULL,
        target_hz FLOAT NOT NULL,
        noise_type TEXT,
        modes JSONB NOT NULL,
        duration_sec INTEGER NOT NULL DEFAULT 180,
        description TEXT,
        summary TEXT,
        wav_url TEXT,
        webm_url TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      CREATE INDEX IF NOT EXISTS idx_agentic_tones_state ON public.agentic_tones(state);
    `
  });

  if (error) {
    console.error('Migration failed:', error);
    if (error.code === 'PGRST202') {
      console.log('NOTE: The exec_sql RPC does not exist. Please run the SQL in the Supabase Dashboard:');
      console.log(`
CREATE TABLE IF NOT EXISTS public.agentic_tones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  base_freq_hz FLOAT NOT NULL,
  target_hz FLOAT NOT NULL,
  noise_type TEXT,
  modes JSONB NOT NULL,
  duration_sec INTEGER NOT NULL DEFAULT 180,
  description TEXT,
  summary TEXT,
  wav_url TEXT,
  webm_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_agentic_tones_state ON public.agentic_tones(state);
      `);
    }
  } else {
    console.log('Migration successful!');
  }
}

run();
