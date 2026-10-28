import type { Locator, Page } from '@playwright/test';
import { NavBar } from './components/NavBar';

export class ProductPage {
  readonly nav: NavBar;
  readonly name: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly addedToast: Locator;

  constructor(private readonly page: Page) {
    this.nav = new NavBar(page);
    this.name = page.getByTestId('product-name');
    this.price = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.addedToast = page.getByRole('alert').filter({ hasText: 'Product added to shopping cart' });
  }

  async goto(productId: string) {
    await this.page.goto(`/product/${productId}`);
  }

  async addToCart(quantity = 1) {
    await this.quantity.fill(String(quantity));
    await this.page.getByTestId('add-to-cart').click();
  }
}
