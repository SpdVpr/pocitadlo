const { createShortPaymentDescriptor } = require('@spayd/core');

// Přesně stejné hodnoty jako z console logu
try {
  const result = createShortPaymentDescriptor({
    acc: 'CZ6408000000001790815013',
    am: '300.00',
    cc: 'CZK',
    x: {
      vs: '15',
    },
  });
  console.log('Generated SPAYD:', result);
  console.log('Expected SPAYD:  SPD*1.0*ACC:CZ6408000000001790815013*AM:300.00*CC:CZK*X-VS:15');
  console.log('Match:', result === 'SPD*1.0*ACC:CZ6408000000001790815013*AM:300.00*CC:CZK*X-VS:15');
} catch (error) {
  console.log('ERROR:', error.message);
}

console.log('\n--- Testování malé částky ---');
try {
  const result2 = createShortPaymentDescriptor({
    acc: 'CZ6408000000001790815013',
    am: '0.50',
    cc: 'CZK',
    x: { vs: '15' },
  });
  console.log('OK:', result2);
} catch (error) {
  console.log('CHYBA (očekávaná):', error.message);
}

console.log('\n--- Testování VS začínající nulou ---');
try {
  const result3 = createShortPaymentDescriptor({
    acc: 'CZ6408000000001790815013',
    am: '300.00',
    cc: 'CZK',
    x: { vs: '015' },
  });
  console.log('OK:', result3);
} catch (error) {
  console.log('CHYBA (očekávaná):', error.message);
}

console.log('\n--- Test bez částky (pro šablonu) ---');
try {
  const result4 = createShortPaymentDescriptor({
    acc: 'CZ6408000000001790815013',
    cc: 'CZK',
    x: { vs: '15' },
  });
  console.log('OK (bez částky):', result4);
} catch (error) {
  console.log('CHYBA:', error.message);
}
