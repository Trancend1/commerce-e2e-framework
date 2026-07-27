import { type Page, type Locator } from '@playwright/test';
import { type Address } from '../utils/dataFactory';
import { waitForRequestsToSettle } from '../utils/waits';

export type PaymentMethod =
  'bank-transfer' | 'cash-on-delivery' | 'credit-card' | 'buy-now-pay-later' | 'gift-card';

/** POM for steps 2–4 (sign-in, billing, payment) of the /checkout wizard.
 *  Locators only — assertions live in specs. */
export class CheckoutPage {
  readonly signInProceedButton: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly countrySelect: Locator;
  readonly postalCodeInput: Locator;
  readonly houseNumberInput: Locator;
  readonly billingProceedButton: Locator;
  readonly paymentMethodSelect: Locator;
  readonly confirmButton: Locator;
  readonly paymentSuccessMessage: Locator;

  constructor(private readonly page: Page) {
    this.signInProceedButton = page.getByTestId('proceed-2');
    this.streetInput = page.getByTestId('street');
    this.cityInput = page.getByTestId('city');
    this.stateInput = page.getByTestId('state');
    this.countrySelect = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.houseNumberInput = page.getByTestId('house_number');
    this.billingProceedButton = page.getByTestId('proceed-3');
    this.paymentMethodSelect = page.getByTestId('payment-method');
    this.confirmButton = page.getByTestId('finish');
    this.paymentSuccessMessage = page.getByTestId('payment-success-message');
  }

  async proceedFromSignIn(): Promise<void> {
    await this.signInProceedButton.click();
  }

  async fillBillingAddress(address: Address): Promise<void> {
    // Country + postal code + house number trigger an async GET /postcode-lookup cascade that
    // patches this form (the first response re-triggers a second lookup). Fill them first and
    // let it settle, so the fields below hold our values and the caller's "Proceed" click
    // cannot race the patch — that race silently strands the wizard on the billing step.
    await this.countrySelect.selectOption({ label: address.country });
    await this.postalCodeInput.fill(address.postal_code);
    await this.houseNumberInput.fill(address.house_number);
    await waitForRequestsToSettle(this.page, '/postcode-lookup');

    await this.streetInput.fill(address.street);
    await this.cityInput.fill(address.city);
    await this.stateInput.fill(address.state);
  }

  async proceedToPayment(): Promise<void> {
    await this.billingProceedButton.click();
  }

  async payWith(method: PaymentMethod): Promise<void> {
    await this.paymentMethodSelect.selectOption(method);
    await this.confirmButton.click();
  }
}
