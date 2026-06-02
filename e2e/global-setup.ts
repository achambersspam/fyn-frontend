import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

// Load backend env so we can use the service key to create a pre-confirmed test user.
// This bypasses Supabase email confirmation entirely, regardless of project settings.
loadEnv({ path: resolve(__dirname, '../../the-final-fyn-backend/.env') });

const AUTH_DIR = resolve(__dirname, '.auth');
const CREDS_PATH = resolve(AUTH_DIR, 'test-credentials.json');
const SESSION_PATH = resolve(AUTH_DIR, 'session.json');

export default async function globalSetup() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'globalSetup: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the-final-fyn-backend/.env'
    );
  }

  mkdirSync(AUTH_DIR, { recursive: true });

  // Create a fresh test user via admin API with email pre-confirmed.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = `fyn-e2e-${Date.now()}@test.invalid`;
  const password = `E2ePass${Date.now()}!`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`globalSetup: failed to create test user — ${error?.message}`);
  }

  writeFileSync(CREDS_PATH, JSON.stringify({ email, password, userId: data.user.id }));

  // Sign in via the UI and save the browser storageState so test files can skip sign-in.
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/auth');

  // The page opens in "signup" mode. Click the "Sign In" tab.
  await page.locator('button', { hasText: 'Sign In' }).first().click();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // New user — auth page redirects to /setup (or /dashboard if profile check fails).
  await page.waitForURL((url) => url.pathname.startsWith('/setup') || url.pathname.startsWith('/dashboard'), {
    timeout: 20_000,
  });

  await context.storageState({ path: SESSION_PATH });
  await browser.close();
}
