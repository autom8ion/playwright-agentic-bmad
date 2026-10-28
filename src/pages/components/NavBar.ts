import type { Locator, Page } from '@playwright/test';

/** Site header, composed into page objects rather than inherited. */
export class NavBar {
  readonly signIn: Locator;
  readonly userMenu: Locator;
  readonly signOut: Locator;
  readonly cart: Locator;
  readonly cartQuantity: Locator;

  constructor(page: Page) {
    this.signIn = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOut = page.getByTestId('nav-sign-out');
    this.cart = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async logout() {
    await this.userMenu.click();
    await this.signOut.click();
  }
}
