import { test as base, expect } from '@playwright/test';
import { API_URL } from '../../playwright.config';
import { ToolshopApi } from '@api/ToolshopApi';
import { buildUser, type User } from '@factories/user.factory';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { ProductPage } from '@pages/ProductPage';
import { RegisterPage } from '@pages/RegisterPage';

type Fixtures = {
  api: ToolshopApi;
  /** A fresh account registered through the API: isolated per test, safe in parallel. */
  newUser: User;
  /** `newUser`, already signed in: the JWT is seeded into localStorage before the app boots, so there's no UI login. */
  signedInUser: User;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({ baseURL: API_URL });
    await use(new ToolshopApi(request));
    await request.dispose();
  },
  newUser: async ({ api }, use) => {
    const user = buildUser();
    await api.register(user);
    await use(user);
  },
  signedInUser: async ({ page, api, newUser }, use) => {
    const token = await api.login(newUser.email, newUser.password);
    await page.addInitScript((t) => window.localStorage.setItem('auth-token', t), token);
    await use(newUser);
  },
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect };
