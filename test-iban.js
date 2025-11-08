// Test QR Payment String generation
function czechAccountToIBAN(accountNumber) {
  const cleaned = accountNumber.replace(/\s/g, '');

  if (cleaned.match(/^CZ\d{22}$/)) {
    return cleaned;
  }

  const match = cleaned.match(/^(?:(\d+)-)?(\d+)\/(\d+)$/);
  if (!match) {
    console.log('Invalid format');
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

function generateQRPaymentString(bankAccount, amount, variableSymbol) {
  const iban = czechAccountToIBAN(bankAccount);

  if (!iban) {
    console.log('Could not convert to IBAN');
    return '';
  }

  const amountStr = amount.toFixed(2);
  const vs = variableSymbol.toString().padStart(8, '0');

  // SPD format: SPD*version*ACC:iban*AM:amount*CC:currency*X-VS:variableSymbol*
  return `SPD*1.0*ACC:${iban}*AM:${amountStr}*CC:CZK*X-VS:${vs}*`;
}

// Test with example
console.log('=== Test QR Payment String ===');
const qrString = generateQRPaymentString('19-2000145399/0800', 2500.00, 20250002);
console.log('QR String:', qrString);
console.log('Length:', qrString.length);
console.log('\n=== Character check ===');
console.log('Contains only alphanumeric + allowed chars:', /^[A-Z0-9 $%*+\-.\/:]*$/.test(qrString));

