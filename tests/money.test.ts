import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, formatMoneyCompact, rupeesToPaise, calculateCommission } from '../packages/utils/src/money.ts';

describe('Financial & Currency Utilities (Paise Integer Engine)', () => {
  test('formatMoney converts paise to Indian Rupee formatted string', () => {
    assert.equal(formatMoney(10050), '₹100.50');
    assert.equal(formatMoney(0), '₹0.00');
    assert.equal(formatMoney(149900), '₹1,499.00');
    assert.equal(formatMoney(10050, false), '100.50');
  });

  test('formatMoneyCompact formats large values with Lakh and Crore notations', () => {
    assert.equal(formatMoneyCompact(1500000000), '₹1.50Cr');
    assert.equal(formatMoneyCompact(150000000), '₹15.00L');
    assert.equal(formatMoneyCompact(1500000), '₹15.0K');
  });

  test('rupeesToPaise correctly converts rupees to integer paise without float errors', () => {
    assert.equal(rupeesToPaise(100.5), 10050);
    assert.equal(rupeesToPaise('499.99'), 49999);
    assert.equal(rupeesToPaise(0), 0);
  });

  test('calculateCommission computes exact integer platform cut', () => {
    // 12% on ₹1,000 (100000 paise) = ₹120 (12000 paise)
    assert.equal(calculateCommission(100000, 0.12), 12000);
    // 10% on ₹1,499 (149900 paise) = ₹149.90 (14990 paise)
    assert.equal(calculateCommission(149900, 0.1), 14990);
  });
});
