// Seed for Playwright's planner/generator/healer agents (.claude/agents): they run this first to set up the page.
// Generated specs should import { test, expect } from '@fixtures' and use the page objects in src/pages.
import { test, expect } from '@fixtures';

test('seed @seed', async ({ homePage }) => {
  await homePage.goto();
  await expect(homePage.productNames.first()).toBeVisible();
});
