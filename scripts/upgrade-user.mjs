import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadLocalEnv() {
  const envFiles = ['.env.local', '.env.production.local', '.env.development.local', '.env'];
  for (const fileName of envFiles) {
    const filePath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;

    const text = fs.readFileSync(filePath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const index = trimmed.indexOf('=');
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] == null) {
        process.env[key] = value;
      }
    }
  }
}

// Load envs
loadLocalEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Supabase public URL or admin service role key missing in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    console.log('Upgrading matt@bishoptech.dev to Paid Subscription (founder tier)...');
    
    // 1. Find user in auth.users
    const existingUsers = await supabase.auth.admin.listUsers();
    const targetUser = existingUsers.data?.users?.find(u => u.email === 'matt@bishoptech.dev');
    
    if (!targetUser) {
      console.error('Error: User matt@bishoptech.dev not found in auth.users');
      process.exit(1);
    }
    
    const userId = targetUser.id;
    console.log(`Located User ID: ${userId}`);
    
    // 2. Update profile subscription_tier
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_tier: 'founder' })
      .eq('id', userId)
      .select()
      .single();
      
    if (updateError) {
      throw updateError;
    }
    
    console.log('Success! Upgraded profile details:', updatedProfile);
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

run();
