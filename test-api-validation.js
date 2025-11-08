// Test API validation
const https = require('https');

function validateSPAYD(spaydString) {
  const url = `https://api.paylibo.com/paylibo/validator/string?paymentString=${encodeURIComponent(spaydString)}`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ valid: true, data: JSON.parse(data) });
        } else {
          try {
            const errorData = JSON.parse(data);
            resolve({ valid: false, errors: errorData.errors || [] });
          } catch (e) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function test() {
  // Test 1: Example from documentation
  console.log('=== Test 1: Example from qr-platba.cz ===');
  const test1 = 'SPD*1.0*ACC:CZ7603000000000076327632*AM:200.00*CC:CZK*X-VS:1234567890*MSG:CLOVEK V TISNI';
  console.log('String:', test1);
  try {
    const result1 = await validateSPAYD(test1);
    console.log('Valid:', result1.valid);
    if (!result1.valid) {
      console.log('Errors:', result1.errors);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
  console.log('');
  
  // Test 2: Our format without trailing asterisk
  console.log('=== Test 2: Our format (no trailing asterisk) ===');
  const test2 = 'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK*X-VS:20250002';
  console.log('String:', test2);
  try {
    const result2 = await validateSPAYD(test2);
    console.log('Valid:', result2.valid);
    if (!result2.valid) {
      console.log('Errors:', result2.errors);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
  console.log('');
  
  // Test 3: Our format WITH trailing asterisk
  console.log('=== Test 3: Our format (WITH trailing asterisk) ===');
  const test3 = 'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK*X-VS:20250002*';
  console.log('String:', test3);
  try {
    const result3 = await validateSPAYD(test3);
    console.log('Valid:', result3.valid);
    if (!result3.valid) {
      console.log('Errors:', result3.errors);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
  console.log('');
  
  // Test 4: Minimal format
  console.log('=== Test 4: Minimal format (only required fields) ===');
  const test4 = 'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK';
  console.log('String:', test4);
  try {
    const result4 = await validateSPAYD(test4);
    console.log('Valid:', result4.valid);
    if (!result4.valid) {
      console.log('Errors:', result4.errors);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

test();

