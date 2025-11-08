// Test QR Payment String validation
function czechAccountToIBAN(accountNumber) {
  const cleaned = accountNumber.replace(/\s/g, '');
  
  if (cleaned.match(/^CZ\d{22}$/)) {
    return cleaned;
  }
  
  const match = cleaned.match(/^(?:(\d+)-)?(\d+)\/(\d+)$/);
  if (!match) {
    return '';
  }
  
  const prefix = (match[1] || '0').padStart(6, '0');
  const account = match[2].padStart(10, '0');
  const bankCode = match[3].padStart(4, '0');
  
  const bban = bankCode + prefix + account;
  const numericIBAN = bban + '1235' + '00';
  let remainder = BigInt(numericIBAN) % BigInt(97);
  const checkDigits = (BigInt(98) - remainder).toString().padStart(2, '0');
  
  return 'CZ' + checkDigits + bban;
}

// Test different formats
console.log('=== Test 1: Bez koncové hvězdičky ===');
const test1 = 'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK*X-VS:20250002';
console.log(test1);
console.log('Length:', test1.length);
console.log('');

console.log('=== Test 2: S koncovou hvězdičkou ===');
const test2 = 'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK*X-VS:20250002*';
console.log(test2);
console.log('Length:', test2.length);
console.log('');

console.log('=== Test 3: Příklad z dokumentace KB ===');
const test3 = 'SPD*1.0*ACC:CZ3301000000000002970297*AM:500.00*CC:CZK*DT:20221001';
console.log(test3);
console.log('Length:', test3.length);
console.log('');

console.log('=== Test 4: Příklad z qr-platba.cz ===');
const test4 = 'SPD*1.0*ACC:CZ9106000000000000000123*AM:450.00*CC:CZK*MSG:PLATBA ZA ZBOZI*X-VS:1234567890';
console.log(test4);
console.log('Length:', test4.length);
console.log('');

console.log('=== Test 5: Minimální verze ===');
const iban = czechAccountToIBAN('19-2000145399/0800');
const test5 = `SPD*1.0*ACC:${iban}*AM:2500.00*CC:CZK`;
console.log(test5);
console.log('Length:', test5.length);
console.log('');

console.log('=== Test 6: S VS ale bez koncové hvězdičky ===');
const test6 = `SPD*1.0*ACC:${iban}*AM:2500.00*CC:CZK*X-VS:20250002`;
console.log(test6);
console.log('Length:', test6.length);
console.log('');

console.log('=== Character validation ===');
const alphanumeric = /^[A-Z0-9 $%*+\-.\/:]*$/;
console.log('Test 1 valid:', alphanumeric.test(test1));
console.log('Test 2 valid:', alphanumeric.test(test2));
console.log('Test 3 valid:', alphanumeric.test(test3));
console.log('Test 4 valid:', alphanumeric.test(test4));
console.log('Test 5 valid:', alphanumeric.test(test5));
console.log('Test 6 valid:', alphanumeric.test(test6));

