import { faker } from '@faker-js/faker';
import { buildAddress, type Address } from './address.factory';

export interface User {
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  address: Address;
}

export function buildUser(overrides: Partial<User> = {}): User {
  const first_name = faker.person.firstName();
  const last_name = faker.person.lastName();
  return {
    first_name,
    last_name,
    dob: faker.date.birthdate({ mode: 'age', min: 21, max: 70 }).toISOString().slice(0, 10),
    phone: faker.string.numeric(10),
    // Unique per call so parallel workers and repeated runs never collide on the shared public site.
    email: faker.internet
      .email({ firstName: first_name, lastName: last_name, provider: 'example.com' })
      .replace('@', `+${Date.now()}${faker.string.alphanumeric(4)}@`)
      .toLowerCase(),
    // Toolshop requires upper, lower, digit and symbol.
    password: `${faker.internet.password({ length: 12 })}Aa1!`,
    address: buildAddress(),
    ...overrides,
  };
}
