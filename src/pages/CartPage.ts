import type { Locator, Page } from '@playwright/test';

/** Checkout step 1 (/checkout): cart contents. */
export class CartPage {
  readonly productTitles: Locator;
  readonly lineQuantities: Locator;
  readonly total: Locator;

  constructor(private readonly page: Page) {
    this.productTitles = page.getByTestId('product-title');
    this.lineQuantities = page.getByTestId('product-quantity');
    this.total = page.getByTestId('cart-total');
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async proceed() {
    await this.page.getByTestId('proceed-1').click();
  }
}
