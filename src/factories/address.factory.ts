import { faker } from '@faker-js/faker';

export interface Address {
  street: string;
  house_number: string;
  city: string;
  state: string;
  /** ISO 3166-1 alpha-2; the UI country <select> uses the same codes as option values. */
  country: string;
  postal_code: string;
}

export function buildAddress(overrides: Partial<Address> = {}): Address {
  return {
    street: faker.location.street(),
    house_number: faker.location.buildingNumber(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: 'US',
    postal_code: faker.location.zipCode('#####'),
    ...overrides,
  };
}
