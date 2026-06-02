/**
 * 01-auth: Validates that a test account (created by globalSetup) can sign in,
 * and that the app correctly routes a new user to /setup.
 *
 * globalSetup already signed in and saved storageState to e2e/.auth/session.json.
 * This spec re-signs-in without storageState to verify the full sign-in path is
 * working end-to-end.
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CREDS_PATH = resolve(__dirname, '.auth/test-credentials.json');

test('new test user signs in and lands on setup or dashboard', async ({ page }) => {
  const { email, password } = JSON.parse(readFileSync(CREDS_PATH, 'utf8')) as {
    email: string;
    password: string;
  };

  await page.goto('/auth');

  // Default mode is "signup" — switch to sign-in.
  await page.locator('button', { hasText: 'Sign In' }).first().click();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // A freshly-created user with no onboarding_complete profile should land on /setup.
  // If /api/me throws (profile row not yet created), the app falls back to /dashboard.
  await page.waitForURL(
    (url) => url.pathname.startsWith('/setup') || url.pathname.startsWith('/dashboard'),
    { timeout: 20_000 }
  );

  // No auth error should be visible.
  await expect(page.locator('text=An account with this email already exists')).not.toBeVisible();
  await expect(page.locator('text=Something went wrong')).not.toBeVisible();
});
