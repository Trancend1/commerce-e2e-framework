/** Shared auth artifacts. The setup project (tests/setup/auth.setup.ts) logs in once
 *  and saves storageState here; authenticated specs opt in via test.use({ storageState }). */
export const CUSTOMER_STORAGE_STATE = 'playwright/.auth/customer.json';
