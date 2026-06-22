const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying feed_posts with joins...');
  const { data, error } = await supabase
    .from('feed_posts')
    .select('id,user_id,tone_id,post_type,body,visibility,like_count,comment_count,created_at,updated_at,profiles!user_id(id,username,display_name,avatar_url),saved_tones(id,name,description,cover_image_url,target_state,duration_sec,base_freq_hz,delta_path,wav_url,mp3_url,visibility,like_count,user_id)')
    .eq('visibility', 'public')
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success, posts fetched:', data.length);
    console.log(data);
  }
}

run();
