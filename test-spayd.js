const { createShortPaymentDescriptor } = require('@spayd/core');

// Test 1: Základní platba
try {
  const result1 = createShortPaymentDescriptor({
    acc: 'CZ6508000000192000145399',
    am: '450.00',
    cc: 'CZK',
    x: {
      vs: '1234567890',
    },
  });
  console.log('Test 1 OK:', result1);
} catch (error) {
  console.log('Test 1 CHYBA:', error.message);
}

// Test 2: Platba bez částky
try {
  const result2 = createShortPaymentDescriptor({
    acc: 'CZ6508000000192000145399',
    cc: 'CZK',
    x: {
      vs: '123',
    },
  });
  console.log('Test 2 OK:', result2);
} catch (error) {
  console.log('Test 2 CHYBA:', error.message);
}

// Test 3: Částka menší než 1
try {
  const result3 = createShortPaymentDescriptor({
    acc: 'CZ6508000000192000145399',
    am: '0.50',
    cc: 'CZK',
    x: {
      vs: '123',
    },
  });
  console.log('Test 3 OK:', result3);
} catch (error) {
  console.log('Test 3 CHYBA:', error.message);
}

// Test 4: VS začínající nulou
try {
  const result4 = createShortPaymentDescriptor({
    acc: 'CZ6508000000192000145399',
    am: '450.00',
    cc: 'CZK',
    x: {
      vs: '0123',
    },
  });
  console.log('Test 4 OK:', result4);
} catch (error) {
  console.log('Test 4 CHYBA:', error.message);
}
