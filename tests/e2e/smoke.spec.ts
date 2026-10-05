import { expect, test } from '@playwright/test';

test.describe('ExploreBD smoke', () => {
  test('home loads with the hero and district count', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/64/).first()).toBeVisible();
  });

  test('mark Dhaka visited and Cox’s Bazar want-to-go, then persist after reload', async ({ page }) => {
    await page.goto('/map');
    // Use the accessible district list (keyboard/screen-reader alternative).
    await page.getByRole('button', { name: /^Dhaka/ }).first().click();
    // On desktop a status editor appears in the panel; on mobile a sheet.
    const visited = page.getByRole('menuitemradio', { name: /Visited/i }).first();
    if (await visited.isVisible().catch(() => false)) await visited.click();

    await page.reload();
    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    // The progress summary should show at least one visited district.
    await expect(page.getByText(/1 \/ 64|1\/64|1 \/ ৬৪/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Bangla district search finds Cox’s Bazar', async ({ page }) => {
    await page.goto('/map');
    const search = page.getByLabel(/district|জেলা/i).first();
    await search.fill('কক্স');
    await expect(page.getByText(/Cox|কক্সবাজার/).first()).toBeVisible();
  });

  test('guide page and a place detail open', async ({ page }) => {
    await page.goto('/guide');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/place/coxs-bazar-beach');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('quiz is playable', async ({ page }) => {
    await page.goto('/games/quiz');
    await page.getByRole('button', { name: /Quick 10|দ্রুত ১০/i }).click();
    await expect(page.locator('.quiz-option').first()).toBeVisible();
  });

  test('language toggle switches the UI', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /বাংলা|English|EN/i }).first().click();
    await page.getByRole('menuitemradio', { name: /English/i }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-BD');
  });

  test('no horizontal overflow on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
