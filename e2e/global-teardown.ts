import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(__dirname, '../../the-final-fyn-backend/.env') });

const AUTH_DIR = resolve(__dirname, '.auth');

export default async function globalTeardown() {
  const credsPath = resolve(AUTH_DIR, 'test-credentials.json');
  if (!existsSync(credsPath)) return;

  const { userId } = JSON.parse(readFileSync(credsPath, 'utf8')) as {
    userId: string;
  };

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Delete the test user so it doesn't accumulate across runs.
    await admin.auth.admin.deleteUser(userId).catch(() => {
      // Non-fatal: Supabase may have cascade-deleted the user already.
    });
  }

  // Clean up auth artifacts.
  for (const file of ['test-credentials.json', 'session.json', 'newsletter-id.txt']) {
    const p = resolve(AUTH_DIR, file);
    if (existsSync(p)) unlinkSync(p);
  }
}
