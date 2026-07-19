import { type Page, type Locator } from '@playwright/test';
import { type NewUser } from '../utils/dataFactory';

/** POM for /auth/register. Locators only — assertions live in specs (docs/CODING-STANDARDS.md). */
export class RegisterPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dobInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly countrySelect: Locator;
  readonly postalCodeInput: Locator;
  readonly houseNumberInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.dobInput = page.getByTestId('dob');
    this.streetInput = page.getByTestId('street');
    this.cityInput = page.getByTestId('city');
    this.stateInput = page.getByTestId('state');
    this.countrySelect = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.houseNumberInput = page.getByTestId('house_number');
    this.phoneInput = page.getByTestId('phone');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('register-submit');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
  }

  async registerAs(user: NewUser): Promise<void> {
    await this.firstNameInput.fill(user.first_name);
    await this.lastNameInput.fill(user.last_name);
    await this.dobInput.fill(user.dob);
    await this.streetInput.fill(user.address.street);
    await this.cityInput.fill(user.address.city);
    await this.stateInput.fill(user.address.state);
    await this.countrySelect.selectOption({ label: user.address.country });
    await this.postalCodeInput.fill(user.address.postal_code);
    await this.houseNumberInput.fill(user.address.house_number);
    await this.phoneInput.fill(user.phone);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }
}
