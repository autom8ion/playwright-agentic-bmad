import { test, expect } from '@fixtures';
import type { Page, Product } from '@api/ToolshopApi';

test.describe('Products API', () => {
  test('lists products with pagination metadata @smoke', async ({ request }) => {
    const res = await request.get('/products', { params: { page: 1 } });

    await expect(res).toBeOK();
    const body = (await res.json()) as Page<Product>;
    expect(body.current_page).toBe(1);
    expect(body.total).toBeGreaterThan(body.data.length);
    expect(body.data[0]).toEqual(
      expect.objectContaining({ id: expect.any(String), name: expect.any(String), price: expect.any(Number) }),
    );
  });

  test('search matches product names @regression', async ({ api }) => {
    const { data } = await api.searchProducts('hammer');

    expect(data.length).toBeGreaterThan(0);
    for (const p of data) expect(p.name).toMatch(/hammer/i);
  });

  test('unknown product id returns 404 @regression', async ({ request }) => {
    const res = await request.get('/products/does-not-exist');
    expect(res.status()).toBe(404);
  });
});
