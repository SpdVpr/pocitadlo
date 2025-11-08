function czechAccountToIBAN(accountNumber) {
  const cleaned = accountNumber.replace(/\s/g, '');

  if (cleaned.match(/^CZ\d{22}$/)) {
    return cleaned;
  }

  const match = cleaned.match(/^(?:(\d+)-)?(\d+)\/(\d+)$/);
  if (!match) {
    console.warn('Invalid account number format');
    return '';
  }

  const prefix = (match[1] || '0').padStart(6, '0');
  const account = match[2].padStart(10, '0');
  const bankCode = match[3].padStart(4, '0');

  const bban = bankCode + prefix + account;

  const numericIBAN = bban + '1235' + '00';
  let remainder = BigInt(numericIBAN) % BigInt(97);
  const checkDigits = (BigInt(98) - remainder).toString().padStart(2, '0');

  return `CZ${checkDigits}${bban}`;
}

// Testovací případy
console.log('Test 1: 123/0600');
console.log(czechAccountToIBAN('123/0600'));
console.log('Expected: CZ9106000000000000000123');
console.log('');

console.log('Test 2: 19-2000145399/0800');
console.log(czechAccountToIBAN('19-2000145399/0800'));
console.log('Expected: CZ6508000000192000145399');
console.log('');

console.log('Test 3: 2000145399/0800');
console.log(czechAccountToIBAN('2000145399/0800'));
console.log('Expected: CZ6508000000002000145399');
console.log('');

// Ověření pomocí ibantools
const { isValidIBAN } = require('ibantools');

const testCases = [
  '123/0600',
  '19-2000145399/0800',
  '2000145399/0800',
  '1234567890/0100'
];

testCases.forEach(acc => {
  const iban = czechAccountToIBAN(acc);
  const valid = isValidIBAN(iban);
  console.log(`${acc} => ${iban} => ${valid ? 'VALID' : 'INVALID'}`);
});
