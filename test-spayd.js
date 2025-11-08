// Test @spayd/core library
const { createShortPaymentDescriptor } = require('@spayd/core');

console.log('=== Test 1: Correct parameters ===');
try {
  const result1 = createShortPaymentDescriptor({
    acc: 'CZ6508000000192000145399',
    am: 2500.00,
    cc: 'CZK',
    x: {
      vs: '20250002',
    },
  });
  console.log('Result:', result1);
  console.log('Length:', result1.length);
} catch (e) {
  console.log('Error:', e.message);
  console.log('Stack:', e.stack);
}

console.log('\n=== Test 2: Example from documentation ===');
try {
  const result2 = createShortPaymentDescriptor({
    acc: 'CZ7603000000000076327632',
    am: 200.00,
    cc: 'CZK',
    x: {
      vs: '1234567890',
    },
    msg: 'CLOVEK V TISNI',
  });
  console.log('Result:', result2);
  console.log('Length:', result2.length);
} catch (e) {
  console.log('Error:', e.message);
}

