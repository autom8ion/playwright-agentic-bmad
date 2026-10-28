import { test, expect } from '@fixtures';
import { buildUser } from '@factories/user.factory';
import { CUSTOMER_STATE } from '../../playwright.config';

test.describe('Authentication', () => {
  test('registered user can sign in and out @smoke', async ({ page, loginPage, newUser }) => {
    await loginPage.goto();
    await loginPage.login(newUser.email, newUser.password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(loginPage.nav.userMenu).toContainText(`${newUser.first_name} ${newUser.last_name}`);

    await loginPage.nav.logout();
    await expect(loginPage.nav.signIn).toBeVisible();
  });

  test('wrong password is rejected @regression', async ({ page, loginPage, newUser }) => {
    await loginPage.goto();
    await loginPage.login(newUser.email, `${newUser.password}x`);

    await expect(loginPage.error).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('new visitor can register through the UI @regression', async ({ page, registerPage, loginPage }) => {
    const user = buildUser();
    await registerPage.goto();
    await registerPage.register(user);

    await expect(page).toHaveURL(/\/auth\/login$/);
    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/account$/);
  });

  test.describe('seed customer session', () => {
    test.use({ storageState: CUSTOMER_STATE });

    test('stored session opens the account page without logging in @smoke', async ({ page }) => {
      await page.goto('/account');
      await expect(page.getByTestId('page-title')).toHaveText('My account');
    });
  });
});
