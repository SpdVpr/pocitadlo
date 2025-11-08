// Test validator API directly
const https = require('https');

function validateSPAYD(spaydString, label) {
  const url = `https://api.paylibo.com/paylibo/validator/string?paymentString=${encodeURIComponent(spaydString)}`;
  
  console.log(`\n=== ${label} ===`);
  console.log('String:', spaydString);
  console.log('URL:', url);
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log('Valid: YES');
            console.log('Parsed data:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('Valid: YES (but could not parse JSON)');
          }
          resolve(true);
        } else {
          console.log('Valid: NO');
          try {
            const parsed = JSON.parse(data);
            console.log('Errors:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('Raw error:', data);
          }
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('Network error:', err.message);
      reject(err);
    });
  });
}

async function test() {
  // Test 1: Our string
  await validateSPAYD(
    'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK*X-VS:20250002',
    'Our string (no trailing asterisk)'
  );
  
  // Test 2: Example from documentation
  await validateSPAYD(
    'SPD*1.0*ACC:CZ7603000000000076327632*AM:200.00*CC:CZK*X-VS:1234567890*MSG:CLOVEK V TISNI',
    'Example from documentation'
  );
  
  // Test 3: Our string with trailing asterisk
  await validateSPAYD(
    'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK*X-VS:20250002*',
    'Our string (WITH trailing asterisk)'
  );
  
  // Test 4: Minimal
  await validateSPAYD(
    'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK',
    'Minimal (no VS)'
  );
}

test().catch(console.error);

