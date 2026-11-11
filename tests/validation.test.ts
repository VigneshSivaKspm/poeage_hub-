import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, addressSchema } from '../packages/validation/src/index.ts';

describe('Validation Schemas (Zod Boundary Security)', () => {
  test('loginSchema validates well-formed emails and rejects weak passwords', () => {
    const valid = loginSchema.safeParse({
      email: 'customer@poeagehub.com',
      password: 'StrongPassword123!',
    });
    assert.equal(valid.success, true);

    const invalid = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'short',
    });
    assert.equal(invalid.success, false);
  });

  test('addressSchema validates Indian address formats and PIN codes', () => {
    const valid = addressSchema.safeParse({
      label: 'home',
      recipientName: 'Aarav Sharma',
      phone: '9876543210',
      line1: 'Flat 302, Prestige Towers, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      country: 'India',
      isDefault: true,
    });
    assert.equal(valid.success, true);

    const badPin = addressSchema.safeParse({
      label: 'home',
      recipientName: 'Aarav Sharma',
      phone: '9876543210',
      line1: 'Flat 302, Prestige Towers',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '123', // Invalid PIN
      country: 'India',
      isDefault: true,
    });
    assert.equal(badPin.success, false);
  });
});
