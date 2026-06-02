/**
 * 04-newsletter-sections: Reads the generated newsletter and verifies that every
 * selected topic has a rendered section that is non-empty and error-free.
 *
 * Depends on data-testid="section-{slug}" being present on each section wrapper
 * in the dashboard HTML (added to lib/rendering/components/renderSectionWrapper.ts).
 *
 * Error strings checked: generic fallback phrases that indicate the AI or data
 * pipeline silently failed rather than returning real content.
 */

import { test, expect } from '@playwright/test';
import { TEST_TOPICS } from './fixtures/test-topics';

test.use({ storageState: 'e2e/.auth/session.json' });

const KNOWN_FAILURE_STRINGS = [
  'Unable to fetch',
  'No data available',
  'This issue is still being prepared',
  'generation failed',
  'No relevant',
];

test('each selected topic section renders with content', async ({ page }) => {
  await page.goto('/dashboard');

  // Dashboard must show the read button before we proceed.
  const readBtn = page.getByRole('button', { name: 'Read Your Newsletter' });
  await expect(readBtn).toBeVisible({ timeout: 15_000 });
  await readBtn.click();

  await page.waitForURL(/\/newsletter\/.+\/read/, { timeout: 10_000 });

  // Wait for the newsletter HTML to be injected (dangerouslySetInnerHTML).
  // The sections div is the immediate child rendered from issue.body_html.
  await expect(page.locator('[data-testid^="section-"]').first()).toBeVisible({
    timeout: 15_000,
  });

  // All three topic sections must be present.
  await expect(page.locator('[data-testid^="section-"]')).toHaveCount(TEST_TOPICS.length, {
    timeout: 10_000,
  });

  for (const topic of TEST_TOPICS) {
    const section = page.locator(`[data-testid="${topic.testId}"]`);

    // Section must be visible.
    await expect(section).toBeVisible();

    // Section must have a heading.
    await expect(section.locator('h2')).toBeVisible();
    await expect(section.locator('h2')).not.toBeEmpty();

    // Section must have at least one paragraph or list item with real content.
    const hasParagraph = await section.locator('p, li').count();
    expect(hasParagraph).toBeGreaterThan(0);

    // Check for known failure/placeholder strings.
    for (const failStr of KNOWN_FAILURE_STRINGS) {
      await expect(section).not.toContainText(failStr, { ignoreCase: true });
    }
  }
});
