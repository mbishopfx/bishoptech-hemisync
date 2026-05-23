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
const BUCKET_NAME = 'tone-images';
const LOCAL_SERENITY_PATH = '/Users/matthewbishop/Music/Serenity';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Supabase public URL or admin service role key missing in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const TRACKS_METADATA = [
  {
    originalName: 'Deepened Sub-Bass Ambient.wav',
    seededName: 'Abyssal Resonance',
    state: 'delta',
    baseFreq: 110,
    duration: 184,
    description: 'A deep sub-bass ambient restoration field created to induce restorative sleep prep, physical downshift, and deep somatic grounding.'
  },
  {
    originalName: 'Infinite Breath with Cinematic Sub-Bass.wav',
    seededName: 'Infinite Expansion',
    state: 'theta',
    baseFreq: 136.1,
    duration: 184,
    description: 'A cinematic sub-bass threshold designed to open thresholds of meditation, visual imagery processing, and hypnagogic exploration.'
  },
  {
    originalName: 'Infinite Breath.wav',
    seededName: 'Cosmic Breath',
    state: 'alpha',
    baseFreq: 220,
    duration: 194,
    description: 'A spacious respiration guide that paces the breath at a calm, coherent 5.5-second rhythm to induce effortless flow, mental focus, and cognitive ease.'
  },
  {
    originalName: 'Serene Stillness.wav',
    seededName: 'Serene Stillness',
    state: 'theta',
    baseFreq: 176,
    duration: 168,
    description: 'An ethereal meditation wave mapping quiet, tranquil, serene space. Perfect for deep threshold focus, stress release, and mindfulness pacing.'
  }
];

async function seed() {
  console.log('--- Initializing Serenity Database Seeding Sequence ---');

  try {
    // 1. Check if public tone-images bucket exists, create if missing
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
    if (bucketError || !bucket) {
      console.log(`Creating public bucket: ${BUCKET_NAME}`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true
      });
      if (createError) throw createError;
    }

    // 2. Fetch profile ID for matt@bishoptech.dev (fallback to first user if missing)
    console.log('Retrieving collaborator profile details...');
    let userId = null;
    
    // First query auth.users to find matt@bishoptech.dev
    const existingUsers = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });

    // Find the user with email matt@bishoptech.dev
    const targetUser = existingUsers.data?.users?.find(u => u.email === 'matt@bishoptech.dev');

    if (targetUser) {
      userId = targetUser.id;
      console.log(`Target auth user located: matt@bishoptech.dev (UUID: ${userId})`);
      
      // Ensure profile exists in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (!profile) {
        console.log('Profile does not exist. Creating profile...');
        await supabase
          .from('profiles')
          .insert({ id: userId, display_name: 'Matt', username: 'matt' });
      }
    } else {
      // Fallback: Query first profile
      const { data: fallbackProfiles, error: fallbackError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (!fallbackError && fallbackProfiles && fallbackProfiles.length > 0) {
        userId = fallbackProfiles[0].id;
        console.log(`Warning: matt@bishoptech.dev auth user not found. Falling back to profile ID: ${userId}`);
      } else {
        throw new Error('Database profiles table is completely empty. Please run seed-admin first or create a user profile in the dashboard.');
      }
    }

    // 3. Process and upload each serenity track
    for (const track of TRACKS_METADATA) {
      const sourceFile = path.join(LOCAL_SERENITY_PATH, track.originalName);
      if (!fs.existsSync(sourceFile)) {
        console.warn(`Warning: Source track not found at ${sourceFile}. Skipping...`);
        continue;
      }

      console.log(`\nProcessing: "${track.seededName}" (${track.originalName})`);
      const fileBuffer = fs.readFileSync(sourceFile);
      
      // We prepend the user's ID as the root folder so it matches bucket policies perfectly!
      const storagePath = `${userId}/serenity/${track.originalName.replace(/\s+/g, '_')}`;
      
      console.log(`Uploading track buffer to Supabase Storage: ${storagePath}...`);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType: 'audio/wav',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Generate the public read URL
      const wavUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath).data.publicUrl;
      console.log(`Upload successful. Public URL: ${wavUrl}`);

      // Save as metadata row in saved_tones
      console.log('Inserting track metadata into saved_tones table...');
      const { data: savedTone, error: dbError } = await supabase
        .from('saved_tones')
        .upsert(
          {
            user_id: userId,
            name: track.seededName,
            description: track.description,
            target_state: track.state,
            base_freq_hz: track.baseFreq,
            duration_sec: track.duration,
            wav_url: wavUrl,
            mp3_url: wavUrl, // serve wav as mp3 fallback directly since browsers play wav seamlessly
            visibility: 'public',
            frequency_plan: {
              sourceType: 'serenity',
              isSerenity: true,
              originalName: track.originalName,
              baseFreq: track.baseFreq,
              duration: track.duration
            }
          },
          { onConflict: 'user_id,name' } // upsert on unique profile+name combinations
        )
        .select()
        .single();

      if (dbError) {
        // Fallback: If no conflict constraint, just insert it normally
        console.log('Upsert conflict mapping failed, executing standard database insert...');
        const { error: insertError } = await supabase
          .from('saved_tones')
          .insert({
            user_id: userId,
            name: track.seededName,
            description: track.description,
            target_state: track.state,
            base_freq_hz: track.baseFreq,
            duration_sec: track.duration,
            wav_url: wavUrl,
            mp3_url: wavUrl,
            visibility: 'public',
            frequency_plan: {
              sourceType: 'serenity',
              isSerenity: true,
              originalName: track.originalName,
              baseFreq: track.baseFreq,
              duration: track.duration
            }
          });
        if (insertError) throw insertError;
      } else {
        console.log(`Success: Registered "${track.seededName}" in Supabase saved_tones table (ID: ${savedTone.id})`);
      }
    }

    console.log('\n--- Seeding Sequence Successfully Completed! ---');
  } catch (err) {
    console.error('\nSeeding failed with critical error:', err);
    process.exit(1);
  }
}

seed();
