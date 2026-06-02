/**
 * 03-newsletter-generate: Waits for the /setup/creating page to finish generating
 * the first newsletter issue, then navigates to the dashboard.
 *
 * This test has a 90-second timeout on the "Go to Dashboard" button to accommodate
 * the ~61s real AI generation time. After clicking, it asserts that the dashboard
 * shows the "Read Your Newsletter" button (confirming issue is in generated/sent state).
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

test.use({ storageState: 'e2e/.auth/session.json' });

test('newsletter generates successfully and dashboard shows read button', async ({ page }) => {
  const newsletterId = readFileSync(resolve(__dirname, '.auth/newsletter-id.txt'), 'utf8').trim();
  expect(newsletterId).toBeTruthy();

  await page.goto(`/setup/creating?newsletterId=${newsletterId}`);

  // The creating page auto-triggers generation on mount.
  // Wait up to 90 seconds for the "Go to Dashboard" button to appear.
  // It only appears after isComplete=true (generation_status = generated | sent).
  const goToDashboard = page.getByRole('button', { name: 'Go to Dashboard' });
  await expect(goToDashboard).toBeVisible({ timeout: 90_000 });

  // Confirm no error state is showing.
  await expect(page.locator('button', { hasText: 'Retry' })).not.toBeVisible();

  await goToDashboard.click();
  await page.waitForURL('**/dashboard', { timeout: 10_000 });

  // The newsletter card should now show "Read Your Newsletter".
  await expect(page.getByRole('button', { name: 'Read Your Newsletter' })).toBeVisible({
    timeout: 10_000,
  });
});
