import { faker } from '@faker-js/faker';

/** Faker-based builders — unique, PII-free test entities (docs/TEST-DATA.md). */
export function buildUser() {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    // timestamp suffix keeps emails unique across parallel shards
    email: `qa.${Date.now()}.${faker.string.alphanumeric(6)}@example.test`,
    password: 'Str0ngPassw0rd!',
    dob: '1996-01-01',
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: 'ID',
  };
}
