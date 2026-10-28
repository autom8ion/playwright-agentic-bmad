import { test, expect } from '@fixtures';

test.describe('Cart', () => {
  test('adding a product updates the badge and cart @smoke', async ({ api, productPage, cartPage }) => {
    const product = await api.firstInStockProduct();

    await productPage.goto(product.id);
    await productPage.addToCart(2);

    await expect(productPage.addedToast).toBeVisible();
    await expect(productPage.nav.cartQuantity).toHaveText('2');

    await productPage.nav.cart.click();
    await expect(cartPage.productTitles).toHaveText([product.name]);
    await expect(cartPage.lineQuantities).toHaveValue('2');
    await expect(cartPage.total).toHaveText(`$${(product.price * 2).toFixed(2)}`);
  });
});
