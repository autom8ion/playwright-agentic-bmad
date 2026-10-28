import type { Locator, Page } from '@playwright/test';
import { NavBar } from './components/NavBar';

export type SortOption = 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';

/** Product catalog: search, sort and category filters. Each action waits for its API call, never a timeout. */
export class HomePage {
  readonly nav: NavBar;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  constructor(private readonly page: Page) {
    this.nav = new NavBar(page);
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
  }

  async goto() {
    await Promise.all([this.waitForProducts('/products'), this.page.goto('/')]);
  }

  async search(term: string) {
    await this.page.getByTestId('search-query').fill(term);
    await Promise.all([
      this.waitForProducts('/products/search'),
      this.page.getByTestId('search-submit').click(),
    ]);
  }

  async sortBy(option: SortOption) {
    await Promise.all([
      this.waitForProducts('/products'),
      this.page.getByTestId('sort').selectOption(option),
    ]);
  }

  async filterByCategory(name: string) {
    await Promise.all([
      this.waitForProducts('/products'),
      this.page.getByRole('checkbox', { name, exact: true }).check(),
    ]);
  }

  async openProduct(name: string) {
    await this.productNames.filter({ hasText: name }).first().click();
  }

  async prices(): Promise<number[]> {
    return (await this.productPrices.allInnerTexts()).map((p) => Number(p.replace(/[^0-9.]/g, '')));
  }

  /** The app fetches the catalog with the HTTP QUERY method (params in the body), so match on the endpoint path. */
  private waitForProducts(path: '/products' | '/products/search') {
    return this.page.waitForResponse((r) => new URL(r.url()).pathname === path && r.ok());
  }
}
