import { test as setup, expect } from '@fixtures';
import { CUSTOMER_STATE } from '../playwright.config';

// Toolshop JWTs expire after 5 minutes, so this runs every time rather than reusing a cached file.
setup('authenticate seed customer', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(process.env.CUSTOMER_EMAIL!, process.env.CUSTOMER_PASSWORD!);
  await expect(page).toHaveURL(/\/account$/);
  await page.context().storageState({ path: CUSTOMER_STATE });
});
