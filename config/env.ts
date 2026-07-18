/** Single entry point for environment config — the only file allowed to read process.env. */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name} (see .env.example)`);
  return value;
}

export const env = Object.freeze({
  baseUrl: required('SUT_BASE_URL', 'http://localhost:4200'),
  apiUrl: required('SUT_API_URL', 'http://localhost:8091'),
  customerEmail: required('SUT_CUSTOMER_EMAIL', 'customer@practicesoftwaretesting.com'),
  customerPassword: required('SUT_CUSTOMER_PASSWORD', 'welcome01'),
  adminEmail: required('SUT_ADMIN_EMAIL', 'admin@practicesoftwaretesting.com'),
  adminPassword: required('SUT_ADMIN_PASSWORD', 'welcome01'),
});
