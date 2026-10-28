import { expect, type Locator, type Page } from '@playwright/test';
import { NavBar } from './components/NavBar';

export class LoginPage {
  readonly nav: NavBar;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.nav = new NavBar(page);
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-submit');
    this.error = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/auth/login');
    // Toolshop sits behind Cloudflare, which challenges datacenter IPs (e.g. GitHub-hosted runners).
    // Fail fast with the real reason instead of a locator timeout.
    const botCheck = this.page.getByRole('heading', { name: 'Performing security verification' });
    await expect(this.email.or(botCheck)).toBeVisible();
    await expect(botCheck, 'Blocked by Cloudflare bot verification: run UI tests from a local or self-hosted network').toBeHidden();
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
