import { test, expect } from '@fixtures';

test.describe('Catalog', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('search returns only matching products @smoke', async ({ homePage, api }) => {
    const expected = await api.searchProducts('pliers');

    await homePage.search('pliers');

    await expect(homePage.productNames).toHaveCount(expected.data.length);
    for (const name of await homePage.productNames.allInnerTexts()) {
      expect(name).toMatch(/pliers/i);
    }
  });

  test('search with no match shows the empty state @regression', async ({ page, homePage }) => {
    await homePage.search('zzz-no-such-tool');

    await expect(homePage.productNames).toHaveCount(0);
    await expect(page.getByTestId('no-results')).toBeVisible();
  });

  test('sort by price low to high orders the grid @regression', async ({ homePage }) => {
    await homePage.sortBy('price,asc');

    await expect
      .poll(async () => {
        const prices = await homePage.prices();
        return prices.length > 1 && prices.every((p, i) => i === 0 || prices[i - 1] <= p);
      })
      .toBe(true);
  });

  test('category filter narrows results @regression', async ({ homePage }) => {
    await homePage.filterByCategory('Hammer');

    await expect
      .poll(async () => {
        const names = await homePage.productNames.allInnerTexts();
        return names.length > 0 && names.every((n) => /hammer/i.test(n));
      })
      .toBe(true);
  });
});
