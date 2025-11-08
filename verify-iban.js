const { isValidIBAN } = require('ibantools');

// IBAN z console logu
const iban = 'CZ6408000000001790815013';
console.log('IBAN:', iban);
console.log('Valid:', isValidIBAN(iban));
console.log('');

// Ověřme ruční výpočet
// Account: 1790815013/0800
// Prefix: none (0)
// Account: 1790815013
// Bank: 0800

const bankCode = '0800';
const prefix = '000000';
const account = '1790815013';

const bban = bankCode + prefix + account;
console.log('BBAN:', bban);
console.log('BBAN length:', bban.length);

// Check digit calculation
// Move CZ to end and replace with numbers: C=12, Z=35
const numericIBAN = bban + '1235' + '00';
console.log('Numeric IBAN for calc:', numericIBAN);

const remainder = BigInt(numericIBAN) % BigInt(97);
const checkDigits = (BigInt(98) - remainder).toString().padStart(2, '0');
console.log('Check digits:', checkDigits);
console.log('Final IBAN:', `CZ${checkDigits}${bban}`);
console.log('');

// Test s ibantools
const { electronicFormatIBAN } = require('ibantools');
console.log('Electronic format:', electronicFormatIBAN(iban));
