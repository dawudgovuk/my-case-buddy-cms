import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually for script execution
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;
const AUTH_JWKS_URL = process.env.NEON_AUTH_JWKS_URL || process.env.VITE_NEON_AUTH_JWKS_URL;
const FUNCTION_URL = process.env.NEON_FUNCTION_HELLO_BASE_URL || process.env.VITE_NEON_FUNCTION_HELLO_URL;

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Testing Wired Neon Services End-to-End');
  console.log('====================================================\n');

  let allPassed = true;

  // 1. Test Neon Postgres
  console.log('1️⃣ Testing Neon Lakebase Postgres (@neondatabase/serverless)...');
  try {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment');
    }
    const sql = neon(DATABASE_URL);
    const rows = await sql`SELECT NOW() as now, version() as version, current_database() as db;`;
    if (rows && rows.length > 0) {
      console.log('   ✅ Postgres Connected Successfully!');
      console.log(`      Database: ${rows[0].db}`);
      console.log(`      Timestamp: ${rows[0].now}`);
      console.log(`      Engine: ${rows[0].version.split(' ')[0]} ${rows[0].version.split(' ')[1]}`);
    } else {
      throw new Error('No rows returned from Postgres query');
    }
  } catch (err) {
    allPassed = false;
    console.error('   ❌ Postgres Connection Failed:', err instanceof Error ? err.message : err);
  }

  // 2. Test Neon Auth
  console.log('\n2️⃣ Testing Neon Auth (Managed Better Auth JWKS & Client SDK)...');
  try {
    if (!AUTH_JWKS_URL) {
      throw new Error('NEON_AUTH_JWKS_URL is not defined in environment');
    }
    const res = await fetch(AUTH_JWKS_URL);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as { keys?: Array<{ kty?: string; alg?: string; kid?: string }> };
    console.log('   ✅ Neon Auth Reachable!');
    console.log(`      Endpoint: ${AUTH_JWKS_URL}`);
    console.log(`      Active Cryptographic Keys: ${data.keys?.length ?? 0}`);
    if (data.keys?.[0]) {
      console.log(`      Key Algorithm: ${data.keys[0].alg} (${data.keys[0].kty})`);
    }

    // Verify @neondatabase/neon-js/auth Client SDK
    const authUrl = process.env.VITE_NEON_AUTH_URL || process.env.VITE_NEON_AUTH_BASE_URL || process.env.NEON_AUTH_BASE_URL;
    if (authUrl) {
      const { createAuthClient } = await import('@neondatabase/neon-js/auth');
      const client = createAuthClient(authUrl, {
        fetchOptions: { headers: { Origin: 'http://localhost:5173' } },
      });
      const sessionRes = await client.getSession();
      console.log('   ✅ Neon JS Auth Client SDK initialized successfully!');
      console.log(`      Auth URL: ${authUrl}`);
      console.log(`      API Methods: getSession, signIn.email, signUp.email, signOut, token`);
      console.log(`      Active Session: ${sessionRes.data ? 'Present' : 'None (Ready for login)'}`);
    }
  } catch (err) {
    allPassed = false;
    console.error('   ❌ Neon Auth Verification Failed:', err instanceof Error ? err.message : err);
  }

  // 3. Test Neon Functions
  console.log('\n3️⃣ Testing Neon Serverless Functions (hello)...');
  try {
    if (!FUNCTION_URL) {
      throw new Error('NEON_FUNCTION_HELLO_BASE_URL is not defined in environment');
    }
    const start = Date.now();
    const res = await fetch(FUNCTION_URL);
    const latency = Date.now() - start;
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    console.log('   ✅ Neon Function Invocation Succeeded!');
    console.log(`      URL: ${FUNCTION_URL}`);
    console.log(`      Status: ${res.status} OK (${latency}ms)`);
    console.log(`      Response: "${text.trim()}"`);
  } catch (err) {
    allPassed = false;
    console.error('   ❌ Neon Function Invocation Failed:', err instanceof Error ? err.message : err);
  }

  console.log('\n====================================================');
  if (allPassed) {
    console.log('🎉 ALL NEON SERVICES VERIFIED END-TO-END!');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.log('⚠️ ONE OR MORE SERVICES FAILED VERIFICATION');
    console.log('====================================================');
    process.exit(1);
  }
}

runTests();
