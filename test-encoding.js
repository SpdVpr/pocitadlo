// Test encoding and character codes
const our = 'SPD*1.0*ACC:CZ6508000000192000145399*AM:2500.00*CC:CZK*X-VS:20250002';
const example = 'SPD*1.0*ACC:CZ7603000000000076327632*AM:200.00*CC:CZK*X-VS:1234567890*MSG:CLOVEK V TISNI';

console.log('=== Our string ===');
console.log('String:', our);
console.log('Length:', our.length);
console.log('First 10 chars:', our.substring(0, 10).split('').map(c => c.charCodeAt(0)));
console.log('');

console.log('=== Example string ===');
console.log('String:', example);
console.log('Length:', example.length);
console.log('First 10 chars:', example.substring(0, 10).split('').map(c => c.charCodeAt(0)));
console.log('');

console.log('=== Comparison ===');
console.log('First 10 chars match:', our.substring(0, 10) === example.substring(0, 10));
console.log('Our prefix:', our.substring(0, 8));
console.log('Example prefix:', example.substring(0, 8));
console.log('Prefix match:', our.substring(0, 8) === example.substring(0, 8));
console.log('');

// Check for special characters
console.log('=== Character analysis ===');
for (let i = 0; i < Math.min(20, our.length); i++) {
  const ourChar = our[i];
  const ourCode = ourChar.charCodeAt(0);
  console.log(`Position ${i}: '${ourChar}' (${ourCode})`);
}

