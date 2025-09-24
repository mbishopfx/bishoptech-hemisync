import { createClient } from '@supabase/supabase-js';

const DEFAULT_EMAIL = 'matt@bishoptech.dev';
const DEFAULT_PASSWORD = 'Blameit1!';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL || DEFAULT_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const existing = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1,
    email
  });

  let userId;

  if (existing.data?.users?.length) {
    userId = existing.data.users[0].id;
    console.log(`Admin user already exists for ${email} (id=${userId})`);
  } else {
    const created = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });
    if (created.error) {
      throw created.error;
    }
    userId = created.data.user?.id;
    if (!userId) {
      throw new Error('Failed to create admin user; no user id returned');
    }
    console.log(`Created admin user ${email} (id=${userId})`);
  }

  const profile = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      full_name: 'Admin',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (profile.error) {
    throw profile.error;
  }

  const bucketId = `renders-${userId}`;
  try {
    const { data } = await supabase.storage.getBucket(bucketId);
    if (!data) {
      await supabase.storage.createBucket(bucketId, { public: false });
      console.log(`Created storage bucket ${bucketId}`);
    } else {
      console.log(`Storage bucket ${bucketId} already exists`);
    }
  } catch (err) {
    if (err?.message?.includes('Bucket not found')) {
      await supabase.storage.createBucket(bucketId, { public: false });
      console.log(`Created storage bucket ${bucketId}`);
    } else {
      throw err;
    }
  }

  console.log('Admin seed complete');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


