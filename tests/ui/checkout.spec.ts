import { test, expect } from '@fixtures';

test.describe('Checkout', () => {
  test('signed-in user completes checkout with cash on delivery @smoke', async ({
    page,
    signedInUser,
    api,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    test.slow(); // Four-step wizard against a shared public site.
    const product = await api.firstInStockProduct();

    await productPage.goto(product.id);
    await productPage.addToCart();
    await expect(productPage.addedToast).toBeVisible();

    await cartPage.goto();
    await cartPage.proceed();
    await expect(page.getByText(`Hello ${signedInUser.first_name} ${signedInUser.last_name}, you are already logged in`)).toBeVisible();
    await checkoutPage.continueAsSignedIn();
    const billing = await checkoutPage.fillBillingAddress({ country: 'AT', postal_code: '1010', house_number: '12' });
    expect(billing.city, 'postcode lookup autofills a city').not.toBe('');
    await checkoutPage.pay('cash-on-delivery');
    await expect(checkoutPage.paymentSuccess).toHaveText('Payment was successful');

    await checkoutPage.placeOrder();
    await expect(checkoutPage.orderConfirmation).toContainText(/Your invoice number is INV-\d+/);
  });
});
