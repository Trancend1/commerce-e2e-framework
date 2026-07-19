import { faker } from '@faker-js/faker';

/** Faker-based builders — unique, PII-free test entities (docs/TEST-DATA.md).
 *  Shapes mirror the Toolshop OpenAPI schemas (UserRequest, InvoiceRequest billing_*). */

// Fixed so UI country <select> option lookup stays deterministic.
const COUNTRY = 'Indonesia';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  house_number: string;
}

export function buildAddress(): Address {
  return {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: COUNTRY,
    postal_code: faker.string.numeric(5),
    house_number: faker.string.numeric(2),
  };
}

export interface NewUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
  address: Address;
}

export function buildUser(): NewUser {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    // timestamp suffix keeps emails unique across parallel shards
    email: `qa.${Date.now()}.${faker.string.alphanumeric(6)}@example.test`,
    // random per user: the SUT rejects passwords found in known data leaks (Laravel uncompromised())
    password: `${faker.string.alpha({ length: 4, casing: 'upper' })}${faker.string.alpha({ length: 4, casing: 'lower' })}${faker.string.numeric(4)}!#`,
    dob: '1996-01-01',
    phone: faker.string.numeric(10),
    address: buildAddress(),
  };
}
