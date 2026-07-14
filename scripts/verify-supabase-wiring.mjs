const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_PROJECT_ID'
];

function jwtPayload(value) {
  try {
    return JSON.parse(Buffer.from(String(value).split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return {};
  }
}

function refFromUrl(value) {
  try {
    const host = new URL(value).hostname;
    return host.endsWith('.supabase.co') ? host.split('.')[0] : null;
  } catch {
    return null;
  }
}

function refFromDatabaseUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const direct = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)?.[1];
    const pooled = parsed.username.match(/^postgres\.([a-z0-9]+)$/)?.[1];
    return direct || pooled || null;
  } catch {
    return null;
  }
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

for (const key of REQUIRED) {
  if (!process.env[key]) fail(`${key} is missing`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const projectRef = process.env.SUPABASE_PROJECT_ID;
const urlRef = refFromUrl(url);
const anon = jwtPayload(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const service = jwtPayload(process.env.SUPABASE_SERVICE_ROLE_KEY);
const databaseRef = refFromDatabaseUrl(process.env.SUPABASE_DATABASE_URL);

if (!urlRef) fail('NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase project URL');
if (process.env.SUPABASE_URL && refFromUrl(process.env.SUPABASE_URL) !== urlRef) {
  fail('SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL reference different projects');
}
if (projectRef !== urlRef) fail('SUPABASE_PROJECT_ID does not match the Supabase URL');
if (anon.ref !== projectRef || anon.role !== 'anon') fail('NEXT_PUBLIC_SUPABASE_ANON_KEY does not match the project or anon role');
if (service.ref !== projectRef || service.role !== 'service_role') fail('SUPABASE_SERVICE_ROLE_KEY does not match the project or service role');
if (databaseRef && databaseRef !== projectRef) fail('SUPABASE_DATABASE_URL references a different project');

if (!process.exitCode) {
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  if (!response.ok) {
    fail(`Supabase REST authentication returned HTTP ${response.status}`);
  } else {
    console.log(`PASS: Supabase ${projectRef} URL, JWT roles, database reference, and REST authentication are aligned.`);
  }
}
