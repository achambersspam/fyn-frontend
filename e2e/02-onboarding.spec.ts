/**
 * 02-onboarding: Drives the three-step setup wizard end-to-end.
 *
 * Uses storageState from globalSetup (signed-in session).
 * Selects the TEST_TOPICS set, fills one preset per topic in step 2,
 * submits in step 3, and confirms the app redirects to /setup/creating.
 * Saves the newsletter ID to e2e/.auth/newsletter-id.txt for test 03.
 */

import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { TEST_TOPICS } from './fixtures/test-topics';

test.use({ storageState: 'e2e/.auth/session.json' });

test('completes 3-step setup wizard and reaches creating page', async ({ page }) => {
  // ── Step 1: Topic selection ──────────────────────────────────────────────────
  await page.goto('/setup/step-1');

  // Wait for the wizard to hydrate (it loads the user session async).
  await expect(page.locator('text=Choose Your Topics')).toBeVisible({ timeout: 15_000 });

  for (const topic of TEST_TOPICS) {
    await page.locator('button', { hasText: topic.label }).first().click();
  }

  // Confirm all three are visually selected (border-primary class indicates selection).
  for (const topic of TEST_TOPICS) {
    await expect(
      page.locator('button', { hasText: topic.label }).first()
    ).toHaveClass(/border-primary/, { timeout: 5_000 });
  }

  await page.locator('button', { hasText: 'Go to Step 2 - Type Your Topic Details' }).click();
  await page.waitForURL('**/setup/step-2', { timeout: 10_000 });

  // ── Step 2: Topic details ────────────────────────────────────────────────────
  await expect(page.locator('text=Topic Details')).toBeVisible({ timeout: 10_000 });

  // Click one preset chip per topic — one is enough to pass validation.
  for (const topic of TEST_TOPICS) {
    await page.locator('button', { hasText: topic.preset }).click();
  }

  // Ensure presets are registered before advancing (avoid race with state update).
  await page.waitForTimeout(300);

  await page.locator('button', { hasText: 'Go to Step 3 - Customize Your Delivery Preferences' }).click();
  await page.waitForURL('**/setup/step-3', { timeout: 10_000 });

  // ── Step 3: Delivery preferences ────────────────────────────────────────────
  await expect(page.locator('text=Your Delivery Settings')).toBeVisible({ timeout: 10_000 });

  // Defaults (Daily, 09:00, system timezone) are acceptable — just submit.
  await page.locator('button', { hasText: 'Create Your For You Newsletter' }).click();

  // App POSTs to /api/newsletters and redirects to /setup/creating?newsletterId=XXX.
  await page.waitForURL(/\/setup\/creating\?newsletterId=/, { timeout: 20_000 });

  const newsletterId = new URL(page.url()).searchParams.get('newsletterId');
  expect(newsletterId).toBeTruthy();

  // Persist for test 03.
  writeFileSync(resolve(__dirname, '.auth/newsletter-id.txt'), newsletterId ?? '');
});
