import { expect, type Locator, type Page } from '@playwright/test';
import type { Address } from '@factories/address.factory';

export type PaymentMethod = 'bank-transfer' | 'cash-on-delivery' | 'credit-card' | 'buy-now-pay-later' | 'gift-card';
export type BillingAddressInput = Pick<Address, 'country' | 'postal_code' | 'house_number'>;
type LookedUpAddress = Pick<Address, 'street' | 'city' | 'state'>;

/** Checkout steps 2-4: sign-in confirmation, billing address, payment. */
export class CheckoutPage {
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(private readonly page: Page) {
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  /**
   * The billing form is prefilled from the user's profile asynchronously. Typing before that lands gets overwritten,
   * so wait for the prefill (fixture users are always registered with an address).
   */
  async continueAsSignedIn() {
    await this.page.getByTestId('proceed-2').click();
    await expect(this.page.getByTestId('postal_code')).not.toHaveValue('');
  }

  /**
   * Enters country, postcode and house number, then lets the app's postcode lookup autofill street/city/state.
   * The invoice API rejects a city or state that doesn't match its lookup data for the country, so typing our
   * own values fails with a 422. Returns what the lookup filled in.
   *
   * The form is also re-patched from the user's profile in several async passes, which can overwrite our input.
   * There's no single event to wait for, so retry the entry until the form holds our values plus the lookup result.
   */
  async fillBillingAddress({ country, postal_code, house_number }: BillingAddressInput): Promise<LookedUpAddress> {
    const t = (id: string) => this.page.getByTestId(id);
    let address!: LookedUpAddress;
    await expect(async () => {
      const lookup = this.page.waitForResponse(
        (r) => {
          const url = new URL(r.url());
          return (
            url.pathname === '/postcode-lookup' &&
            url.searchParams.get('country') === country &&
            url.searchParams.get('postcode') === postal_code &&
            url.searchParams.get('house_number') === house_number &&
            r.ok()
          );
        },
        { timeout: 5_000 },
      );
      await t('country').selectOption(country);
      // The lookup fires when the postcode changes, using the house number already in the form.
      // Clearing first guarantees a change (and a fresh lookup) on every attempt.
      await t('house_number').fill(house_number);
      await t('postal_code').clear();
      await t('postal_code').fill(postal_code);
      address = (await (await lookup).json()) as LookedUpAddress;

      await expect(t('country')).toHaveValue(country, { timeout: 2_000 });
      await expect(t('postal_code')).toHaveValue(postal_code, { timeout: 2_000 });
      await expect(t('house_number')).toHaveValue(house_number, { timeout: 2_000 });
      await expect(t('city')).toHaveValue(address.city, { timeout: 2_000 });
    }).toPass({ timeout: 30_000 });

    await t('proceed-3').click();
    return address;
  }

  /** Cash on delivery needs no extra fields; other methods add inputs (add them here when a test needs one). */
  async pay(method: Extract<PaymentMethod, 'cash-on-delivery'>) {
    await this.page.getByTestId('payment-method').selectOption(method);
    await this.clickFinishAndExpectOk('/payment/check');
  }

  /** The same button, clicked a second time, creates the invoice. */
  async placeOrder() {
    await this.clickFinishAndExpectOk('/invoices');
  }

  // Waiting on the POST keeps slow shared-site responses from looking like UI failures,
  // and a 4xx surfaces the API's validation message instead of a vague locator timeout.
  private async clickFinishAndExpectOk(path: string) {
    const [res] = await Promise.all([
      this.page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname === path, {
        timeout: 30_000,
      }),
      this.page.getByTestId('finish').click(),
    ]);
    expect(res.ok(), `POST ${path} -> ${res.status()}: ${await res.text()}`).toBe(true);
  }
}
