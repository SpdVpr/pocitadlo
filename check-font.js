const fs = require('fs');
const path = require('path');

const regularPath = path.join(__dirname, 'public/fonts/Roboto-Regular.ttf');
const boldPath = path.join(__dirname, 'public/fonts/Roboto-Bold.ttf');

function checkFont(fontPath) {
  if (!fs.existsSync(fontPath)) {
    console.log(`${fontPath} does not exist`);
    return;
  }
  
  const buf = fs.readFileSync(fontPath);
  const firstBytes = buf.slice(0, 20).toString('hex');
  const size = buf.length;
  const isTTF = buf.slice(0, 4).toString('hex') === '00010000';
  
  console.log(`\nFont: ${path.basename(fontPath)}`);
  console.log(`Size: ${size} bytes (${(size / 1024).toFixed(2)} KB)`);
  console.log(`First 20 bytes: ${firstBytes}`);
  console.log(`Is valid TTF: ${isTTF}`);
  
  if (!isTTF) {
    console.log('First 100 chars as text:', buf.slice(0, 100).toString('utf8'));
  }
}

checkFont(regularPath);
checkFont(boldPath);
