import type { Page } from '@playwright/test';
import type { User } from '@factories/user.factory';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/auth/register');
  }

  async register(user: User) {
    const t = (id: string) => this.page.getByTestId(id);
    await t('first-name').fill(user.first_name);
    await t('last-name').fill(user.last_name);
    await t('dob').fill(user.dob);
    await t('country').selectOption(user.address.country);
    await t('postal_code').fill(user.address.postal_code);
    await t('house_number').fill(user.address.house_number);
    await t('street').fill(user.address.street);
    await t('city').fill(user.address.city);
    await t('state').fill(user.address.state);
    await t('phone').fill(user.phone);
    await t('email').fill(user.email);
    await t('password').fill(user.password);
    await t('register-submit').click();
  }
}
